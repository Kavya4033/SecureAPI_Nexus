// Inspects incoming content streams for application exploits
module.exports = (req, res, next) => {
    // Only inspect body payloads if payload content exists
    if (req.body && Object.keys(req.body).length > 0) {
        const payloadString = JSON.stringify(req.body);
        
        // RegEx signatures matching OWASP core rule vulnerability definitions
        const sqlInjectionPattern = /UNION|SELECT|INSERT|DROP|--|OR 1=1/i;
        const crossSiteScriptingPattern = /<script.*?>|javascript:/i;

        if (sqlInjectionPattern.test(payloadString) || crossSiteScriptingPattern.test(payloadString)) {
            req.securityAlert = 'Malicious attack signature matched inside request payload payload context.';
            return res.status(400).json({ 
                error: 'Bad Request: Dynamic injection exploit threat intercepted.', 
                cid: req.correlationId 
            });
        }
    }
    next();
};
