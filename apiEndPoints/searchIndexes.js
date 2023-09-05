/* Searches for the query via the indexes generated with elastic search */
const express = require("express");
const router = express.Router();
const { client } = require("../elasticSearch/elasticsearch");

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

async function searchLogs(phrase) {
  try {
    const searchResult = await client.search({
      index: "logs",
      body: {
        query: {
          match: {
            text_content: phrase,
          },
        },
      },
    });

    return {
      hitsCount: searchResult.body.hits.total.value,
      hits: searchResult.body.hits.hits,
    };
  } catch (e) {
    console.error("Error searching Elasticsearch:", e);
    throw e;
  }
}

module.exports = router;
