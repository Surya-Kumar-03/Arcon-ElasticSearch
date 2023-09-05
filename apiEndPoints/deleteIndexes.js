/* Deletes all the indexes generated so far
HANDLE WITH CAUTION: SEARCHING AFTER DELETING MAY CAUSE INTERNAL SERVER ERRORS */
const express = require("express");
const router = express.Router();
const { removeAllIndexes } = require("../elasticSearch/elasticsearch");

router.delete("/", async (req, res) => {
  try {
    await removeAllIndexes();
    res.json({ message: "All indexes removed." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
