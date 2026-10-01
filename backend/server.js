const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS matching your frontend origin location coordinates
app.use(cors({
    origin: '*', 
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID']
}));

app.use(express.json());

// In-Memory Global Trackers mimicking Redis Sliding-Window storage elements
const rateLimitTracker = {}; 
const DEBOUNCE_COOLDOWN_MS = 6000; // Duration of rate-limiting punishment window

// Cryptographic Correlation ID Factory
const generateCID = () => 'nexus-cid-' + Math.random().toString(36).substring(2, 11).toUpperCase();

// ==========================================
// CORE ROUTE: TARGET APPARATUS FOR BOTH CLIENTS & SIMULATORS
// ==========================================
app.post('/v1/mobile/account/balance', (req, res) => {
    const cid = generateCID();
    const clientIp = req.ip || '127.0.0.1';
    const deviceId = req.headers['x-device-id'] || 'UNKNOWN-DEVICE';
    const authHeader = req.headers['authorization'];
    
    const { action, accountQuery } = req.body;

    // Initialize tracking array sequence for target IP address spaces
    if (!rateLimitTracker[clientIp]) {
        rateLimitTracker[clientIp] = { timestamps: [], lockedUntil: 0 };
    }

    const currentTime = Date.now();
    const clientRecord = rateLimitTracker[clientIp];

    // ──────────────────────────────────────────
    // LAYER 2: RATE LIMIT PROTECTION PIPELINE
    // ──────────────────────────────────────────
    if (currentTime < clientRecord.lockedUntil) {
        return res.status(429).json({
            status: "Rejected",
            error: "Too Many Requests",
            message: "Rate capacity threshold breached. Connection drop via Layer 2 Security.",
            cid: cid
        });
    }

    // Clean tracking window history array from out-of-date records (> 1 second old)
    clientRecord.timestamps = clientRecord.timestamps.filter(ts => currentTime - ts < 1000);
    clientRecord.timestamps.push(currentTime);

    // If request volume crosses concurrent parameters inside a single second window
    if (clientRecord.timestamps.length > 15) {
        clientRecord.lockedUntil = currentTime + DEBOUNCE_COOLDOWN_MS;
        return res.status(429).json({
            status: "Rejected",
            error: "Too Many Requests",
            message: "Redis Sliding Window tripped. Rate limiter dropped threat.",
            cid: cid
        });
    }

    // ──────────────────────────────────────────
    // LAYER 1: WEB APPLICATION FIREWALL (WAF) PACKET DEEP INSPECTION
    // ──────────────────────────────────────────
    if (accountQuery) {
        const sqlInjectionRegex = /UNION|SELECT|INSERT|UPDATE|DELETE|--|DROP/i;
        if (sqlInjectionRegex.test(accountQuery)) {
            return res.status(400).json({
                status: "Blocked",
                error: "Bad Request / Threat Flagged",
                message: "Regex Match: Dropped payload containing injection vectors.",
                cid: cid
            });
        }
    }

    // ──────────────────────────────────────────
    // LAYER 3: END-TO-END IDENTITY DATA DISPATCH
    // ──────────────────────────────────────────
    if (authHeader && action === "read_balance") {
        return res.status(200).json({
            status: "Authorized",
            balance: 14750.50,
            account: "User_Mob_9921",
            cid: cid
        });
    }

    // Security Fallback Strategy Drop
    return res.status(401).json({
        status: "Unauthorized",
        error: "Unauthorized access token footprint detected.",
        cid: cid
    });
});

// Run server pipeline
app.listen(PORT, () => {
    console.log(`[SecureAPI Nexus Gateway Core Engine Started] Running on http://localhost:${PORT}`);
});
