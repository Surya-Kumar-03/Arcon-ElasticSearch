const express = require("express");
const router = express.Router();
const { client } = require("../elasticSearch/elasticsearch");

router.post("/", async (req, res) => {
  const queryData = req.body;
  console.log(queryData);
  if (!queryData) {
    return res.status(400).json({ error: "Bad Request" });
  }

  try {
    const searchResults = await searchLogs(queryData);
    res.json(searchResults);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

async function searchLogs(queryData) {
  try {
    const { time, uri_path } = queryData;

    const conditions = [];

    if (uri_path && uri_path.trim() !== "") {
      conditions.push({
        wildcard: {
          uri_path: `*${uri_path}*`,
        },
      });
    }

    const searchResult = await client.search({
      index: "logs",
      body: {
        query: {
          bool: {
            should: conditions.length > 0 ? conditions : { match_all: {} },
          },
        },
      },
    });

    const hits = searchResult.body.hits.hits.map((hit) => hit._source);

    return {
      hitsCount: hits.length,
      hits,
    };
  } catch (e) {
    console.error("Error searching Elasticsearch:", e);
    throw e;
  }
}

module.exports = router;
