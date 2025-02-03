module.exports = (plugin) => {
    const sanitizeOutput = (user) => {
        delete user.blocked;
        delete user.confirmationToken;
        delete user.confirmed;
        delete user.documentId;
        delete user.password;
        delete user.provider;
        delete user.publishedAt;
        delete user.resetPasswordToken;
        delete user['locale'];
        return user;
    };

    plugin.controllers.user.update = async (ctx) => {
        const {id} = ctx.params;
        const {id: currentUserId} = ctx.state.user;

        // Check if the user is trying to update their own profile
        if (id.toString() !== currentUserId.toString()) {
            return ctx.unauthorized("You can only update your own profile.");
        }

        // If it passes the check, proceed with the update
        const response = await strapi.entityService.update('plugin::users-permissions.user', id, {
            data: {
                ...ctx.request.body,
                // reuse token from user, request body token has been deleted in beforeUpdate lifecycle hook
                token: ctx.state.user.token,
            },
        });

        return sanitizeOutput(response);
    };

    return plugin;
};
