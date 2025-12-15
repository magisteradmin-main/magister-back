const { Router } = require("express");
const transcricaoController = require("./Controller/transcricaoController.js");
const routes = Router();

routes.post("/transcricao", transcricaoController.create);

module.exports = routes;
