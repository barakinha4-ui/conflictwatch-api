'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// — System prompts por idioma ————————————————————
const SYSTEM_PROMPTS = {
    pt: `Você é um analista de inteligência geopolítica sênior especializado no conflito Irã × EUA.
Responda em português brasileiro de forma técnica, objetiva e concisa, como um briefing de inteligência militar.
Baseie-se em eventos históricos verificáveis e contexto geopolítico até início de 2026.
Não invente dados. Se incerto, indique claramente.
Máximo 400 palavras por resposta.`,

    en: `You are a senior geopolitical intelligence analyst specializing in the Iran × USA conflict.
Respond in English with technical, objective, and concise language, like a military intelligence briefing.
Base your analysis on verifiable historical events and geopolitical context through early 2026.
Do not fabricate data. If uncertain, clearly indicate so.
Maximum 400 words per response.`,

    es: `Eres un analista de inteligencia geopolítica senior especializado en el conflicto Irán × EE.UU.
Responde en español con lenguaje técnico, objetivo y conciso, como un briefing de inteligencia militar.
Basa tu análisis en eventos históricos verificables y contexto geopolítico hasta principios de 2026.
No inventes datos. Si tienes incertidumbre, indícalo claramente.
Máximo 400 palabras por respuesta.`,

    ar: `أنت محلل استخباراتي جيوسياسي متخصص في النزاع الإيراني الأمريكي.
أجب باللغة العربية بلغة تقنية وموضوعية وموجزة، مثل تقرير الاستخبارات العسكرية.
اعتمد على الأحداث التاريخية القابلة للتحقق والسياق الجيوسياسي حتى مطلع عام 2026.
لا تخترع بيانات. إذا كنت غير متأكد، أشر إلى ذلك بوضوح.
بحد أقصى 400 كلمة لكل رد.`,

    fa: `شما یک تحلیلگر ارشد اطلاعات ژئوپولیتیک متخصص در درگیری ایران و آمریکا هستید.
به فارسی با زبانی تکنیکال، عینی و مختصر، مانند یک گزارش اطلاعاتی نظامی پاسخ دهید.
تحلیل خود را بر اساس رویدادهای تاریخی قابل تأیید و زمینه ژئوپولیتیک تا اوایل ۲۰۲۶ قرار دهید.
ذکر کنید داده ها را جعل نکنید. اگر مطمئن نیستید، به وضوح اشاره کنید.
حداکثر ۲۰۰ کلمه در هر پاسخ.`,
};

/**
 * Análise geopolítica para o usuário
 */
async function analyzeGeopolitical(query, language = 'pt') {
    const systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.pt;

    try {
        const result = await model.generateContent(`${systemPrompt}\n\nUsuário pergunta: ${query}`);
        const response = await result.response;
        const text = response.text();

        return {
            text,
            totalTokens: response.usageMetadata?.totalTokenCount || 0,
        };
    } catch (err) {
        logger.error({ err, query }, 'analyzeGeopolitical Gemini error');
        return {
            text: '[SISTEMA] O Analista está temporariamente indisponível. Por favor, verifique se a GEMINI_API_KEY está configurada corretamente.',
            totalTokens: 0,
        };
    }
}

/**
 * Classifica uma notícia e retorna categoria + score de impacto
 */
async function classifyNewsEvent(title, description) {
    const prompt = `Classifique esta notícia sobre o conflito Irã/EUA/Oriente Médio:

Título: ${title}
Descrição: ${description || 'N/A'}

Retorne APENAS um JSON válido (sem markdown, sem blocos de código) com este formato exato:
{
  "category": "military|nuclear|diplomatic|economic|cyber|other",
  "impact_score": <número de 0.0 a 10.0>,
  "is_critical": <true|false>,
  "summary_pt": "<resumo em português, max 100 chars>",
  "summary_en": "<summary in English, max 100 chars>",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Critérios de impact_score:
- 9-10: ataque militar direto, arma nuclear
- 7-8: teste de míssil, sanções massivas, ataque cibernético grave
- 5-6: enriquecimento nuclear, movimentação de tropas, ruptura diplomática
- 3-4: novas sanções menores, declarações hostis
- 1-2: declarações políticas rotineiras
- 0: irrelevante para o conflito`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const raw = response.text().trim();
        const cleaned = raw.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (err) {
        logger.error({ err, title }, 'classifyNewsEvent Gemini error');
        return {
            category: 'other',
            impact_score: 3,
            is_critical: false,
            summary_pt: title.slice(0, 100),
            summary_en: title.slice(0, 100),
            keywords: [],
        };
    }
}

/**
 * Traduz título de notícia para múltiplos idiomas
 */
async function translateNewsTitle(titleEn) {
    const prompt = `Traduza este título de notícia para os idiomas solicitados.
Retorne APENAS JSON válido (sem markdown, sem blocos de código):

Título em inglês: "${titleEn}"

{
  "pt": "<tradução em português>",
  "es": "<traducción en español>",
  "ar": "<الترجمة بالعربية>",
  "fa": "<ترجمه به فارسی>"
}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const raw = response.text().trim();
        const cleaned = raw.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (err) {
        logger.error({ err }, 'translateNewsTitle Gemini error');
        return { pt: titleEn, es: titleEn, ar: titleEn, fa: titleEn };
    }
}

module.exports = {
    analyzeGeopolitical,
    classifyNewsEvent,
    translateNewsTitle,
};
