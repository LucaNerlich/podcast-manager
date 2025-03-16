import {factories} from '@strapi/strapi'

export default factories.createCoreController('api::feed.feed', ({strapi}) => ({

    // finds by documentId
    async findOne(ctx) {
        await this.validateQuery(ctx)
        const baseUrl = 'http://localhost:1337';
        const requestUrl = new URL(baseUrl + ctx.request.url);
        const searchParams = new URLSearchParams(requestUrl.search);
        const feedId = requestUrl.pathname.split('/api/feeds/')[1];


        const feed = await strapi.documents('api::feed.feed').findOne({
            // get document id from request url
            documentId: feedId,
            populate: ['episodes', 'allowed_users'],
        });

        if (feed.public) {
            delete feed.allowed_users;
            return feed;
        }

        if (!searchParams.has('token')) {
            return ctx.forbidden("You need to pass your token as a query parameter 'token' to access this feed.");
        }

        const token = searchParams.get('token');
        if (!feed.allowed_users.some(user => user.token === token)) {
            return ctx.forbidden("You do not have access to this feed.");
        }

        delete feed.allowed_users;
        return feed;
    },

    async findByDocumentId(ctx) {
        const {documentId} = ctx.params;
        const entity = await strapi.service('api::feed.feed').findOne({documentId});
        ctx.response.type = 'application/xml';
        return entity ? ctx.send(entity) : ctx.notFound();
    },

    async findBySlug(ctx) {
        const {slug} = ctx.params;
        const entity = await strapi.service('api::feed.feed').findOne({slug});
        ctx.response.type = 'application/xml';
        return entity ? ctx.send(entity) : ctx.notFound();
    },

    async findByDocumentIdAndUserToken(ctx) {
        const {documentId, userToken} = ctx.params;
        const entity = await strapi.service('api::feed.feed').findOne({documentId, userToken});
        ctx.response.type = 'application/xml';
        return entity ? ctx.send(entity) : ctx.notFound();
    },

    async findBySlugAndUserToken(ctx) {
        const {slug, userToken} = ctx.params;
        const entity = await strapi.service('api::feed.feed').findOne({slug, userToken});
        ctx.response.type = 'application/xml';
        return entity ? ctx.send(entity) : ctx.notFound();
    },

    async findPublic(ctx) {
        const entity = await strapi.service('api::feed.feed').findPublic();
        return entity ? ctx.send(entity) : ctx.notFound();
    },

    async list(ctx) {
        try {
            // Check if request is authenticated
            const user = ctx.state.user;
            
            // Get feeds based on authentication status
            const feeds = await strapi.service('api::feed.feed').findAll(user);
            
            // Return the list of feeds
            return ctx.send({
                status: 'success',
                data: feeds
            });
        } catch (error) {
            return ctx.badRequest('An error occurred while fetching feeds');
        }
    },
}));
