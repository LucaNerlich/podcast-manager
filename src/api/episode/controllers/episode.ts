/**
 * episode controller
 */

import {factories} from '@strapi/strapi'
import {track} from "../../../utils/umami";

export default factories.createCoreController('api::episode.episode', ({strapi}) => ({
    async download(ctx) {
        const {guid} = ctx.params;
        const {token} = ctx.query;

        // Assuming 'guid' variable is defined and holds the GUID you want to find
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

        /* todo @fix me, of course, when simplify opening this url, the user is not passing any authentication ...
        // todo the download url needs to also contain the userToken, but how?
            then id need to dynamically add the token to the url on feed request
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
        */

        // Track download with Umami
        track("episode", episode.title, guid)

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
