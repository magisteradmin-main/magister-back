const express = require("express");
const routes = require("./src/routes");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ message: `Rota '${req.originalUrl}' não encontrada` });
});

module.exports = app;
