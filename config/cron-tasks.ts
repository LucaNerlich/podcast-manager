import prettify from "prettify-xml";

function generateFeed(feed) {
    const episodes = feed.episodes;
    console.log("feed", feed);
    return `
        <rss version="2.0" 
        xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
        xmlns:atom="http://www.w3.org/2005/Atom"
        xmlns:content="http://purl.org/rss/1.0/modules/content/">
            <channel>
                <title>${feed.title}</title>
                <description>${feed.description}</description>
                <language>de</language>
                <copyright>${feed.copyright}</copyright>
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
        .filter((episode) => episode.draft === false)
        .filter((episode) => new Date(episode.releasedAt).getTime() < new Date().getTime())
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
            rule: "* * * * *", // every minute
        },
        // options: {
        //     rule: "*/5 * * * *", // every 5 minutes
        // },
        // only run once after 10 seconds * * * * *
        //options: new Date(Date.now() + 10000),
    },
};
