// backend/server.js
const express = require('express');
const cors = require('cors');
const accountRouter = require('./routes/account');

const app = express();
const PORT = 5000;

app.use(cors()); // Allow internal requests from the Gateway
app.use(express.json());

// Mount routes
app.use('/api', accountRouter);

app.listen(PORT, () => {
    console.log(`Backend service active on port ${PORT}`);
});
