import {factories} from '@strapi/strapi';

export default factories.createCoreService('api::feed.feed', ({strapi}) => ({
    async findOne(params) {
        const {documentId, slug, userToken} = params;

        const filters: any = {};

        if (documentId !== undefined) filters.documentId = {$eq: documentId};
        if (slug !== undefined) filters.slug = {$eq: slug};

        const result: any = await strapi.documents('api::feed.feed').findFirst({
            filters: filters,
            fields: ['data', 'public'],
            populate: ['allowed_users'],
        });

        // no feed found
        if (!result) return null;

        // public feed, just return
        if (result.public) return result.data;

        // private feed, but no user token passed
        if (!userToken) return null;

        // private feed, but user token does not have access
        if (!result.allowed_users.some(user => user.token === userToken)) return null;

        return result.data;
    },

    async findPublic() {
        const feeds = await strapi.documents('api::feed.feed').findMany({
            filters: {
                public: true,
            },
            // @ts-ignore
            fields: ['title', 'slug', 'documentId'],
        });

        return feeds.map(feed => {
            return {
                title: feed.title,
                slug: feed.slug,
                url: `https://podcastmanager.lucanerlich.com/api/feeds/documentId/${feed.documentId}`,
            };
        })
    },

    async findAll(user = null) {
        // For non-authenticated users, show only public feeds
        if (!user) {
            return this.findPublic();
        }

        // For authenticated users, get all public feeds
        const publicFeeds = await strapi.documents('api::feed.feed').findMany({
            filters: {
                public: true,
            },
            // @ts-ignore
            fields: ['title', 'slug', 'documentId'],
        });

        // Get private feeds the user has access to
        const privateFeeds = await strapi.documents('api::feed.feed').findMany({
            filters: {
                public: false,
                allowed_users: {
                    id: user.id
                }
            },
            // @ts-ignore
            fields: ['title', 'slug', 'documentId'],
        });

        // Combine and format all accessible feeds
        const allFeeds = [...publicFeeds, ...privateFeeds];
        
        return allFeeds.map(feed => {
            return {
                title: feed.title,
                slug: feed.slug,
                documentId: feed.documentId,
                url: `https://podcastmanager.lucanerlich.com/api/feeds/documentId/${feed.documentId}`,
            };
        });
    }
}));
