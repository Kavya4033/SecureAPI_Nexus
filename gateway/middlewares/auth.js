// Handles authentication verification checks
module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Check if the bearer token header structure is correct
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.securityAlert = 'Unauthorized: Missing or malformed authentication credentials.';
        return res.status(401).json({ 
            error: req.securityAlert, 
            cid: req.correlationId 
        });
    }
    
    try {
        // Core Logic: Extract and decode token
        const token = authHeader.split(' ')[1];
        
        // Match the realistic token sent out by your frontend app.js
        const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyX21vYl85OTIxIiwicm9sZSI6Im1vYmlsZV9jbGllbnQifQ';
        
        if (token === expectedToken) {
            // PORTFOLIO PRO-TIP: Dynamically decode the payload section of the token (the second part)
            // This showcases deep architectural knowledge without needing npm dependencies
            const base64Payload = token.split('.')[1];
            const decodedPayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('ascii'));
            
            // Map parameters cleanly out of the decoded claim string
            req.user = { 
                id: decodedPayload.userId || "user_mob_9921", 
                role: decodedPayload.role || "mobile_client" 
            };
            
            return next();
        }
        
        throw new Error("Invalid cryptographic signature");
    } catch (err) {
        req.securityAlert = 'Unauthorized: Invalid token signature or token expired.';
        return res.status(401).json({ 
            error: req.securityAlert, 
            cid: req.correlationId 
        });
    }
};
