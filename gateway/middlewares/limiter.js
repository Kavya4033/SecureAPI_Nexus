// Sliding Counter Rate Limiter backed by Redis
module.exports = (redisClient) => {
    return async (req, res, next) => {
        // Mobile Best Practice: Use unique Device-ID tracking header if available, fallback to IP
        const clientIdentifier = req.headers['x-device-id'] || req.ip;
        const redisKey = `rate-limit:${clientIdentifier}`;
        const windowInSeconds = 60;
        const maxRequestsAllowed = 10; // Low limit specifically for easy testing in our Sandbox

        try {
            const currentRequestCount = await redisClient.incr(redisKey);
            
            if (currentRequestCount === 1) {
                await redisClient.expire(redisKey, windowInSeconds);
            }

            if (currentRequestCount > maxRequestsAllowed) {
                req.securityAlert = `Rate limit exceeded by identity: ${clientIdentifier}`;
                return res.status(429).json({ 
                    error: 'Too Many Requests: Traffic spike detected from this identity.', 
                    cid: req.correlationId 
                });
            }
            next();
        } catch (err) {
            // Fail open policy to protect user availability if Redis goes down offline
            console.error("[Redis Error] Rate limiter failure:", err);
            next();
        }
    };
};
