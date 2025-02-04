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

    function isSelf(ctx): boolean {
        const {id} = ctx.params;
        const {id: currentUserId} = ctx.state.user;
        return id.toString() === currentUserId.toString()
    }

    // Only allow changes to yourself
    plugin.controllers.user.update = async (ctx) => {
        if (!isSelf(ctx)) {
            return ctx.unauthorized("You can only update your own profile.");
        }

        const {id} = ctx.params;
        const response = await strapi.entityService.update('plugin::users-permissions.user', id, {
            data: {
                ...ctx.request.body,
                // prevent overwriting of blocked and token
                blocked: ctx.state.user.blocked,
                token: ctx.state.user.token,
            },
        });

        return sanitizeOutput(response);
    };

    // Add a custom controller to set a new token
    plugin.controllers.user.newToken = async (ctx) => {
        if (!isSelf(ctx)) {
            return ctx.unauthorized("You can only update your own profile.");
        }

        const {id} = ctx.params;
        const response = await strapi.entityService.update('plugin::users-permissions.user', id, {
            data: {
                ...ctx.state.user,
                // set a new token
                token: crypto.randomUUID(),
            },
        });

        return sanitizeOutput(response);
    };

    // Add the custom newToken route
    plugin.routes['content-api'].routes.unshift({
        method: 'PUT',
        path: '/users/:id/newToken',
        handler: 'user.newToken',
        config: {
            prefix: ''
        }
    });

    return plugin;
};
