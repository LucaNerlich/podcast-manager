import prettify from "prettify-xml";

function generateItem(event) {
    return `
        <item>
            <title>${event.params.data.title}</title>
            <pubDate>${new Date(event.params.data.releasedAt).toUTCString()}</pubDate>
            <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
            <guid isPermaLink="false">${event.params.data.guid}</guid>
            <itunes:image href="${event.params.data.cover.url}"/>
            <description>${event.params.data.description}</description>
            <itunes:explicit>false</itunes:explicit>
            <itunes:duration>${event.params.data.duration}</itunes:duration>
            <link>${event.params.data.link}</link>
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
    },
    async afterUpdate(event) {
        const {result, params} = event;
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
            console.info("Updated Feed from Episode - " + feed.documentId)
        }
    }
};
