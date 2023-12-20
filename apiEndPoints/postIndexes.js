const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const readline = require("readline");
// const csvParser = require("csv-parser");

const { client, logFolder } = require("../elasticSearch/elasticsearch");
const { removeAllIndexes } = require("./deleteIndexes");

router.post("/", async (req, res) => {
  try {
    console.log("Started Indexing..");
    await removeAllIndexes();
    await ensureIndexExists();
    await indexCsvFile();
    res.json({ message: "CSV file indexed successfully." });
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

async function indexCsvFile() {
  try {
    const filePath = path.join(logFolder, "test.csv");

    if (!fs.existsSync(filePath)) {
      console.error(`CSV file not found at ${filePath}`);
      return;
    }

    const bulkRequestBody = [];
    let lineNumber = 0;

    const readInterface = readline.createInterface({
      input: fs.createReadStream(filePath, "utf8"),
      console: false,
    });

    readInterface.on("line", (line) => {
      if (lineNumber === 0) {
        // Skip header line
        lineNumber++;
        return;
      }

      const [time, uri_path] = line
        .split('","')
        .map((entry) => entry.replace(/"/g, ""));

      const jsonData = {
        time,
        uri_path,
      };

      bulkRequestBody.push({
        index: { _index: "logs", _type: "_doc" },
      });

      bulkRequestBody.push(jsonData);

      // Adjust batch size as needed
      if (bulkRequestBody.length >= 100) {
        performBulkIndexing(bulkRequestBody);
        bulkRequestBody.length = 0;
      }

      lineNumber++;
    });

    readInterface.on("close", () => {
      // Index any remaining documents
      if (bulkRequestBody.length > 0) {
        performBulkIndexing(bulkRequestBody);
      }

      console.log("CSV file indexed successfully.");
    });
  } catch (error) {
    console.error("Error indexing CSV file:", error);
  }
}

async function performBulkIndexing(bulkRequestBody) {
  try {
    const response = await client.bulk({ body: bulkRequestBody });
    if (response.body.errors) {
      console.error("Errors occurred during bulk indexing:");
      response.body.items.forEach((action, i) => {
        if (action.index && action.index.error) {
          console.error(`Error at item ${i}:`, action.index.error);
        }
      });
    } else {
      console.log("CSV file indexed successfully.");
    }
  } catch (error) {
    console.error("Error during bulk indexing:", error);
  }
}

module.exports = { router, ensureIndexExists, indexCsvFile };
