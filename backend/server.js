const express = require('express');
const accountRoutes = require('./routes/account');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Mount our private account paths
app.use('/internal/account', accountRoutes);

// Catch-all route to notify direct unauthorized access attempts
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found or directly inaccessible." });
});

app.listen(PORT, () => {
    console.log(`[Backend Microservice] Running internally on port ${PORT}`);
});
