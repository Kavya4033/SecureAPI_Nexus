// Standardised Structured Logger Engine
const logIncident = (req, threatMessage) => {
    const jsonAlertLog = {
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId,
        ip: req.ip,
        deviceId: req.headers['x-device-id'] || 'N/A',
        routePath: req.originalUrl,
        payloadMatched: req.body,
        alertDetails: threatMessage
    };
    
    // Output stringified JSON log for monitoring engines
    console.error(`[SECURITY ALERT] ${JSON.stringify(jsonAlertLog)}`);
};

// Route interceptor middleware to catch failures
const interceptSecurityLogs = (req, res, next) => {
    res.on('finish', () => {
        // If a request was stopped and assigned an alert, log the incident
        if (req.securityAlert || res.statusCode >= 400) {
            logIncident(req, req.securityAlert || `HTTP error returned: ${res.statusCode}`);
        }
    });
    next();
};

module.exports = { interceptSecurityLogs, logIncident };
