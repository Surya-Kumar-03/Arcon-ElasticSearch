/* Searches for the query via the indexes generated with elastic search */
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
    const {
      dbl_id,
      ssl_log_id,
      dbl_command,
      dba_last_logged_in_start,
      dba_last_logged_in_end,
      dba_user_id,
      dba_user_display_name,
      dba_ipaddress_desktop,
      dbs_servicetype
    } = queryData;

    const nonEmptyKeysCount = Object.values(queryData).filter(
      (value) => value !== ""
    ).length;
    console.log(nonEmptyKeysCount);

    const conditions = [
      {
        match: {
          dbl_id: dbl_id,
        },
      },
      {
        match: {
          ssl_log_id: ssl_log_id,
        },
      },
      {
        match: {
          dba_ipaddress_desktop: dba_ipaddress_desktop,
        },
      },
      {
        match: {
          dbs_servicetype: dbs_servicetype,
        }
      }
    ];

    if (dbl_command !== "") {
      conditions.push({
        wildcard: {
          dbl_command: `*${dbl_command}*`,
        },
      });
    }


    if (dba_user_display_name !== "") {
      conditions.push({
        wildcard: {
          dba_user_display_name: `*${dba_user_display_name}*`,
        },
      });
    }

    const dates = [];

    if (dba_last_logged_in_start !== "" && dba_last_logged_in_end !== "") {
      dates.push({
        range: {
          dba_last_logged_in: {
            gte: dba_last_logged_in_start,
            lte: dba_last_logged_in_end,
          },
        },
      });
    }

    console.log(dates);
    const searchResult = await client.search({
      index: "logs",
      body: {
        query: {
          bool: {
            should: [
              {
                bool: {
                  should: conditions,
                },
              },
              {
                bool: {
                  filter: dates,
                },
              },
            ],
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

// function convertDateToFrontendFormat(dateString) {
//   if (!dateString) return;
//   console.log(dateString);
//   const date = new Date(dateString);
//   return date.toISOString();
// }

module.exports = router;
