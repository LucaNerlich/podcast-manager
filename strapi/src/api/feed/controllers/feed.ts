import {factories} from '@strapi/strapi'

export default factories.createCoreController('api::feed.feed', ({strapi}) => ({

    // finds by documentId
    async findOne(ctx) {
        await this.validateQuery(ctx)
        const url = new URL('http://localhost:1337' + ctx.request.url);
        const urlSearchParams = new URLSearchParams(url.search);

        const response = await strapi.documents('api::feed.feed').findOne({
            // get document id from request url
            documentId: url.pathname.split('/api/feeds/')[1],
            populate: ['episodes', 'allowed_users'],
        });

        if (response.public) {
            delete response.allowed_users;
            return response;
        }

        if (!urlSearchParams.has('token')) {
            return ctx.forbidden("You need to pass your token as a query parameter 'token' to access this feed.");
        }

        const isAllowed = response.allowed_users?.some(
            (user) => {
                return user.token === urlSearchParams.get('token');
            }
        );

        if (!isAllowed) {
            return ctx.forbidden("You do not have access to this feed.");
        }

        delete response.allowed_users;
        return response;
    }
}));
