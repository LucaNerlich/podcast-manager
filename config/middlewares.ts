export default [
    'strapi::logger',
    'strapi::errors',
    {
        name: 'strapi::security',
        config: {
            contentSecurityPolicy: {
                directives: {
                    'script-src': ['\'self\'', '\'unsafe-inline\''],
                    'img-src': ['blob:', '\'self\'', 'data:', 'market-assets.strapi.io', 'strapi.io', 'strapi-cffc-test.s3.eu-central-1.amazonaws.com', 'strapi-cffc.s3.eu-central-1.amazonaws.com', 'dl.airtable.com'],
                },
            },
        },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
];
