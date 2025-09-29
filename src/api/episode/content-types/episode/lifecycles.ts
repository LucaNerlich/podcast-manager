import prettify from "prettify-xml";

function generateItem(event) {
    const baseUrl = process.env.BASE_URL || 'https://podcasthub.org';

    // Create proxied audio URL - using the episode guid,
    // docid is not available in beforeCreate lifecycle hook
    const audioUrl = `${baseUrl}/api/episodes/${event.params.data.guid}/download.mp3`;

    // For private feeds, URL would need a token query parameter added by the controller
    // This is managed at the controller level when serving the XML feed

    return `
        <item>
            <title>${event.params.data.title.replace('&', ' und ')}</title>
            <pubDate>${new Date(event.params.data.releasedAt).toUTCString()}</pubDate>
            <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
            <guid isPermaLink="false">${event.params.data.guid}</guid>
            <itunes:image href="${event.params.data.cover.url}"/>
            ${event.params.data.description ? `<description>${event.params.data.description.replace('&', ' und ')}</description>` : ''}
            <itunes:explicit>false</itunes:explicit>
            <itunes:duration>${event.params.data.duration}</itunes:duration>
            ${event.params.data.link ? `<link>${event.params.data.link}</link>` : ''}
            <enclosure url="${audioUrl}" length="${Math.round(event.params.data.audio.size * 1024)}" type="audio/mpeg"/>
        </item>
        `
}

/**
 * Updates all feeds associated with an episode to re-trigger their update lifecycle hooks.
 * This ensures that the associated feed data, such as the feed.xml, is regenerated.
 *
 * @param {Object} result The result object containing the documentId of the episode to update.
 * @return {Promise<void>} A promise that resolves when all associated feeds have been updated.
 */
async function triggerFeedUpdate(result) {
    // gather documentIds of attached feeds, since the event relation is unpopulated
    const episode = await strapi.documents('api::episode.episode').findOne({
        documentId: result.documentId,
        // @ts-ignore
        populate: {
            feeds: {
                fields: ['documentId']
            }
        },
    })

    // 'fake' update all affected feeds,
    // to re-trigger their update lifecycle hook which in turn re-generates the feed.xml
    // @ts-ignore
    for (const feed of episode.feeds) {
        await strapi.documents('api::feed.feed').update({
            documentId: feed.documentId,
            data: {
                // @ts-ignore
                updatedAt: new Date(),
            }
        });
        console.info(`Refreshed 'updatedAt' for Feed: ${feed.documentId} from Episode: ${episode.documentId}.`)
    }
}

export default {
    // every "publish" action creates a new entry
    async beforeCreate(event) {
        event.params.data.guid = event.params.data.guid ?? crypto.randomUUID();
        event.params.data.data = prettify(generateItem(event), {
            indent: 2,
            newline: "\n",
        });
    },
    async afterCreate(event) {
        const {result} = event;
        await triggerFeedUpdate(result);
    },
    async beforeUpdate(event) {
        if (!event.params.data.title) {
            return;
        }
        event.params.data.data = prettify(generateItem(event), {
            indent: 2,
            newline: "\n",
        });
    },
    async afterUpdate(event) {
        const {result} = event;
        await triggerFeedUpdate(result);
    }
};
