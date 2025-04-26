export default {
    routes: [
        {
            method: 'GET',
            path: '/episodes/:guid/download',
            handler: 'episode.download',
            config: {
                auth: false, // Allow unauthenticated access, the controller will handle permissions
            },
        },
    ],
};
