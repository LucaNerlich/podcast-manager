/**
 * episode controller
 */

import {factories} from '@strapi/strapi'
import axios from 'axios';

export default factories.createCoreController('api::episode.episode', ({strapi}) => ({
    async download(ctx) {
        const {id} = ctx.params;
        const {token} = ctx.query;

        // Find the episode
        const episode = await strapi.documents('api::episode.episode').findOne({
            documentId: id,
            // @ts-ignore
            populate: {
                feeds: {
                    populate: ['allowed_users'],
                },
                audio: true
            },
        });

        // If episode not found, return 404
        if (!episode) {
            return ctx.notFound('Episode not found');
        }

        // Check if user has access to at least one feed this episode belongs to
        let hasAccess = false;

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

                // Send event to Umami with correct payload structure
                await axios.post(umamiUrl, {
                    type: "event",
                    payload: {
                        hostname: "podcasthub.org",
                        language: "en-US",
                        referrer: "",
                        screen: "1920x1080",
                        title: episode.title,
                        url: `/episode/${episodeSlug}`,
                        website: umamiWebsiteId,
                        name: "podcast_download",
                        data: {
                            episode_id: id,
                            title: episode.title
                        }
                    }
                }).catch(err => {
                    // Log error but continue serving the file
                    console.error('Error tracking download with Umami:', err.message);
                });
            }
        } catch (error) {
            // Just log the error, but continue serving the file
            console.error('Error during analytics tracking:', error);
        }

        // Stream the file to the client
        try {
            // Get file stream from Strapi upload provider
            const file = episode.audio;

            // Set appropriate headers
            ctx.type = file.mime;
            ctx.set('Content-Disposition', `attachment; filename="${file.name}"`);
            ctx.set('Content-Length', file.size.toString());

            // Stream file from provider
            const {provider} = strapi.plugins.upload;
            return provider.send(file);
        } catch (error) {
            console.error('Error streaming audio file:', error);
            return ctx.internalServerError('Error streaming audio file');
        }
    }
}));
