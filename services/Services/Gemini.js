// services/gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializa o cliente Gemini usando a variável de ambiente
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Modelo Flash: Rápido e gratuito para altas demandas
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Classifica o evento geopolítico em uma categoria única
 * @param {string} text - Texto da notícia
 * @returns {Promise<string>} - Categoria (ex: Conflito, Eleição, Economia)
 */
async function classifyNewsEvent(text) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY não configurada');
      return 'Outros';
    }

    const prompt = `Analise o seguinte texto de notícia e classifique o evento geopolítico em APENAS UMA palavra-chave em português.
    Opções válidas: Conflito, Eleição, Economia, Diplomacia, Desastre, Tecnologia, Outros.
    Não adicione pontuação ou explicações. Apenas a palavra.
    
    Texto: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let classification = response.text().trim();
    
    // Limpeza básica caso o modelo adicione pontuação
    classification = classification.replace(/[.,]/g, '');
    
    return classification || 'Outros';
  } catch (error) {
    console.error('Erro na classificação Gemini:', error.message);
    return 'Outros'; // Fallback seguro para não quebrar o cron
  }
}

/**
 * Traduz o título da notícia para o idioma alvo
 * @param {string} text - Título original
 * @param {string} targetLang - Idioma alvo (ex: 'pt-BR')
 * @returns {Promise<string>} - Título traduzido
 */
async function translateNewsTitle(text, targetLang = 'pt-BR') {
  try {
    if (!process.env.GEMINI_API_KEY) return text;

    const prompt = `Traduza o seguinte título de notícia para ${targetLang}.
    Mantenha o tom jornalístico e não adicione explicações.
    
    Título: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Erro na tradução Gemini:', error.message);
    return text; // Retorna original em caso de erro
  }
}

module.exports = { classifyNewsEvent, translateNewsTitle };
