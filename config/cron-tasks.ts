export default {
    generateFeeds: {
        task: ({strapi}) => {
            console.log("Re-Generating feeds");
        },
        options: {
            rule: "*/5 * * * *", // every 5 minutes
        },
    },
};
