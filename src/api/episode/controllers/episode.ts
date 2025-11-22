import {factories} from '@strapi/strapi'
import {track} from "../../../utils/umami";

export default factories.createCoreController('api::episode.episode', ({strapi}) => ({
    async fetch(ctx) {
        const {guid} = ctx.params;
        // set in feed controller -> processXmlWithToken
        const {token} = ctx.query as { token?: string };
        const normalizedToken = token.replace(/\.mp3$/i, '');

        if (!guid) {
            return ctx.badRequest('GUID parameter is missing');
        }

        const episode = await strapi.service('api::episode.episode').findOne(guid, normalizedToken);

        // Track download with Umami
        track("episode-fetch", episode?.title, guid)

        try {
            ctx.response.type = 'application/json';
            ctx.send(episode);
        } catch (error) {
            console.error('Error streaming audio file:', error);
            return ctx.internalServerError('Error streaming audio file');
        }
    },
    async download(ctx) {
        const {guid} = ctx.params;
        // set in feed controller -> processXmlWithToken
        const {token} = ctx.query as { token?: string };
        const normalizedToken = token.replace(/\.mp3$/i, '');

        if (!guid) {
            return ctx.badRequest('GUID parameter is missing');
        }

        const episode = await strapi.service('api::episode.episode').findOne(guid, normalizedToken);

        if (!episode) {
            return ctx.notFound();
        }

        // Track download with Umami
        track("episode-download", episode.title, guid)

        try {
            // @ts-ignore
            const file = episode.audio;
            // const {provider} = strapi.plugins.upload;
            // const signedUrlData = await provider.getSignedUrl(file);
            ctx.redirect(file.url);
        } catch (error) {
            console.error('Error streaming audio file:', error);
            return ctx.internalServerError('Error streaming audio file');
        }
    }
}));
