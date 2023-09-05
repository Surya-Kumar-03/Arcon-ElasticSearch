/* Indexes all the log files to elastic search for faster retrieval */
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { client, logFolder } = require("../elasticSearch/elasticsearch");
const { removeAllIndexes } = require("./deleteIndexes");

router.post("/", async (req, res) => {
  try {
    await removeAllIndexes();
    await ensureIndexExists();
    await indexTxtFiles();
    res.json({ message: "All files indexed successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

async function ensureIndexExists() {
  const indexExists = await client.indices.exists({ index: "logs" });
  if (!indexExists.body) {
    await client.indices.create({ index: "logs" });
  }
}

async function indexTxtFiles() {
  try {
    const logFiles = fs.readdirSync(logFolder);

    for (const file of logFiles) {
      const filePath = path.join(logFolder, file);
      const content = fs.readFileSync(filePath, "utf8");

      // Split the content into rows based on a delimiter (e.g., newline)
      const rows = content.split("\n");

      for (const row of rows) {
        // Index each row as a separate document
        await client.index({
          index: "logs",
          type: "_doc",
          body: {
            text_content: row, // Index the row as text_content
          },
        });

        console.log(`Indexed row from file ${file}: ${row}`);
      }
    }
  } catch (error) {
    console.error("Error indexing TXT files:", error);
  }
}
module.exports = { router, ensureIndexExists, indexTxtFiles };
