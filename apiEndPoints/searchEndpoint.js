/* Searches for the query via the indexes generated with elastic search */
const express = require("express");
const router = express.Router();
const { searchLogs } = require("../elasticSearch/elasticsearch");

router.get("/", async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Query parameter 'q' is required." });
  }

  try {
    const searchResults = await searchLogs(q);
    res.json(searchResults);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
