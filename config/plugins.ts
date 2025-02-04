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
        },
    },
});
