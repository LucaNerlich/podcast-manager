import type {StrapiApp} from '@strapi/strapi/admin';
// @ts-ignore
import favicon from "../../assets/favicon.png"

export default {
    config: {
        head: {
            favicon: favicon,
        },
        notifications: {
            releases: false
        },
        tutorials: false
    },
    bootstrap(app: StrapiApp) {
    },
};
