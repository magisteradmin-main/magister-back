// Importa a lista de regras de substituição do arquivo 'substituicoes.js' dentro da pasta 'Data'.
const substituicoes = require("./Data/substituicoes");

/**
 * Remove acentos de uma string de texto.
 * Utiliza a normalização Unicode para separar os caracteres base dos diacríticos
 * e, em seguida, remove os diacríticos.
 * @param {string} text - O texto de entrada para remover os acentos.
 * @returns {string} O texto sem acentos.
 */
function removerAcentos(text) {
  // Normaliza a string para a forma de decomposição canônica (NFD),
  // que separa os caracteres base de seus diacríticos (acentos).
  // Em seguida, remove todos os caracteres na faixa Unicode de diacríticos combinados (U+0300 a U+036f).
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Cria uma expressão regular que faz uma busca insensível a acentos e case-sensitive.
 * Tenta garantir que a busca seja por "palavra inteira" usando lookbehind/lookahead.
 * @param {string} word - A palavra para a qual criar a regex.
 * @returns {RegExp} Uma expressão regular para busca insensível a acentos.
 */
function createAccentInsensitiveRegex(word) {
  // Mapeia caracteres base para uma classe de caracteres que inclui todas as suas variações (acentuadas, maiúsculas/minúsculas).
  const accentMap = {
    a: "[aAáÁàÀãÃâÂäÄ]", // Caracteres 'a' e suas variações acentuadas/maiúsculas.
    e: "[eEéÉèÈêÊëË]", // Caracteres 'e' e suas variações.
    i: "[iIíÍìÌîÎïÏ]", // Caracteres 'i' e suas variações.
    o: "[oOóÓòÒõÕôÔöÖ]", // Caracteres 'o' e suas variações.
    u: "[uUúÚùÙûÛüÜ]", // Caracteres 'u' e suas variações.
    c: "[cçCÇ]", // Caracteres 'c' e 'ç' e suas variações.
  };

  // Remove acentos da palavra original para construir o padrão base da regex.
  const baseWord = removerAcentos(word);
  let pattern = "";

  // Constrói o padrão da regex caractere por caractere.
  for (const char of baseWord) {
    const lowerChar = char.toLowerCase();
    // Se o caractere tem um mapeamento de acentos, usa a classe de caracteres correspondente.
    // Caso contrário (para outros caracteres como números, símbolos, etc.), usa o próprio caractere.
    pattern += accentMap[lowerChar] || char;
  }

  // Define as bordas da palavra para garantir que a substituição ocorra em palavras inteiras.
  // (?<![a-zA-Z0-9\u00C0-\u00FF]) -> Negative lookbehind: garante que o que *precede* não seja parte de uma palavra.
  // (?![a-zA-Z0-9\u00C0-\u00FF])  -> Negative lookahead: garante que o que *segue* não seja parte de uma palavra.
  // [\u00C0-\u00FF] inclui caracteres acentuados comuns.
  const boundaryLeft = "(?<![a-zA-Z0-9\\u00C0-\\u00FF])";
  const boundaryRight = "(?![a-zA-Z0-9\\u00C0-\\u00FF])";

  // Retorna a expressão regular compilada com flags 'g' (global) e 'i' (insensível a maiúsculas/minúsculas).
  return new RegExp(`${boundaryLeft}${pattern}${boundaryRight}`, "gi");
}

/**
 * Transcreve um texto aplicando uma série de regras de substituição.
 * Possui tratamento especial para as palavras "Alma", "Consciência" e "Terra".
 * @param {string} text - O texto de entrada a ser transcrito.
 * @returns {string} O texto com as substituições aplicadas.
 */
function transcreverTexto(text) {
  // Constantes para palavras-chave e um token temporário.
  const ALMA = "Alma";
  const CONSCIENCIA = "Consciência";
  const TERRA = "Terra";
  // Nota: Este token tem o mesmo valor da constante ALMA,
  // sugerindo que seu propósito é mais semântico ou
  // para controle de fluxo dentro da função.
  const TOKEN_ALMA_DA_TERRA = "Alma";

  let textoTranscrito = text; // Inicializa o texto a ser trabalhado.

  // Filtra as regras de substituição para excluir um caso específico:
  // a substituição de 'ALMA' por 'CONSCIENCIA' não deve ser tratada pelas regras gerais
  // neste ponto, pois será tratada de forma especial.
  const regras_filtradas = substituicoes.filter(
    ([palavra_original, palavra_transcrita]) => {
      return !(palavra_original === ALMA && palavra_transcrita === CONSCIENCIA);
    }
  );

  // Ordena as regras de substituição filtradas do maior para o menor.
  // Isso é importante para evitar que substituições de palavras menores
  // interfiram em palavras maiores que as contêm (ex: substituir "sol" antes de "girassol").
  const substituicoesOrdenadas = regras_filtradas
    .slice() // Cria uma cópia do array para não modificar o original.
    .sort(([a], [b]) => b.length - a.length); // Ordena pela duração da palavra original (descendente).

  // PRIMEIRO TRATAMENTO ESPECIAL: Substitui todas as ocorrências de "Alma" por "Consciência".
  // Usa uma regex insensível a acentos e maiúsculas/minúsculas.
  const padraoBuscaAlma = createAccentInsensitiveRegex(ALMA);
  textoTranscrito = textoTranscrito.replace(padraoBuscaAlma, CONSCIENCIA);

  // Percorre as regras de substituição ordenadas e aplica-as ao texto.
  substituicoesOrdenadas.forEach(([palavra_original, palavra_transcrita]) => {
    let valor_substituido = palavra_transcrita;

    // SEGUNDO TRATAMENTO ESPECIAL:
    // Se a regra é substituir "Terra" por "Alma", usa um TOKEN temporário ("Alma")
    // em vez de "Alma" diretamente. Isso é feito para proteger essa instância
    // de "Alma" de ser alterada novamente pela regra geral "Alma" -> "Consciência",
    // que já foi aplicada. O token será convertido de volta no final.
    if (palavra_original === TERRA && palavra_transcrita === ALMA) {
      valor_substituido = TOKEN_ALMA_DA_TERRA;
    }

    // Cria uma regex insensível a acentos para a palavra original da regra.
    const padraoBusca = createAccentInsensitiveRegex(palavra_original);
    // Aplica a substituição ao texto.
    textoTranscrito = textoTranscrito.replace(padraoBusca, valor_substituido);
  });

  // TERCEIRO TRATAMENTO ESPECIAL:
  // Converte o TOKEN temporário (que representou "Alma" originado de "Terra") de volta para "Alma".
  // Isso garante que a substituição "Terra" -> "Alma" seja preservada,
  // mesmo após a substituição inicial de todas as "Alma" por "Consciência".
  const padraoBuscaToken = createAccentInsensitiveRegex(TOKEN_ALMA_DA_TERRA);
  textoTranscrito = textoTranscrito.replace(padraoBuscaToken, ALMA);

  return textoTranscrito; // Retorna o texto final transcrito.
}

// Exporta as funções 'transcreverTexto' e 'removerAcentos' para que possam ser importadas e utilizadas em outros módulos.
module.exports = { transcreverTexto, removerAcentos };
