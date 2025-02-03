import prettify from "prettify-xml";

export default {
    beforeCreate(event) {
        console.log("beforeCreate");
        console.log("event.params.data", event.params.data);
        const emptyRss = `
        <rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
            <channel>
                <title>${event.params.data.title}</title>
                <description>${event.params.data.description}</description>
                <language>de</language>
                <copyright>All rights reserved</copyright>
                <itunes:category text="Leisure"/>
                <itunes:owner>
                    <itunes:name>TODO</itunes:name>
                    <itunes:email>TODO</itunes:email>
                </itunes:owner>
            </channel>
        </rss>
        `;

        event.params.data.data = prettify(emptyRss, {
            indent: 2,
            newline: "\n",
        });
    },

    afterCreate(event) {
        console.log("afterCreate");

        const {result, params} = event;

        // do something to the result;
    },
};
