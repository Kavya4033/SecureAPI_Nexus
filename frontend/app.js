// Configuration Coordinates for the Central Edge Gateway Proxy Sub-System
const GATEWAY_URL = 'http://localhost:8000/v1/mobile';
const MOCK_DEVICE_ID = 'MOB-DEVICE-UUID-9921A';
const MOCK_JWT_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyX21vYl85OTIxIiwicm9sZSI6Im1vYmlsZV9jbGllbnQifQ';

// DOM Interconnection Anchors
const balanceDisplay = document.getElementById('balance-display');
const clientStatusText = document.getElementById('client-status-text');
const networkResponseBox = document.getElementById('network-response-box');
const siemLogsContainer = document.getElementById('siem-logs-container');

const btnFetchBalance = document.getElementById('btn-fetch-balance');
const btnAttackRate = document.getElementById('btn-attack-rate');
const btnAttackSqli = document.getElementById('btn-attack-sqli');

// Helper Utility: Adds structured logs onto Screen 3 (SIEM Dashboard)
// Replace ONLY the injectSIEMLog function inside frontend/app.js:
function injectSIEMLog(type, message, status, correlationId) {
    if (siemLogsContainer.querySelector('.placeholder-text')) {
        siemLogsContainer.innerHTML = '';
    }

    const timestamp = new Date().toLocaleTimeString();
    const isSuccess = status >= 200 && status < 300;
    
    // Assign pure CSS explicit border accent variations
    const borderStyle = isSuccess ? 'border-left: 3px solid var(--color-emerald);' : 'border-left: 3px solid var(--color-rose);';

    const logRow = document.createElement('div');
    logRow.className = `log-entry animate-fadeIn`;
    logRow.style = borderStyle;
    logRow.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; color: ${isSuccess ? 'var(--color-emerald)' : 'var(--color-rose)'}">
                HTTP ${status} [${type}]
            </span>
            <span style="color: var(--text-muted); font-size: 10px;">${timestamp}</span>
        </div>
        <p style="color: #cbd5e1; margin-top: 2px;">${message}</p>
        <div style="font-size: 10px; color: #475569; display: flex; justify-content: space-between; margin-top: 4px; border-top: 1px solid #1e293b; pt: 4px;">
            <span>CID: ${correlationId || 'N/A'}</span>
        </div>
    `;
    
    siemLogsContainer.insertBefore(logRow, siemLogsContainer.firstChild);
}

// Helper Utility: Updates the raw code execution inspector box on Screen 2
function updateInspector(status, data) {
    networkResponseBox.className = status === 200 ? 'text-emerald-400 whitespace-pre-wrap' : 'text-rose-400 whitespace-pre-wrap';
    networkResponseBox.innerText = `HTTP/1.1 ${status}\n` + JSON.stringify(data, null, 2);
}

// ==========================================
// INTERACTION SYSTEM 1: STANDARD AUTHORIZED ACCESSIBILITY
// ==========================================
btnFetchBalance.addEventListener('click', async () => {
    clientStatusText.innerText = "Connecting to edge gateway proxy pipeline...";
    
    try {
        const response = await fetch(`${GATEWAY_URL}/account/balance`, {
            method: 'POST',
            headers: {
                'Authorization': MOCK_JWT_TOKEN,
                'X-Device-ID': MOCK_DEVICE_ID,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: "read_balance" })
        });

        const data = await response.json();
        updateInspector(response.status, data);

        if (response.ok) {
            balanceDisplay.innerText = `$${data.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
            balanceDisplay.className = "text-3xl font-extrabold text-emerald-400 mt-1";
            clientStatusText.innerText = "Data updated securely via internal proxy connection channels.";
            injectSIEMLog('FETCH', 'Authorized query executed successfully.', response.status, data.cid);
        } else {
            throw new Error(data.error || 'Gateway Rejected Request');
        }
    } catch (error) {
        balanceDisplay.innerText = "\$*,***.**";
        balanceDisplay.className = "text-3xl font-extrabold text-rose-500 mt-1";
        clientStatusText.innerText = `Connection Terminated: ${error.message}`;
        injectSIEMLog('BLOCKED', error.message, 401, 'N/A');
    }
});

// ==========================================
// INTERACTION SYSTEM 2: RATE LIMIT EXPLOIT ATTACK
// ==========================================
btnAttackRate.addEventListener('click', async () => {
    btnAttackRate.disabled = true;
    btnAttackRate.innerText = "Firing Concurrent Attacks (120 Requests)...";
    
    let blockedCaught = false;
    let lastStatus = 200;
    let lastData = {};

    // Simulate high-volume micro-burst concurrency looping patterns
    for (let i = 0; i < 120; i++) {
        fetch(`${GATEWAY_URL}/account/balance`, {
            method: 'POST',
            headers: {
                'Authorization': MOCK_JWT_TOKEN,
                'X-Device-ID': MOCK_DEVICE_ID,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: "read_balance" })
        }).then(async (res) => {
            const parsed = await res.json();
            if (res.status === 429 && !blockedCaught) {
                blockedCaught = true;
                updateInspector(res.status, parsed);
                injectSIEMLog('DOS_BLOCK', 'Redis Sliding Window tripped. Rate limiter dropped threat.', res.status, parsed.cid);
            }
        }).catch(() => {});
    }

    // Restore interface controls after execution sequence
    setTimeout(() => {
        btnAttackRate.disabled = false;
        btnAttackRate.innerText = "Launch Automated Rate Attack";
    }, 2000);
});

// ==========================================
// INTERACTION SYSTEM 3: SQL INJECTION (SQLi) EXPLOIT ATTACK
// ==========================================
btnAttackSqli.addEventListener('click', async () => {
    try {
        const response = await fetch(`${GATEWAY_URL}/account/balance`, {
            method: 'POST',
            headers: {
                'Authorization': MOCK_JWT_TOKEN,
                'X-Device-ID': MOCK_DEVICE_ID,
                'Content-Type': 'application/json'
            },
            // Malicious application string injected within core structural field payloads
            body: JSON.stringify({ 
                action: "read_balance",
                accountQuery: "SELECT * FROM accounts WHERE id = '9921' UNION SELECT credit_card, cvv FROM master_vault; --" 
            })
        });

        const data = await response.json();
        updateInspector(response.status, data);

        if (response.status === 400) {
            injectSIEMLog('SQLI_BLOCK', 'Regex Match: Dropped payload containing injection vectors.', response.status, data.cid);
        } else {
            injectSIEMLog('VULN_EXPOSED', 'Exploit payload bypass confirmed.', response.status, data.cid);
        }
    } catch (error) {
        console.error("Network interface error:", error);
    }
});
