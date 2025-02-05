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
    },
};
