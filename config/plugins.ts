// return boolean from string
function getBoolean(value) {
    switch (value) {
        case true:
        case 'true':
        case 1:
        case '1':
        case 'on':
        case 'yes':
            return true
        default:
            return false
    }
}

const {env} = require('@strapi/utils')

export default () => ({
    'users-permissions': {
        config: {
            jwtManagement: env('UP_JWT_MANAGEMENT', 'refresh'),
            sessions: {
                accessTokenLifespan: env.int('UP_SESSIONS_ACCESS_TTL', 7 * 24 * 60 * 60),
                maxRefreshTokenLifespan: env.int('UP_SESSIONS_MAX_REFRESH_TTL', 30 * 24 * 60 * 60),
                idleRefreshTokenLifespan: env.int('UP_SESSIONS_IDLE_REFRESH_TTL', 7 * 24 * 60 * 60),
                httpOnly: env.bool('UP_SESSIONS_HTTPONLY', false),
                cookie: {
                    name: env('UP_SESSIONS_COOKIE_NAME', 'strapi_up_refresh'),
                    sameSite: env('UP_SESSIONS_COOKIE_SAMESITE', 'lax'),
                    path: env('UP_SESSIONS_COOKIE_PATH', '/'),
                    domain: env('UP_SESSIONS_COOKIE_DOMAIN', 'podcasthub.org'),
                    secure: env.bool('UP_SESSIONS_COOKIE_SECURE', false),
                },
            },
        },
    },
    upload: {
        enabled: true,
        config: {
            provider: 'aws-s3',
            providerOptions: {
                s3Options: {
                    credentials: {
                        accessKeyId: env('AWS_ACCESS_KEY_ID'),
                        secretAccessKey: env('AWS_ACCESS_SECRET'),
                    },
                    region: env('AWS_REGION'),
                    params: {
                        Bucket: getBoolean(env('USE_TEST_BUCKET')) ? env('AWS_BUCKET_TEST') : env('AWS_BUCKET'),
                    },
                },
            },
            sizeLimit: 5737418240,
        },
    },
});
