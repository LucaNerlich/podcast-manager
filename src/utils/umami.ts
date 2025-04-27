import packageJson from "../../package.json";

const umamiUrl = process.env.UMAMI_URL;
const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID;

export function track(type: string, title: string, id: string) {
    try {
        if (umamiUrl && umamiWebsiteId) {
            // Format episode title as URL slug
            const slug = title?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

            // Send event to Umami with correct payload structure using native fetch
            fetch(umamiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64;) PodcastHub/${packageJson.version}`
                },
                body: JSON.stringify({
                    type: "event",
                    payload: {
                        hostname: "umami.lucanerlich.com",
                        language: "de-DE",
                        referrer: `/${type}/${slug}`,
                        screen: "1920x1080",
                        title: title,
                        url: `/${type}/${slug}`,
                        website: umamiWebsiteId,
                        name: `${type}_${slug}`,
                        data: {
                            id: id,
                            title: title,
                            type: type,
                        }
                    }
                })
            }).catch(err => {
                // Log error but continue serving the file
                console.error('Error tracking download with Umami:', err.message);
            });
            // Note: We're not awaiting the fetch since we don't want to
            // delay serving the file if analytics is slow
        }
    } catch (error) {
        // Just log the error, but continue serving the file
        console.error('Error during analytics tracking:', error);
    }
}
