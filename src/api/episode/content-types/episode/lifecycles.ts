import prettify from "prettify-xml";

function generateItem(episode) {
    const baseUrl = process.env.BASE_URL || 'https://podcasthub.org';

    // Create proxied audio URL - using the episode guid,
    // docid is not available in beforeCreate lifecycle hook
    const audioUrl = `${baseUrl}/api/episodes/${episode.guid}/download.mp3`;

    // For private feeds, URL would need a token query parameter added by the controller
    // This is managed at the controller level when serving the XML feed

    return `
        <item>
            <title>${episode.title.replace('&', ' und ')}</title>
            <pubDate>${new Date(episode.releasedAt).toUTCString()}</pubDate>
            <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
            <guid isPermaLink="false">${episode.guid}</guid>
            <itunes:image href="${episode.cover.url}"/>
            ${episode.description ? `<description>${episode.description.replace('&', ' und ')}</description>` : ''}
            <itunes:explicit>false</itunes:explicit>
            <itunes:duration>${episode.duration}</itunes:duration>
            ${episode.link ? `<link>${episode.link}</link>` : ''}
            <enclosure url="${audioUrl}" length="${Math.round(episode.audio.size * 1024)}" type="audio/mpeg"/>
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
        event.params.data.data = prettify(generateItem(event.params.data), {
            indent: 2,
            newline: "\n",
        });
    },
    async afterCreate(event) {
        const {result} = event;
        await triggerFeedUpdate(result);
    },
    async afterUpdate(event) {
        const {result} = event;

        // Skip the internal regeneration write below, which only sets 'data'
        const patchKeys = Object.keys(event.params?.data ?? {});
        if (patchKeys.length === 1 && patchKeys[0] === 'data') {
            return;
        }

        await regenerateItemData(result.documentId);
        await triggerFeedUpdate(result);
    }
};

/**
 * Regenerates the stored RSS item XML of an episode from the fully populated
 * document as it exists in the database. Update payloads may be partial
 * patches (e.g. only the title), so generating from `event.params.data`
 * would write literal `undefined`/NaN values for fields that were not part
 * of the update.
 *
 * @param {string} documentId The documentId of the episode to regenerate.
 */
async function regenerateItemData(documentId) {
    const episode = await strapi.documents('api::episode.episode').findOne({
        documentId,
        populate: ['cover', 'audio'],
    });

    if (!episode) return;

    const generated = prettify(generateItem(episode), {
        indent: 2,
        newline: "\n",
    });

    if (generated === episode.data) return;

    await strapi.documents('api::episode.episode').update({
        documentId,
        data: {
            data: generated,
        }
    });
}
