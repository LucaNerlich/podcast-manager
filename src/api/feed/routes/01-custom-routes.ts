export default {
    // https://docs.strapi.io/dev-docs/backend-customization/routes#creating-custom-routers
    routes: [
        {
            method: 'GET',
            path: '/feeds/documentId/:documentId',
            handler: 'feed.findByDocumentId',
        },
        {
            method: 'GET',
            path: '/feeds/slug/:slug',
            handler: 'feed.findBySlug',
        },
        {
            method: 'GET',
            path: '/feeds/documentId/:documentId/token/:userToken',
            handler: 'feed.findByDocumentIdAndUserToken',
        },
        {
            method: 'GET',
            path: '/feeds/slug/:slug/token/:userToken',
            handler: 'feed.findBySlugAndUserToken',
        },
    ],
}
