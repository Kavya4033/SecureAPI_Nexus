const { logIncident } = require('./logger');

module.exports = (req, res, next) => {
    const { accountQuery } = req.body;

    if (accountQuery) {
        const sqlInjectionRegex = /UNION|SELECT|INSERT|UPDATE|DELETE|--|DROP/i;
        if (sqlInjectionRegex.test(accountQuery)) {
            const alertMsg = "Regex Match: Dropped payload containing injection vectors.";
            
            // Populate tracking markers for our log interceptor
            req.securityAlert = alertMsg;

            return res.status(400).json({
                status: "Blocked",
                error: "Bad Request / Threat Flagged",
                message: alertMsg,
                cid: req.correlationId
            });
        }
    }

    next();
};
