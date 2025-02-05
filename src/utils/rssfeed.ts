/*
Create a single episode item

<item>
    <title>SFS - You can be the Stainless Steel Rat</title>
    <pubDate>Tue, 10 Dec 2024 12:00:00 GMT</pubDate>
    <lastBuildDate>Tue, 10 Dec 2024 12:00:00 GMT</lastBuildDate>
    <guid isPermaLink="false">693141848052e3399b79ba0f1731d5e494fe2e445f55a3c0610088cd328f4967</guid>
    <itunes:image href="https://lucanerlich.com/images/cover/sfs.jpg"/>
    <description>SFS - You can be the Stainless Steel Rat</description>
    <author>spam@spam.de</author>
    <itunes:explicit>false</itunes:explicit>
    <itunes:duration>12278</itunes:duration>
    <link>https://lucanerlich.com</link>

</item>
 */
import {Episode} from "./types/Episode";


export function createItem(episode: Episode): string {
    const enclosure = createEnclosure(episode);
    return "";
}

/*
Creates an xml enclosure item

<enclosure url="https://share.lucanerlich.com/s/8CwpTQaaWr6kMXH/download/stainlessrat.mp3" length="159861433" type="audio/mpeg"/>
 */
export function createEnclosure(episode: Episode): string {
    return "";
}
