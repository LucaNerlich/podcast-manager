import {factories} from '@strapi/strapi'
import {track} from "../../../utils/umami";

export default factories.createCoreController('api::episode.episode', ({strapi}) => ({
    async fetch(ctx) {
        const {guid} = ctx.params;
        // set in feed controller -> processXmlWithToken
        const {token} = ctx.query;

        if (!guid) {
            return ctx.badRequest('GUID parameter is missing');
        }

        const episode2 = await strapi.service('api::episode.episode').findOne(guid, token);
        console.log("episodeee", episode2);

        const results = await strapi.entityService.findMany('api::episode.episode', {
            filters: {guid: guid},
            populate: {
                feeds: {
                    populate: ['allowed_users'],
                },
                audio: true
            },
            limit: 1
        });

        const episode = results.length > 0 ? results[0] : null;
        if (!episode) {
            return ctx.notFound('Episode not found');
        }

        // Check if user has access to at least one feed this episode belongs to
        let hasAccess = false;

        // @ts-ignore
        for (const feed of episode.feeds) {
            // Public feeds are accessible to everyone
            if (feed.public) {
                hasAccess = true;
                break;
            }

            // For private feeds, check if user token is in allowed_users
            if (token && feed.allowed_users?.some(user => user.token === token)) {
                hasAccess = true;
                break;
            }
        }

        // If no access, return 403
        if (!hasAccess) {
            return ctx.forbidden('You do not have access to this audio file');
        }

        // Track download with Umami
        track("episode-fetch", episode.title, guid)

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
        const {token} = ctx.query;

        if (!guid) {
            return ctx.badRequest('GUID parameter is missing');
        }

        const results = await strapi.entityService.findMany('api::episode.episode', {
            filters: {guid: guid},
            populate: {
                feeds: {
                    populate: ['allowed_users'],
                },
                audio: true
            },
            limit: 1
        });

        const episode = results.length > 0 ? results[0] : null;
        if (!episode) {
            return ctx.notFound('Episode not found');
        }

        // Check if user has access to at least one feed this episode belongs to
        let hasAccess = false;

        // @ts-ignore
        for (const feed of episode.feeds) {
            // Public feeds are accessible to everyone
            if (feed.public) {
                hasAccess = true;
                break;
            }

            // For private feeds, check if user token is in allowed_users
            if (token && feed.allowed_users?.some(user => user.token === token)) {
                hasAccess = true;
                break;
            }
        }

        // If no access, return 403
        if (!hasAccess) {
            return ctx.forbidden('You do not have access to this audio file');
        }

        // Track download with Umami
        track("episode-download", episode.title, guid)

        try {
            // @ts-ignore
            const file = episode.audio;
            const {provider} = strapi.plugins.upload;
            const signedUrlData = await provider.getSignedUrl(file);
            ctx.redirect(signedUrlData.url);
        } catch (error) {
            console.error('Error streaming audio file:', error);
            return ctx.internalServerError('Error streaming audio file');
        }
    }
}));
