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

      // Splits the content into rows based on a delimiter (e.g., newline)
      const rows = content.split("\n");

      for (const row of rows) {
        const columns = row.split("|");
        if (columns.length !== 16) {
          console.error(
            `Skipping row in ${file} due to invalid format: ${row}`
          );
          continue;
        }

        // Create a structured document with column names
        const logDocument = {
          sul_id: columns[0],
          sul_user_id: columns[1],
          sul_ipaddress: columns[2],
          sul_active_from: columns[3],
          sul_active_till: columns[4],
          sul_timestamped_on: columns[5],
          sul_logout_flag: columns[6],
          sul_UserName: columns[7],
          sul_User_Display_Name: columns[8],
          sul_User_Type: columns[9],
          sul_User_Type_ID: columns[10],
          sul_sessionstarttime_source: columns[11],
          sul_sessionendtime_source: columns[12],
          sul_host_region_timezone: columns[13],
          sul_sessionfor: columns[14],
          sul_connectiontype: columns[15], 
          file_name: file, // file name to indentify
        };

        // Index each document
        await client.index({
          index: "logs",
          body: logDocument, 
          type: "_doc"
        });

        console.log(`Indexed row from file ${file}:`, logDocument);
      }
    }
  } catch (error) {
    console.error("Error indexing TXT files:", error);
  }
}

module.exports = { router, ensureIndexExists, indexTxtFiles };
