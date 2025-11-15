const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Serve static files from public folder
app.use(express.static(__dirname + "/public"));

// Simple route to test server
app.get("/api", (req, res) => {
  res.send("✅ Server is running properly!");
});

// Currency conversion endpoint
app.post("/convert", async (req, res) => {
  const { amount, from, to } = req.body;

  const parsedAmount = parseFloat(amount);

  if (!amount || isNaN(parsedAmount) || parsedAmount <= 0 || !from || !to) {
    return res.status(400).json({ error: "Invalid amount: must be a positive number" });
  }

  try {
    // Fetch exchange rates from a free API (using exchangerate-api.com)
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
    const rates = response.data.rates;

    if (!rates[to]) {
      return res.status(400).json({ error: `Currency ${to} not supported` });
    }

    const convertedAmount = (parsedAmount * rates[to]).toFixed(2);
    res.json({
      originalAmount: parsedAmount,
      fromCurrency: from,
      toCurrency: to,
      convertedAmount: convertedAmount,
      exchangeRate: rates[to]
    });
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    res.status(500).json({ error: "Failed to fetch exchange rates" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
