const substituicoes = require("./Data/substituicoes");

/**
 * @param {string} text -
 * @returns {string}
 */
function removerAcentos(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function createAccentInsensitiveRegex(word) {
  const accentMap = {
    a: "[aAáÁàÀãÃâÂäÄ]",
    e: "[eEéÉèÈêÊëË]",
    i: "[iIíÍìÌîÎïÏ]",
    o: "[oOóÓòÒõÕôÔöÖ]",
    u: "[uUúÚùÙûÛüÜ]",
    c: "[cçCÇ]",
  };

  const baseWord = removerAcentos(word);
  let pattern = "";

  for (const char of baseWord) {
    const lowerChar = char.toLowerCase();

    pattern += accentMap[lowerChar] || char;
  }

  const boundaryLeft = "(?<![a-zA-Z0-9\\u00C0-\\u00FF])";
  const boundaryRight = "(?![a-zA-Z0-9\\u00C0-\\u00FF])";

  return new RegExp(`${boundaryLeft}${pattern}${boundaryRight}`, "gi");
}

function transcreverTexto(text) {
  const ALMA = "Alma";
  const CONSCIENCIA = "Consciência";
  const TERRA = "Terra";
  const TOKEN_ALMA_DA_TERRA = "Alma";

  let textoTranscrito = text;

  const regras_filtradas = substituicoes.filter(
    ([palavra_original, palavra_transcrita]) => {
      return !(palavra_original === ALMA && palavra_transcrita === CONSCIENCIA);
    }
  );

  const substituicoesOrdenadas = regras_filtradas
    .slice()
    .sort(([a], [b]) => b.length - a.length);

  const padraoBuscaAlma = createAccentInsensitiveRegex(ALMA);
  textoTranscrito = textoTranscrito.replace(padraoBuscaAlma, CONSCIENCIA);

  substituicoesOrdenadas.forEach(([palavra_original, palavra_transcrita]) => {
    let valor_substituido = palavra_transcrita;

    if (palavra_original === TERRA && palavra_transcrita === ALMA) {
      valor_substituido = TOKEN_ALMA_DA_TERRA;
    }

    const padraoBusca = createAccentInsensitiveRegex(palavra_original);
    textoTranscrito = textoTranscrito.replace(padraoBusca, valor_substituido);
  });

  const padraoBuscaToken = createAccentInsensitiveRegex(TOKEN_ALMA_DA_TERRA);
  textoTranscrito = textoTranscrito.replace(padraoBuscaToken, ALMA);

  return textoTranscrito;
}

module.exports = { transcreverTexto, removerAcentos };
