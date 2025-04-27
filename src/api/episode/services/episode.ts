import {factories} from '@strapi/strapi';

// @ts-ignore
export default factories.createCoreService('api::episode.episode', ({strapi}) => ({
    async findOne(guid, token) {
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
            return undefined;
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
            return {};
        }

        return episode;
    },
}));
