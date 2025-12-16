/*
Controller que traduz o texto e devolve o resultado.
*/

const { transcreverTexto } = require("../transcricao.js");

function create(req, res) {
  try {
    //extrai o texto da requisição
    const { text } = req.body;
    //chama e recebe o resultado
    const resultado = transcreverTexto(text);
    return res.json({ resultado });
  } catch (error) {
    //retorna erro
    return res.status(400).json({ erro: "Texto é obrigatório." });
  }
}

module.exports = { create };
