import {RateLimit} from "koa2-ratelimit";
import type {Core} from "@strapi/strapi";
import {Context, Next} from "koa";

// https://strapi.io/blog/how-to-set-up-rate-limiting-in-strapi-best-practices-and-examples
export default (_config: any, {}: { strapi: Core.Strapi }) => {
    return async (ctx: Context, next: Next) => {
        return RateLimit.middleware({
            interval: {
                min: 1
            },
            max: 100, // limit each IP to 100 requests per minute
            message: "Too many requests, please try again later.",
            headers: true,
        })(ctx, next);
    };
};
