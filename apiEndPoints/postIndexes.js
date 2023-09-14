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
      const startTime = performance.now();
      for (const row of rows) {
        const columns = row.split("|");
        if (columns.length !== 28) {
          console.error(
            `Skipping row in ${file} due to invalid format: ${row}`
          );
          continue;
        }

        function convertToISOString(dateStr) {
          var dateParts = dateStr.split(' ');
          var date = dateParts[0];
          var time = dateParts[1];

          var isoString = date + 'T' + time + 'Z';
          return isoString;
        }


        // Create a structured document with column names
        const logDocument = {
          dbl_id: columns[0],
          ssl_log_id: columns[1],
          dbl_command: columns[2],
          dba_last_logged_in: convertToISOString(columns[4]),
          dba_user_id: columns[8],
          dba_user_display_name: columns[9],
          dba_ipaddress_desktop: columns[10],
          dbs_servicetype: columns[11],
          file_name: file, // file name to identify
        };


        // Index each document
        await client.index({
          index: "logs",
          body: logDocument,
          type: "_doc",
        });

        console.log(`Indexed row from file ${file}:`, logDocument);
      }
      const endTime = performance.now();
      const timeTaken = endTime - startTime;

      const hours = Math.floor(timeTaken / 3600000);
      const minutes = Math.floor((timeTaken % 3600000) / 60000);
      const seconds = ((timeTaken % 3600000) % 60000) / 1000;
      console.log("Time taken for indexing is " + hours + " hours " + minutes + " minutes " + seconds + " seconds.");
    }
  } catch (error) {
    console.error("Error indexing TXT files:", error);
  }
}

module.exports = { router, ensureIndexExists, indexTxtFiles };
