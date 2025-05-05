import prettify from "prettify-xml";

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
        .filter((episode) => new Date(episode.releasedAt).getTime() < new Date().getTime())
        .sort((a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime())
        .map((episode) => episode.data).join('')}
            </channel>
        </rss>
        `;
}

export default {
    generateFeeds: {
        task: async ({strapi}) => {
            // https://docs.strapi.io/dev-docs/api/document-service#findmany
            // apparently, status propagates 'down'
            // https://github.com/strapi/strapi/issues/12665
            // https://github.com/strapi/strapi/issues/12719
            const feeds = await strapi.documents('api::feed.feed').findMany({
                populate: ['episodes', 'cover'],
                status: 'published',
            });

            for (const feed of feeds) {
                // Skip empty feeds
                if (!feed.episodes || feed.episodes.length === 0) {
                    console.info("Skipped empty feed - " + feed.documentId)
                    continue;
                }

                // Skip unchanged feeds
                // only works, if episodes do not use the draft/publish system
                // adding an episode from the episodes side, does not change the updatedAt time
                if (new Date(feed.generatedAt).getTime() + 2000 > new Date(feed.updatedAt).getTime()) {
                    console.info("Skipped unmodified feed - " + feed.documentId)
                    continue
                }

                const generatedFeed = prettify(generateFeed(feed), {
                    indent: 2,
                    newline: "\n",
                })

                await strapi.documents('api::feed.feed').update({
                    documentId: feed.documentId,
                    data: {
                        generatedAt: new Date(),
                        data: generatedFeed
                    }
                })
                console.info("Regenerated feed - " + feed.documentId)
            }
        },
        options: {
            rule: "*/5 * * * *", // every 5 minutes
        },
        // only run once after 10 seconds * * * * *
        //options: new Date(Date.now() + 10000),
    },
};
