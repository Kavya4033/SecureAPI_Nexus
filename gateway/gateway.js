const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const redis = require('redis');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import your custom security layers and modules
const authLayer = require('./middlewares/auth');
const rateLimiterLayer = require('./middlewares/limiter');
const threatDetectorLayer = require('./middlewares/detector');
const loggerLayer = require('./middlewares/logger'); // Your updated structured logger script

const app = express();
const PORT = process.env.PORT || 8000;
const BACKEND_SERVICE_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Initialize Redis Client for High-Speed Memory Lookups
const redisClient = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.connect()
    .then(() => console.log('[SecureAPI Nexus] Cache Layer (Redis) connected.'))
    .catch((err) => console.error('[SecureAPI Nexus] Redis initialization failed:', err));

// Core Framework Configurations
app.use(express.json());

// ==========================================
// LAYER 0: DISTRIBUTED CORRELATION TRACING & AUDITING
// ==========================================
app.use((req, res, next) => {
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();
    next();
});

// Attach your standardized structured log listener to watch response states
app.use(loggerLayer.interceptSecurityLogs);

// ==========================================
// ROUTING PROXY CONFIGURATION (DOWNSTREAM PIPELINE)
// ==========================================
const secureProxyOptions = {
    target: BACKEND_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/v1/mobile': '/internal/account' // Remaps public routes to backend routes
    },
    on: {
        proxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('X-Correlation-ID', req.correlationId);
            
            if (req.user) {
                proxyReq.setHeader('X-Authenticated-User', JSON.stringify(req.user));
            }

            // Stream body down safely to bypass the Express json() body hanging issue
            if (req.body && Object.keys(req.body).length > 0) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
        }
    }
};

const gatewayRoutingEngine = createProxyMiddleware(secureProxyOptions);

// ==========================================
// THE GATEWAY SECURITY PIPELINE
// ==========================================
app.use('/v1/mobile', 
    rateLimiterLayer(redisClient), // 1. Check volume capacity bounds via Redis
    threatDetectorLayer,           // 2. Scan request parameters for SQL Injection anomalies
    authLayer,                     // 3. Confirm JWT authentication tokens footprint
    gatewayRoutingEngine           // 4. Dispatch traffic downward onto internal targets
);

// Fallback unmapped paths route handler
app.use((req, res) => {
    res.status(404).json({ error: "Routing path not found inside SecureAPI Nexus Gateway mapping definitions." });
});

app.listen(PORT, () => {
    console.log(`\n🛡️ [SecureAPI Nexus] Central Gateway Active on port: ${PORT}`);
    console.log(`🔀 [SecureAPI Nexus] Mapping route /v1/mobile to private targets: ${BACKEND_SERVICE_URL}\n`);
});
