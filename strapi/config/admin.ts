export default ({env}) => ({
    auth: {
        secret: env('ADMIN_JWT_SECRET'),
    },
    watchIgnoreFiles: [
        '**/config/sync/**',
    ],
    apiToken: {
        salt: env('API_TOKEN_SALT'),
    },
    transfer: {
        token: {
            salt: env('TRANSFER_TOKEN_SALT'),
        },
    },
    flags: {
        nps: false,
        promoteEE: false,
    },
});
