import prettify from "prettify-xml";

/**
 * Generates an RSS feed XML string based on the provided feed data object.
 *
 * @param {Object} feed - The feed object containing details to generate the RSS feed.
 * @param {string} feed.title - The title of the RSS feed.
 * @param {string} [feed.description] - The description of the RSS feed (optional).
 * @param {boolean} feed.public - Indicates whether the feed is publicly accessible.
 * @param {string} feed.copyright - The copyright information for the RSS feed.
 * @param {string} [feed.link] - The link to the feed's website or homepage (optional).
 * @param {string} feed.owner - The name of the feed owner for iTunes metadata.
 * @param {string} feed.email - The email of the feed owner for iTunes metadata.
 * @param {Object} [feed.cover] - An object containing the cover image details (optional).
 * @param {string} [feed.cover.url] - The URL of the cover image, used in iTunes metadata.
 * @param {Array} feed.episodes - An array of episode objects to include in the RSS feed.
 * @param {boolean} [feed.episodes.draft] - Indicates whether an episode is a draft or published.
 * @param {string} feed.episodes.releasedAt - The release date of the episode in ISO format.
 * @param {string} feed.episodes.data - The raw XML data of the episode to append to the feed.
 *
 * @return {string} The generated RSS feed as a string in XML format, including metadata and episodes.
 */
function generateFeed(feed) {
    const episodes = feed.episodes;
    return `
        <rss version="2.0"
        xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
        xmlns:atom="http://www.w3.org/2005/Atom"
        xmlns:content="http://purl.org/rss/1.0/modules/content/">
            <channel>
                <title>${feed.title}</title>
                ${feed.description ? `<description>${feed.description}</description>` : ''}
                <language>de</language>
                <public>${feed.public}</public>
                <copyright>${feed.copyright}</copyright>
                ${feed.link ? `<link>${feed.link}</link>` : ''}
                <itunes:category text="Leisure"/>
                <itunes:owner>
                    <itunes:name>${feed.owner}</itunes:name>
                    <itunes:email>${feed.email}</itunes:email>
                </itunes:owner>
                <itunes:author>${feed.owner}</itunes:author>
                <itunes:explicit>false</itunes:explicit>
                <itunes:type>episodic</itunes:type>
                <itunes:image href="${feed.cover?.url}"/>
                ${episodes
            .filter((episode) => episode.draft === false || episode.draft === undefined || episode.draft === null)
            .filter((episode) => new Date(episode.releasedAt).getTime() <= new Date().getTime())
            .sort((a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime())
            .map((episode) => episode.data).join('')}
            </channel>
        </rss>
        `;
}

