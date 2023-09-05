/* Indexes all the log files to elastic search for faster retrieval */
const express = require("express");
const router = express.Router();
const {
  ensureIndexExists,
  indexTxtFiles,
  removeAllIndexes,
} = require("../elasticSearch/elasticsearch");

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

module.exports = router;
