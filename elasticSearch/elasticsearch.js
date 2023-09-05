// Performs all elastic search operations
const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://localhost:9200" });
const fs = require("fs");
const path = require("path");

const logFolder = path.join(__dirname, "../logs"); // IMPORTANT logFolder is here

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

module.exports = {
  ensureIndexExists,
  removeAllIndexes,
  searchLogs,
  indexTxtFiles,
};
