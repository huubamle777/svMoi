export default async (request, context) => {
    const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
    const ip = context.ip;

    const blockedPatterns = [
        'bot', 'crawler', 'spider', 'scraper', 'scan', 'curl', 'wget',
        'python', 'java', 'ruby', 'go', 'scrapy', 'lighthouse',
        'puppeteer', 'selenium', 'headless', 'phantom'
    ];

    const isBlocked = blockedPatterns.some(pattern => userAgent.includes(pattern));

    if (isBlocked) {
        console.log(`[BLOCKED] IP: ${ip}, UA: ${userAgent}`);
        return new Response('Access Denied', {
            status: 403,
            headers: { 'Content-Type': 'text/plain' }
        });
    }

    return context.next();
};

export const config = {
    path: "/*"
};

