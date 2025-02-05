import prettify from "prettify-xml";

function generateFeed(feed) {
    console.log("feed", feed);
    const episodes = feed.episodes;
    return `
        <rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
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
                ${episodes.filter((episode) => !episode.publishedAt).map((episode) => episode.data).join('')}
            </channel>
        </rss>
        `;
}

export default {
    generateFeeds: {
        task: async ({strapi}) => {
            // https://docs.strapi.io/dev-docs/api/document-service#findmany
            const feeds = await strapi.documents('api::feed.feed').findMany({
                populate: ['episodes'],
            });

            for (const feed of feeds) {
                if (!feed.episodes || feed.episodes.length === 0) continue;

                // todo check generatedAt and updatedAt

                const generatedFed = prettify(generateFeed(feed), {
                    indent: 2,
                    newline: "\n",
                })

                console.log("data", generatedFed);
                await strapi.documents('api::feed.feed').update({
                    documentId: feed.documentId,
                    data: {
                        generatedAt: new Date(),
                        data: generatedFed
                    }
                })
            }
        },
        // options: {
        //     rule: "*/5 * * * *", // every 5 minutes
        // },
        // only run once after 10 seconds
        options: new Date(Date.now() + 10000),
    },
};