export default {
    /**
     * Task responsible for generating feeds for all published entries in the `feed` content type in Strapi.
     * This task fetches feeds populated with related `episodes` and `cover`, skips empty or unchanged feeds,
     * and regenerates feed data only when necessary.
     *
     * Key operations:
     * - Fetches all published feeds with related data from the Strapi `feed` collection.
     * - Skips feeds that have no episodes or remain unchanged since the last generation.
     * - Updates the feed's `generatedAt` timestamp and regenerated feed data in the database.
     *
     * Notes:
     * - The `status` field is used to filter published feeds, as the publish/draft system propagates its status to related data.
     * - Feed changes are based on the `updatedAt` timestamp, but this only applies if episodes do not utilize the draft/publish system.
     * - Generated feed data is prettified using the specified formatting options before saving.
     *
     * Execution schedule:
     * - The task runs every 5 minutes, as specified by the Cron rule `*/
    generateFeeds: {
        task: async ({ strapi }) => {
            // https://docs.strapi.io/dev-docs/api/document-service#findmany
            // apparently, status propagates 'down'
            // https://github.com/strapi/strapi/issues/12665
            // https://github.com/strapi/strapi/issues/12719
            const feeds = await strapi.documents('api::feed.feed').findMany({
                populate: ['episodes', 'cover'],
                status: 'published',
            });

            for (const feed of feeds) {
                try {
                    // Skip empty feeds
                    if (!feed.episodes || feed.episodes.length === 0) {
                        console.info("Skipped empty feed - " + feed.documentId);
                        continue;
                    }

                    // Log future-scheduled episodes
                    const nowForFutureCheck = new Date().getTime();
                    const futureEpisodesCount = feed.episodes.filter(episode =>
                        (episode.draft === false || episode.draft === undefined || episode.draft === null) &&
                        new Date(episode.releasedAt).getTime() > nowForFutureCheck
                    ).length;

                    if (futureEpisodesCount > 0) {
                        console.info(`Feed ${feed.documentId}: Found ${futureEpisodesCount} episode(s) scheduled for future release.`);
                    }

                    // Determine if the feed should be skipped.
                    const now = new Date().getTime();
                    const generatedAtTime = feed.generatedAt ? new Date(feed.generatedAt).getTime() : 0;
                    const updatedAtTime = new Date(feed.updatedAt).getTime();

                    const timestampsIndicateNoChange = generatedAtTime + 2000 > updatedAtTime;

                    let hasNewlyLiveEpisodes = false;
                    if (timestampsIndicateNoChange) {
                        hasNewlyLiveEpisodes = feed.episodes.some(episode =>
                            (episode.draft === false || episode.draft === undefined || episode.draft === null) &&
                            new Date(episode.releasedAt).getTime() <= now &&
                            new Date(episode.releasedAt).getTime() > generatedAtTime
                        );
                    }

                    if (timestampsIndicateNoChange && !hasNewlyLiveEpisodes) {
                        console.info(`Skipped feed ${feed.documentId}: No direct update & no new episodes live. Gen: ${feed.generatedAt ? new Date(generatedAtTime).toISOString() : 'N/A'}, Upd: ${new Date(updatedAtTime).toISOString()}`);
                        continue;
                    }

                    if (!timestampsIndicateNoChange) {
                        console.info(`Regenerating feed ${feed.documentId}: Feed entity updated (updatedAt: ${new Date(updatedAtTime).toISOString()}, generatedAt: ${feed.generatedAt ? new Date(generatedAtTime).toISOString() : 'N/A'}).`);
                    }
                    if (hasNewlyLiveEpisodes) {
                        console.info(`Regenerating feed ${feed.documentId}: New episodes became live since last generation at ${feed.generatedAt ? new Date(generatedAtTime).toISOString() : 'N/A'}.`);
                    }

                    const generatedFeed = prettify(generateFeed(feed), {
                        indent: 2,
                        newline: "\n",
                    });

                    await strapi.documents('api::feed.feed').update({
                        documentId: feed.documentId,
                        data: {
                            generatedAt: new Date(),
                            data: generatedFeed
                        }
                    });
                    console.info("Successfully regenerated feed - " + feed.documentId);
                } catch (error) {
                    console.error(`Error processing feed ${feed.documentId} in cron job:`, error);
                    // Optionally, add more detailed error reporting to a monitoring service here
                }
            }
        },
        options: {
            rule: "*/5 * * * *", // every 5 minutes
        },
    },
    /**
     * Re-generates and updates the data field of all episodes by fetching them from the database,
     * transforming the data using a prettification function, and updating the episodes with the
     * new formatted data. The task is executed asynchronously.
     *
     * @property {Function} task - The main asynchronous function that retrieves and updates the episode documents.
     * @property {Object} task.context - Contains the Strapi instance.
     * @property {Object} options - Configuration for scheduling the task. Determines the execution timing to only run once after 10 seconds.
     */
    // reGenerateEpisodes: {
    //     task: async ({strapi}) => {
    //         const episodes = await strapi.documents('api::episode.episode').findMany({
    //             populate: ['*', 'cover', 'audio'],
    //         });
    //
    //         for (const episode of episodes) {
    //             const generatedEpisodeData = prettify(generateItem(episode), {
    //                 indent: 2,
    //                 newline: "\n",
    //             })
    //
    //             await strapi.documents('api::episode.episode').update({
    //                 documentId: episode.documentId,
    //                 data: {
    //                     data: generatedEpisodeData
    //                 }
    //             })
    //         }
    //     },
    //     // only run once after 10 seconds
    //     options: new Date(Date.now() + 15000),
    // },
};

/**
 * Generates an RSS feed item for a given episode object by constructing an XML structure.
 *
 * @param {Object} episode - The episode object containing metadata used to construct the RSS feed item.
 * @param {string} episode.guid - The globally unique identifier for the episode.
 * @param {string} episode.title - The title of the episode.
 * @param {string} episode.releasedAt - The release date of the episode in a parseable date string format.
 * @param {Object} episode.cover - The cover image associated with the episode.
 * @param {string} episode.cover.url - The URL to the cover image.
 * @param {string} [episode.description] - A description of the episode (optional).
 * @param {number} episode.duration - The duration of the episode in seconds.
 * @param {string} [episode.link] - A link to additional resources related to the episode (optional).
 * @param {Object} episode.audio - Metadata about the episode's audio file.
 * @param {number} episode.audio.size - The size of the audio file in kilobytes.
 *
 * @return {string} The constructed RSS feed item in XML format.
 */
function generateItem(episode) {
    const baseUrl = process.env.BASE_URL || 'https://podcasthub.org';

    // Create proxied audio URL - using the episode guid,
    // docid is not available in beforeCreate lifecycle hook
    const audioUrl = `${baseUrl}/api/episodes/${episode.guid}/download`;

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
