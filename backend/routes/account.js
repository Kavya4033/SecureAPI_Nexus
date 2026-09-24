const express = require('express');
const router = express.Router();

// Private Route: Fetches financial profile data
router.get('/profile', (req, res) => {
    // 🛡️ ARCHITECTURAL CHECK: Verify the request came through the Nexus Gateway
    const correlationId = req.headers['x-correlation-id'];
    const gatewayAuthHeader = req.headers['x-authenticated-user'];

    if (!correlationId || !gatewayAuthHeader) {
        return res.status(403).json({
            error: "Access Denied: Direct connections to private microservices are forbidden. Access must route through SecureAPI Nexus."
        });
    }

    // Parse user identity injected by the Gateway layer
    try {
        const gatewayUser = JSON.parse(gatewayAuthHeader);
        
        // Return sensitive mock profile data safely
        return res.status(200).json({
            success: true,
            status: "SECURED_BY_NEXUS",
            correlationId: correlationId,
            data: {
                userId: gatewayUser.id,
                accountType: "Premium Checking",
                availableBalance: "$5,420.50",
                accountNumber: "****-****-9921",
                lastSyncTime: new Date().toISOString()
            }
        });
    } catch (err) {
        return res.status(400).json({ error: "Invalid identity context passed to backend." });
    }
});

module.exports = router;
