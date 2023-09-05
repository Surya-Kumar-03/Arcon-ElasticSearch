// Entry point of the back-end server
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () =>
  console.log("Server is running at http://localhost:3000")
);

//Index the files on the start of the server
const {
  removeAllIndexes,
  ensureIndexExists,
  indexTxtFiles,
} = require("./elasticSearch/elasticsearch");
async function initialIndexing() {
  await removeAllIndexes(); // removes the older indexes
  await ensureIndexExists();
  await indexTxtFiles();
}
initialIndexing();

const indexEndpoint = require("./apiEndPoints/postIndexes");
const searchEndpoint = require("./apiEndPoints/searchIndexes");
const deleteIndexesEndpoint = require("./apiEndPoints/deleteIndexes");

app.use("/index", indexEndpoint); // POST
app.use("/search", searchEndpoint); // GET
app.use("/index", deleteIndexesEndpoint); // DELETE
