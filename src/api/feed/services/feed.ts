import {factories} from '@strapi/strapi';

export default factories.createCoreService('api::feed.feed', ({strapi}) => ({
    async findOne(params) {
        console.log("params", params);
        const {documentId, slug, userToken} = params;
        const query: any = {};

        let filters: any = {};

        if (documentId !== undefined) filters.documentId = {$eq: documentId};
        if (slug !== undefined) filters.slug = {$eq: slug};
        if (userToken !== undefined) filters.userToken = userToken;

        console.log("filters", filters);
        const result: any = await strapi.documents('api::feed.feed').findFirst({
            filters: filters,
            populate: ['allowed_users'],
        });

        console.log("result", result);

        // if (documentId !== undefined) query.documentId = documentId;
        // if (slug !== undefined) query.slug = slug;
        // if (userToken !== undefined) query.userToken = userToken;


        // const result = await strapi.documents('api::feed.feed').findFirst({
        //     filters: {
        //     }
        // })
        const entity = await strapi.db.query('api::feed.feed').findOne({where: query});
        console.log("entity", entity);
        return result;
    },
}));
