const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { Client } = require("@elastic/elasticsearch");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client = new Client({ node: "http://localhost:9200" });

const logFolder = path.join(__dirname, "logs");

// Ensure that the Elasticsearch index exists (create it if it doesn't)
async function ensureIndexExists() {
  const indexExists = await client.indices.exists({ index: "logs" });
  if (!indexExists.body) {
    await client.indices.create({ index: "logs" });
  }
}

// Index all TXT files in the "logs" folder
async function indexTxtFiles() {
  try {
    const logFiles = fs.readdirSync(logFolder);

    for (const file of logFiles) {
      const filePath = path.join(logFolder, file);
      const content = fs.readFileSync(filePath, "utf8");

      await client.index({
        index: "logs",
        type: "_doc",
        body: {
          text_content: content,
        },
      });

      console.log(`Indexed TXT file: ${file}`);
    }
  } catch (error) {
    console.error("Error indexing TXT files:", error);
  }
}

// Ensure the index exists and then index TXT files
ensureIndexExists().then(() => {
  indexTxtFiles();
});

app.post("/index", async (req, res) => {
  try {
    await removeAllIndexes(); //Remove all old indexes
    await ensureIndexExists();
    await indexTxtFiles();
    res.json({ message: "All files indexed successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/search", async (req, res) => {
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

// Remove all indexes
async function removeAllIndexes() {
  try {
    const indexNames = await client.cat.indices({ format: "json" });

    for (const index of indexNames.body) {
      await client.indices.delete({ index: index.index });
      console.log(`Deleted index: ${index.index}`);
    }

    console.log("All indexes removed.");
  } catch (error) {
    console.error("Error removing indexes:", error);
  }
}

// Define a DELETE endpoint to remove all indexes
app.delete("/indexes", async (req, res) => {
  try {
    await removeAllIndexes();
    res.json({ message: "All indexes removed." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(3000, () =>
  console.log("Server is running at http://localhost:3000")
);
