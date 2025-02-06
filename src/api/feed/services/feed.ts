import {factories} from '@strapi/strapi';

export default factories.createCoreService('api::feed.feed', ({strapi}) => ({
    async findOne(params) {
        console.log("params", params);
        const {documentId, slug, userToken} = params;

        const filters: any = {};

        if (documentId !== undefined) filters.documentId = {$eq: documentId};
        if (slug !== undefined) filters.slug = {$eq: slug};

        const result: any = await strapi.documents('api::feed.feed').findFirst({
            filters: filters,
            populate: ['allowed_users'],
        });

        console.log("result", result);

        if (!result) return null;

        // public feed, just return
        if (result.public) return result.data;

        // private feed, but no user token passed
        if (!userToken) return null;

        // private feed, but user token does not have access
        if (!result.allowed_users.some(user => user.token === userToken)) return null;

        return result.data;
    },
}));
