import type {Core} from '@strapi/strapi';

export default {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     *
     * This gives you an opportunity to extend code.
     */
    register(/* { strapi }: { strapi: Core.Strapi } */) {
    },

    /**
     * An asynchronous bootstrap function that runs before
     * your application gets started.
     *
     * This gives you an opportunity to set up your data model,
     * run jobs, or perform some special logic.
     */
    bootstrap({strapi}: { strapi: Core.Strapi }) {
        // https://forum.strapi.io/t/strapi-create-new-user-users-permissions-plugin-lifecycles/13386/3
        strapi.db.lifecycles.subscribe({
            models: ['plugin::users-permissions.user'],
            // Generate and add token to new users
            async beforeCreate(event) {
                event.params.data.token = crypto.randomUUID();
            },
        });
    },
};
