import prettify from "prettify-xml";

function generateItem(event) {
    return `
        <item>
            <title>${event.params.data.title}</title>
            <pubDate>${event.params.data.publishedAt}</pubDate>
            <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
            <guid isPermaLink="false">${event.params.data.guid}</guid>
            <itunes:image href="${event.params.data.cover.url}"/>
            <description>${event.params.data.description}</description>
            <itunes:explicit>false</itunes:explicit>
            <itunes:duration>${event.params.data.duration}</itunes:duration>
            <enclosure url="${event.params.data.audio.url}" length="${Math.round(event.params.data.audio.size * 1024)}" type="audio/mpeg"/>
        </item>
        `;
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
    async beforeUpdate(event) {
        event.params.data.data = prettify(generateItem(event), {
            indent: 2,
            newline: "\n",
        });

        // https://forum.strapi.io/t/lifecycle-hook-not-called-on-relation-update/29005/3
        // publishing and unpublishing does not trigger a feed beforeUpdate,
        // therefore, we need to manually "update" feeds.

        // Gather IDs of affected feeds (connect and disconnect contain IDs and not documentIDs
        const feedIds = [
            ...(event.params.data.feeds.connect?.map(feed => feed.id) || []),
            ...(event.params.data.feeds.disconnect?.map(feed => feed.id) || [])
        ];

        console.log("feedIds", feedIds);


        // gather documentIds for affected ids
        const feeds = await strapi.db.query('api::feed.feed').findMany({
            select: ['documentId', 'updatedCount'],
            where: {
                id: {
                    $in: feedIds
                }
            },
        });

        // 'fake' update all affected feeds,
        // to re-trigger their update lifecycle hook which in turn re-generates the feed.xml
        for (const feed of feeds) {
            await strapi.documents('api::feed.feed').update({
                documentId: feed.documentId,
                data: {
                    updatedCount: feed.updatedCount ? feed.updatedCount + 1 : 1
                }
            });
        }

        console.log("feeds", feeds);
    },
    async afterUpdate(event) {
        const {result, params} = event;
    }
};
