export default ({env}) => ({
    auth: {
        secret: env('ADMIN_JWT_SECRET', '47e7ea9786c3576e3c3ee7632h4ddd0a'),
        sessions: {
            accessTokenLifespan: 1800,
            maxRefreshTokenLifespan: 30 * 24 * 60 * 60,
            idleRefreshTokenLifespan: 7 * 24 * 60 * 60,
            maxSessionLifespan: 7 * 24 * 60 * 60,
            idleSessionLifespan: 3600,
        },
        cookie: {
            sameSite: 'lax',
            path: '/admin',
            domain: env('BASE_DOMAIN', 'podcasthub.org'),
        },
    },
    watchIgnoreFiles: [
        '**/config/sync/**',
    ],
    apiToken: {
        salt: env('API_TOKEN_SALT', '581f377575a900ea9bd3f9b68a947c9a'),
    },
    transfer: {
        token: {
            salt: env('TRANSFER_TOKEN_SALT', 'abgCaErxoNdy4e8YFrHRabgCaEaxoNdy4e8YFrHR'),
        },
    },
    flags: {
        nps: false,
        promoteEE: false,
    },
});
