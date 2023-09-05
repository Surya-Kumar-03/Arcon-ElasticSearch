/* Deletes all the indexes generated so far
HANDLE WITH CAUTION: SEARCHING AFTER DELETING MAY CAUSE INTERNAL SERVER ERRORS */
const express = require("express");
const router = express.Router();
const { client } = require("../elasticSearch/elasticsearch");

router.delete("/", async (req, res) => {
  try {
    await removeAllIndexes();
    res.json({ message: "All indexes removed." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

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

module.exports = { router, removeAllIndexes };
