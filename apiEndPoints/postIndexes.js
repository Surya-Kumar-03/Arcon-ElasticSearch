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

      const readStream = fs.createReadStream(filePath, "utf8");
      const batch = [];
      let rowsProcessed = 0;

      readStream.on("data", (chunk) => {
        // Process the chunk (e.g., split into rows, process rows)
        const rows = chunk.split("\n");

        for (const row of rows) {
          const columns = row.split("|");
          if (columns.length !== 28) {
            console.error(
              `Skipping row in ${file} due to invalid format: ${row}`
            );
            continue;
          }

          const logDocument = {
            dbl_id: columns[0],
            ssl_log_id: columns[1],
            dbl_command: columns[2],
            dba_last_logged_in: convertToISOString(columns[4]),
            dba_user_id: columns[8],
            dba_user_display_name: columns[9],
            dba_ipaddress_desktop: columns[10],
            dbs_servicetype: columns[11],
            file_name: file,
          };

          batch.push({ index: { _index: "logs", _type: "_doc" } });
          batch.push(logDocument);

          rowsProcessed++;

          if (batch.length >= 1000) {
            readStream.pause(); // Pause reading to avoid excessive memory use
            client.bulk({ body: batch }, (err, response) => {
              if (err) {
                console.error("Error during bulk indexing:", err);
                // Implement error handling and retries as needed
              } else {
                console.log(`Indexed rows from file ${file}: ${rowsProcessed}`);
                batch.length = 0; // Reset batch
                readStream.resume(); // Resume reading
              }
            });
          }
        }
      });

      readStream.on("end", () => {
        if (batch.length > 0) {
          client.bulk({ body: batch }, (err, response) => {
            if (err) {
              console.error("Error during bulk indexing:", err);
              // Implement error handling and retries as needed
            } else {
              console.log(`Indexed rows from file ${file}: ${rowsProcessed}`);
            }
          });
        }
      });
    }
  } catch (error) {
    console.error("Error indexing TXT files:", error);
  }
}

function convertToISOString(dateStr) {
  const [date, time] = dateStr.split(" ");
  return `${date}T${time}Z`;
}

module.exports = { router, ensureIndexExists, indexTxtFiles };
