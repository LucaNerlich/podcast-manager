export default ({env}) => ({
    auth: {
        secret: env('ADMIN_JWT_SECRET', '47e7ea9786c3576e3c3ee7632h4ddd0a'),
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
