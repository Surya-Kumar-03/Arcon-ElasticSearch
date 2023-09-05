// Connects with elasticSearch
const path = require("path");

const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://localhost:9200" });
const logFolder = path.join(__dirname, "../logs"); // IMPORTANT logFolder is here

module.exports = { client, logFolder };
