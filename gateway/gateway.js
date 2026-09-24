const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const redis = require('redis');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import our custom security layers
const authLayer = require('./middlewares/auth');
const rateLimiterLayer = require('./middlewares/limiter');
const threatDetectorLayer = require('./middlewares/detector');
const loggerLayer = require('./middlewares/logger');

const app = express();
const PORT = process.env.PORT || 8000;
const BACKEND_SERVICE_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Initialize Redis Client for High-Speed Memory Lookups
const redisClient = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.connect()
    .then(() => console.log('[SecureAPI Nexus] Cache Layer (Redis) connected.'))
    .catch((err) => console.error('[SecureAPI Nexus] Redis initialization failed:', err));

// Parse incoming JSON payloads strictly for structural threat inspection
app.use(express.json());

// ==========================================
// LAYER 0: DISTRIBUTED CORRELATION TRACING
// ==========================================
app.use((req, res, next) => {
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();
    next();
});

// Attach the structural auditing log listener 
app.use(loggerLayer.interceptSecurityLogs);

// ==========================================
// ROUTING PROXY CONFIGURATION (DOWNSTREAM PIPELINE)
// ==========================================
const secureProxyOptions = {
    target: BACKEND_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/v1/mobile': '/internal/account' // Remaps external public routes to private endpoints
    },
    on: {
        proxyReq: (proxyReq, req, res) => {
            // Forward the validated structural tracing header
            proxyReq.setHeader('X-Correlation-ID', req.correlationId);
            
            // Context Injection: Inject trusted access info so backends don't re-query the DB
            if (req.user) {
                proxyReq.setHeader('X-Authenticated-User', JSON.stringify(req.user));
            }
        }
    }
};

const gatewayRoutingEngine = createProxyMiddleware(secureProxyOptions);

// ==========================================
// THE GATEWAY SECURITY PIPELINE
// ==========================================
app.use('/v1/mobile', 
    authLayer, 
    rateLimiterLayer(redisClient), 
    threatDetectorLayer, 
    gatewayRoutingEngine
);

// Fallback error fallback route for unmapped paths
app.use((req, res) => {
    res.status(404).json({ error: "Routing path not found inside SecureAPI Nexus Gateway mapping definitions." });
});

app.listen(PORT, () => {
    console.log(`\n🛡️ [SecureAPI Nexus] Central Gateway Active on port: ${PORT}`);
    console.log(`🔀 [SecureAPI Nexus] Mapping route /v1/mobile to private targets: ${BACKEND_SERVICE_URL}\n`);
});
