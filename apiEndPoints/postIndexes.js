const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const csvParser = require("csv-parser");

const { client, logFolder } = require("../elasticSearch/elasticsearch");
const { removeAllIndexes } = require("./deleteIndexes");

router.post("/", async (req, res) => {
  try {
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

    function convertToISOString(dateStr) {
      if (dateStr == null) return "";
      var dateParts = dateStr.split(" ");
      var date = dateParts[0];
      var time = dateParts[1];

      var isoString = date + "T" + time + "Z";
      return isoString;
    }

    fs.createReadStream(filePath, "utf8")
      .pipe(csvParser())
      .on("data", (data) => {
        const jsonData = {
          dbl_id: data.dbl_id,
          ssl_log_id: data.ssl_log_id,
          dbl_command: data.dbl_command,
          dba_last_logged_in: convertToISOString(data.dba_last_logged_in),
          dba_user_id: data.dba_user_id,
          dba_user_display_name: data.dba_user_display_name,
          dba_ipaddress_desktop: data.dba_ipaddress_desktop,
          dbs_servicetype: data.dbs_servicetype,
        };

        bulkRequestBody.push({
          index: { _index: "logs", _type: "_doc" },
        });

        bulkRequestBody.push(jsonData);
      })
      .on("end", () => {
        if (bulkRequestBody.length > 0) {
          client
            .bulk({ body: bulkRequestBody })
            .then((response) => {
              if (response.body.errors) {
                console.error(
                  "Error during bulk indexing:",
                  response.body.errors
                );
              } else {
                console.log("CSV file indexed successfully.");
              }
            })
            .catch((error) => {
              console.error("Error during bulk indexing:", error);
            });
        }
      });
  } catch (error) {
    console.error("Error indexing CSV file:", error);
  }
}

module.exports = { router, ensureIndexExists, indexCsvFile };
