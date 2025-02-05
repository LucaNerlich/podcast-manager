import prettify from "prettify-xml";

export default {
    async beforeCreate(event) {
        const emptyRss = `
        <rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
            <channel>
                <title>${event.params.data.title}</title>
                <description>${event.params.data.description}</description>
                <language>de</language>
                <copyright>${event.params.data.copyright}</copyright>
                <itunes:category text="Leisure"/>
                <itunes:owner>
                    <itunes:name>${event.params.data.owner}</itunes:name>
                    <itunes:email>${event.params.data.email}</itunes:email>
                </itunes:owner>
                <itunes:author>${event.params.data.owner}</itunes:author>
                <itunes:explicit>false</itunes:explicit>
                <itunes:type>episodic</itunes:type>
                <itunes:image href="${event.params.data.cover?.url}"/>
            </channel>
        </rss>
        `;

        event.params.data.data = prettify(emptyRss, {
            indent: 2,
            newline: "\n",
        });

        event.params.data.guid = event.params.data.guid ?? crypto.randomUUID();
    },

    async beforeUpdate(event) {
        console.log("beforeUpdate - feed", event.params.data);
        //console.log("connect", event.params.data.episodes.connect);
        //console.log("disconnect", event.params.data.episodes.disconnect);

        // do something to the result;
    },
    async afterUpdate(event) {
        const {result, params} = event;
        console.log("result - afterUpdate", result);

        const feed = await strapi.documents('api::feed.feed').findOne({
            documentId: result.documentId,
            populate: ['episodes'],
        });

        //console.log("feed", feed);
    }
};
