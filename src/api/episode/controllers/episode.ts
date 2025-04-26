/**
 * episode controller
 */

import {factories} from '@strapi/strapi'
import packageJson from "../../../../package.json"

export default factories.createCoreController('api::episode.episode', ({strapi}) => ({
    async download(ctx) {
        const {guid} = ctx.params;
        const {token} = ctx.query;

        // Assuming 'guid' variable is defined and holds the GUID you want to find
        if (!guid) {
            return ctx.badRequest('GUID parameter is missing');
        }

        const results = await strapi.entityService.findMany('api::episode.episode', {
            filters: {guid: guid},
            populate: {
                feeds: {
                    populate: ['allowed_users'],
                },
                audio: true
            },
            limit: 1
        });

        const episode = results.length > 0 ? results[0] : null;
        if (!episode) {
            return ctx.notFound('Episode not found');
        }

        // Check if user has access to at least one feed this episode belongs to
        let hasAccess = false;

        // @ts-ignore
        for (const feed of episode.feeds) {
            // Public feeds are accessible to everyone
            if (feed.public) {
                hasAccess = true;
                break;
            }

            // For private feeds, check if user token is in allowed_users
            if (token && feed.allowed_users?.some(user => user.token === token)) {
                hasAccess = true;
                break;
            }
        }

        // If no access, return 403
        if (!hasAccess) {
            return ctx.forbidden('You do not have access to this audio file');
        }

        // Track download with Umami if configured
        try {
            const umamiUrl = process.env.UMAMI_URL;
            const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID;

            if (umamiUrl && umamiWebsiteId) {
                // Format episode title as URL slug
                const episodeSlug = episode.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

                // Send event to Umami with correct payload structure using native fetch
                fetch(umamiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64;) PodcastHub/${packageJson.version}`
                    },
                    body: JSON.stringify({
                        type: "event",
                        payload: {
                            hostname: "umami.lucanerlich.com",
                            language: "de-DE",
                            referrer: `/episode/${episodeSlug}`,
                            screen: "1920x1080",
                            title: episode.title,
                            url: `/episode/${episodeSlug}`,
                            website: umamiWebsiteId,
                            name: `episode_${episodeSlug}`,
                            data: {
                                episode_guid: guid,
                                title: episode.title
                            }
                        }
                    })
                }).catch(err => {
                    // Log error but continue serving the file
                    console.error('Error tracking download with Umami:', err.message);
                });
                // Note: We're not awaiting the fetch since we don't want to
                // delay serving the file if analytics is slow
            }
        } catch (error) {
            // Just log the error, but continue serving the file
            console.error('Error during analytics tracking:', error);
        }

        try {
            // @ts-ignore
            const file = episode.audio;
            const {provider} = strapi.plugins.upload;
            const signedUrlData = await provider.getSignedUrl(file);
            ctx.redirect(signedUrlData.url);
        } catch (error) {
            console.error('Error streaming audio file:', error);
            return ctx.internalServerError('Error streaming audio file');
        }
    }
}));
