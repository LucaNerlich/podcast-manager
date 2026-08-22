module.exports = (plugin) => {
    const {yup, validateYupSchema} = require('@strapi/utils');

    // Same shape as the stock users-permissions update validation:
    // only profile fields are user-editable. Everything else (role, confirmed,
    // blocked, feeds, token) must never be settable through this endpoint.
    const updateUserBodySchema = yup.object().shape({
        username: yup.string().min(3),
        email: yup.string().email().min(6),
        password: yup.string().min(6),
    });
    const validateUpdateUserBody = validateYupSchema(updateUserBodySchema);

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
        await validateUpdateUserBody(ctx.request.body);

        // Build the update from an explicit allow-list instead of spreading
        // ctx.request.body, so users cannot mass-assign relations or flags
        // (e.g. feeds -> grant themselves access to private feeds, role, confirmed).
        const updateData: Record<string, unknown> = {};
        if (ctx.request.body.username !== undefined) {
            updateData.username = ctx.request.body.username;
        }
        if (ctx.request.body.email !== undefined) {
            updateData.email = ctx.request.body.email.toLowerCase();
        }
        if (ctx.request.body.password) {
            updateData.password = ctx.request.body.password;
        }

        if (updateData.email !== undefined) {
            const userWithSameEmail = await strapi.query('plugin::users-permissions.user').findOne({
                where: {email: updateData.email as string},
            });
            if (userWithSameEmail && userWithSameEmail.id.toString() !== id.toString()) {
                return ctx.badRequest('Email already taken');
            }
        }

        if (updateData.username !== undefined) {
            const userWithSameUsername = await strapi.query('plugin::users-permissions.user').findOne({
                where: {username: updateData.username as string},
            });
            if (userWithSameUsername && userWithSameUsername.id.toString() !== id.toString()) {
                return ctx.badRequest('Username already taken');
            }
        }

        const response = await strapi.entityService.update('plugin::users-permissions.user', id, {
            data: updateData,
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
