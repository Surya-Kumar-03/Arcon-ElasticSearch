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
      sul_id,
      sul_user_id,
      sul_ipaddress,
      sul_active_from_start,
      sul_active_from_end,
      sul_active_till_start,
      sul_active_till_end,
      sul_timestamped_on,
      sul_logout_flag,
      sul_UserName,
      sul_User_Display_Name,
      sul_User_Type,
      file_name,
      sul_connectiontype,
    } = queryData;

    const nonEmptyKeysCount = Object.values(queryData).filter(
      (value) => value !== ""
    ).length;
    console.log(nonEmptyKeysCount);

    const conditions = [
      {
        match: {
          sul_id: sul_id,
        },
      },
      {
        match: {
          sul_user_id: sul_user_id,
        },
      },
      {
        match: {
          sul_logout_flag: sul_logout_flag,
        },
      },
      {
        match: {
          sul_User_Type: sul_User_Type,
        },
      },
      {
        match: {
          file_name: file_name,
        },
      },
    ];

    if (sul_ipaddress !== "") {
      conditions.push({
        wildcard: {
          sul_ipaddress: `*${sul_ipaddress}*`,
        },
      });
    }

    if (sul_UserName !== "") {
      conditions.push({
        wildcard: {
          sul_UserName: `*${sul_UserName}*`,
        },
      });
    }

    if (sul_User_Display_Name !== "") {
      conditions.push({
        wildcard: {
          sul_User_Display_Name: `*${sul_User_Display_Name}*`,
        },
      });
    }

    const dates = [];

    if (sul_active_from_start !== "" && sul_active_from_end !== "") {
      dates.push({
        range: {
          sul_active_from: {
            gte: sul_active_from_start,
            lte: sul_active_from_end,
          },
        },
      });
    }

    if (sul_active_till_start !== "" && sul_active_till_end !== "") {
      dates.push({
        range: {
          sul_active_till: {
            gte: sul_active_till_start,
            lte: sul_active_till_end,
          },
        },
      });
    }

    if (sul_timestamped_on !== "") {
      conditions.push({
        range: {
          sul_timestamped_on: {
            gte: sul_timestamped_on,
            lte: sul_timestamped_on,
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
            must: [
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
