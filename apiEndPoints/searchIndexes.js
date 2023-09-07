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
      sul_active_from,
      sul_active_till,
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

    const searchResult = await client.search({
      index: "logs",
      body: {
        query: {
          bool: {
            should: [
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
                wildcard: {
                  sul_ipaddress: `*${sul_ipaddress}*`,
                },
              },
              // {
              //   range: {
              //     sul_active_from: {
              //       gte: sul_active_from,
              //       lte: sul_active_till || "now",
              //       format: "yyyy-MM-dd HH:mm:ss.SSSSSSSSS",
              //     },
              //   },
              // },
              // {
              //   regexp: {
              //     sul_logout_flag: `.*${sul_logout_flag}.*`,
              //   },
              // },
              // {
              //   bool: {
              //     should: [
              //       {
              //         regexp: {
              //           sul_UserName: `.*${sul_UserName}.*`,
              //         },
              //       },
              //     ],
              //   },
              // },
              // {
              //   bool: {
              //     should: [
              //       {
              //         regexp: {
              //           sul_User_Display_Name: `.*${sul_User_Display_Name}.*`,
              //         },
              //       },
              //     ],
              //   },
              // },
              // {
              //   bool: {
              //     should: [
              //       {
              //         regexp: {
              //           sul_User_Type: `.*${sul_User_Type}.*`,
              //         },
              //       },
              //     ],
              //   },
              // },
              // {
              //   regexp: {
              //     file_name: `.*${file_name}.*`,
              //   },
              // },
              // {
              //   bool: {
              //     should: [
              //       {
              //         regexp: {
              //           sul_connectiontype: `.*${sul_connectiontype}.*`,
              //         },
              //       },
              //     ],
              //   },
              // },
            ],
            minimum_should_match: nonEmptyKeysCount,
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

module.exports = router;

// async function searchLogs(phrase) {
//   try {
//     const searchResult = await client.search({
//       index: "logs",
//       body: {
//         query: {
//           bool: {
//             should: [
//               {
//                 wildcard: {
//                   text_content: {
//                     value: `*${phrase}*`,
//                   },
//                 },
//               },
//               {
//                 fuzzy: {
//                   text_content: {
//                     value: phrase,
//                     fuzziness: "AUTO",
//                   },
//                 },
//               },
//             ],
//           },
//         },
//       },
//     });

//     const hits = searchResult.body.hits.hits.map(
//       (hit) => hit._source.text_content
//     );

//     return {
//       hitsCount: hits.length,
//       hits,
//     };
//   } catch (e) {
//     console.error("Error searching Elasticsearch:", e);
//     throw e;
//   }
// }

// async function searchLogs(query) {
//   try {
//     const searchResult = await client.search({
//       index: "logs", // Replace with your index name
//       body: {
//         query: {
//           bool: {
//             should: [
//               {
//                 match: {
//                   sul_ipaddress: {
//                     query: query,
//                     fuzziness: "AUTO",
//                   },
//                 },
//               },
//               {
//                 wildcard: {
//                   sul_ipaddress: `*${query}*`,
//                 },
//               },
//             ],
//             minimum_should_match: 1,
//           },
//         },
//       },
//     });

//     const hits = searchResult.body.hits.hits.map((hit) => hit._source);

//     return {
//       hitsCount: hits.length,
//       hits,
//     };
//   } catch (e) {
//     console.error("Error searching Elasticsearch:", e);
//     throw e;
//   }
// }
