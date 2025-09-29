export default {
    routes: [
        {
            method: 'GET',
            path: '/episodes/:guid',
            handler: 'episode.fetch',
            config: {
                auth: false, // Allow unauthenticated access, the controller will handle permissions
            },
        },
        {
            method: 'GET',
            path: '/episodes/:guid/download',
            handler: 'episode.download',
            config: {
                auth: false, // Allow unauthenticated access, the controller will handle permissions
            },
        },
        {
            method: 'GET',
            path: '/episodes/:guid/download.:extension', // apple podcasts needs a .mp3 file extension for each enlosure
            handler: 'episode.download',
            config: {
                auth: false, // Allow unauthenticated access, the controller will handle permissions
            },
        },
    ],
};
