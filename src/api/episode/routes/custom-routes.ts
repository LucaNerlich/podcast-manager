export default {
    routes: [
        {
            method: 'GET',
            path: '/episodes/:id/download',
            handler: 'episode.download',
            config: {
                auth: false, // Allow unauthenticated access, the controller will handle permissions
            },
        },
    ],
};
