/**
 * YouTube Utility to fetch video metadata without an API key
 */

const extractVideoId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

/**
 * Fetches duration of a YouTube video in minutes
 * @param {string} url - YouTube video URL
 * @returns {Promise<number|null>} - Duration in minutes, or null if failed
 */
const fetchYouTubeDuration = async (url) => {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) return null;

        // Fetch the YouTube page
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) return null;

        const html = await response.text();

        // Look for ytInitialPlayerResponse in the page source
        const playerResponseRegex = /var ytInitialPlayerResponse\s*=\s*({.+?});/;
        const match = html.match(playerResponseRegex);

        if (match && match[1]) {
            const playerResponse = JSON.parse(match[1]);
            const lengthSeconds = playerResponse.videoDetails?.lengthSeconds;
            
            if (lengthSeconds) {
                // Convert to minutes and round up
                return Math.ceil(parseInt(lengthSeconds, 10) / 60);
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching YouTube duration:', error);
        return null;
    }
};

module.exports = {
    extractVideoId,
    fetchYouTubeDuration
};
