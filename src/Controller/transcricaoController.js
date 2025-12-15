const { transcreverTexto } = require("../transcricao.js");

function create(req, res) {
  try {
    const { text } = req.body;
    const resultado = transcreverTexto(text);
    return res.json({ resultado });
  } catch (error) {
    return res.status(400).json({ erro: "Texto é obrigatório." });
  }
}

module.exports = { create };
