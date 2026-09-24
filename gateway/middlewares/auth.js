// Handles authentication verification checks
module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Check if the bearer token header structure is correct
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Unauthorized: Missing or malformed authentication credentials.', 
            cid: req.correlationId 
        });
    }
    
    try {
        // Core Logic: Extract and decode token (In production, use jwt.verify)
        const token = authHeader.split(' ')[1];
        
        // Mock valid token behavior for sandbox demo
        if (token === "nexus_secure_token_abc123") {
            req.user = { id: "user_mob_9921", role: "mobile_client" };
            return next();
        }
        
        throw new Error("Invalid cryptographic signature");
    } catch (err) {
        return res.status(401).json({ 
            error: 'Unauthorized: Invalid token signature or token expired.', 
            cid: req.correlationId 
        });
    }
};
