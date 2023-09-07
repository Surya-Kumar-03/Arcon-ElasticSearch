// Entry point of the back-end server
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require("cors");
app.use(cors());

app.listen(8000, () =>
  console.log("Server is running at http://localhost:8000")
);

//Index the files on the start of the server
// const { removeAllIndexes } = require("./apiEndPoints/deleteIndexes");
// const {
//   ensureIndexExists,
//   indexTxtFiles,
// } = require("./apiEndPoints/postIndexes");
// async function initialIndexing() {
//   await removeAllIndexes(); // removes the older indexes
//   await ensureIndexExists();
//   await indexTxtFiles();
// }
// initialIndexing();

const indexEndpoint = require("./apiEndPoints/postIndexes").router;
const searchEndpoint = require("./apiEndPoints/searchIndexes");
const deleteIndexesEndpoint = require("./apiEndPoints/deleteIndexes").router;

app.use("/index", indexEndpoint); // POST
app.use("/search", searchEndpoint); // POST
app.use("/index", deleteIndexesEndpoint); // DELETE
