// AI Prediction Service
// Fallback order:
// 1) Google Gemini (primary)
// 2) Groq primary / fallback
// 3) Deterministic local simulation

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_PRIMARY_MODEL = process.env.GROQ_PRIMARY_MODEL || 'llama-3.3-70b-versatile';
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'llama-3.1-8b-instant';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash-lite';
const GEMINI_BASE_URL =
  process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';

const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 12000);

function getSimulatedPrediction(homeTeam, awayTeam) {
  const seed = (homeTeam + awayTeam).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const homeScore = seed % 4;
  const awayScore = (seed * 7) % 3;
  const confidence = 55 + (seed % 35);

  const reasonings = [
    `${homeTeam}'s high pressing system should create early chances against ${awayTeam}'s transitional defense.`,
    `${awayTeam}'s counter-attacking style poses threats, but ${homeTeam}'s defensive solidity gives them an edge.`,
    `Both teams enter with strong qualifying records. ${homeTeam}'s midfield depth should control tempo.`,
    `Historical data shows ${homeTeam} performing well in opening fixtures. A tight tactical affair is likely.`,
  ];

  const keyPlayers = [
    `${homeTeam} striker — tournament-proven goalscorer.`,
    `${awayTeam} playmaker — creative hub in qualifiers.`,
    `${homeTeam} midfielder — controls tempo.`,
    `${awayTeam} goalkeeper — could be the difference maker.`,
  ];

  return {
    homeScore,
    awayScore,
    confidence,
    reasoning: reasonings[seed % reasonings.length],
    keyPlayer: keyPlayers[(seed * 3) % keyPlayers.length],
    provider: 'simulation',
  };
}

function buildPredictionPrompt(homeTeam, awayTeam) {
  return `You are a football match analyst for the 2026 World Cup. Predict the exact scoreline for ${homeTeam} vs ${awayTeam}.

Respond ONLY with valid JSON in this exact format — no markdown, no extra text:
{"homeScore": 0, "awayScore": 0, "confidence": 60, "reasoning": "Brief 2-sentence tactical analysis", "keyPlayer": "Player Name — one sentence on why they are decisive"}`;
}

function buildChatPrompt(homeTeam, awayTeam, userMessage) {
  return `You are MatchStake AI Co-Pilot in a World Cup watch party room for ${homeTeam} vs ${awayTeam}.
The user said: "${userMessage}"

Reply in 1-3 short sentences. Mention tactics, stake/prediction, OKX DEX swap, or NFT tickets when relevant.
If they ask about score/prediction, suggest a specific scoreline.
Respond ONLY with JSON:
{"reply": "your message to the user", "suggestedHome": null, "suggestedAway": null}
Use numbers for suggestedHome/suggestedAway only when recommending a score; otherwise null.`;
}

function normalizePrediction(raw, providerName) {
  const homeScore = Number(raw?.homeScore);
  const awayScore = Number(raw?.awayScore);
  const confidence = Number(raw?.confidence);
  const reasoning = typeof raw?.reasoning === 'string' ? raw.reasoning.trim() : '';
  const keyPlayer = typeof raw?.keyPlayer === 'string' ? raw.keyPlayer.trim() : '';

  if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore) || !Number.isFinite(confidence)) {
    throw new Error('Model response has invalid numeric fields');
  }
  if (!reasoning || !keyPlayer) {
    throw new Error('Model response missing reasoning/keyPlayer');
  }

  return {
    homeScore: Math.max(0, Math.min(9, Math.round(homeScore))),
    awayScore: Math.max(0, Math.min(9, Math.round(awayScore))),
    confidence: Math.max(0, Math.min(100, Math.round(confidence))),
    reasoning,
    keyPlayer,
    provider: providerName,
  };
}

function parseJsonFromModelText(content) {
  let jsonStr = content.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Handle truncated JSON (MAX_TOKENS) — close open strings/objects heuristically
    const start = jsonStr.indexOf('{');
    if (start === -1) throw new Error('No JSON object in model response');
    jsonStr = jsonStr.slice(start);
    if (!jsonStr.endsWith('}')) {
      jsonStr = jsonStr.replace(/,\s*"[^"]*$/, '');
      if (!jsonStr.endsWith('}')) jsonStr += '}';
    }
    return JSON.parse(jsonStr);
  }
}

async function callGeminiModel(model, prompt, { jsonMode = true } = {}) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  const url = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini HTTP ${response.status}: ${body}`);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const content = parts.map((p) => p.text || '').join('').trim();
    if (!content) {
      const reason = data?.candidates?.[0]?.finishReason || 'unknown';
      throw new Error(`Empty Gemini completion (${reason})`);
    }

    return parseJsonFromModelText(content);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGroqModel(model, prompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 320,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Groq HTTP ${response.status}: ${body}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Empty Groq completion');

    return parseJsonFromModelText(content);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runWithGemini(prompt) {
  const models = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL].filter(Boolean);
  const errors = [];

  for (const model of models) {
    try {
      const parsed = await callGeminiModel(model, prompt);
      return { parsed, provider: `gemini:${model}` };
    } catch (err) {
      errors.push(`${model}: ${err.message}`);
      console.error(`[AI] Gemini ${model} failed:`, err.message);
    }
  }

  throw new Error(errors.join(' | ') || 'Gemini unavailable');
}

async function runWithGroq(prompt) {
  const hasGroq = Boolean(GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here');
  if (!hasGroq) throw new Error('Groq not configured');

  const models = [GROQ_PRIMARY_MODEL, GROQ_FALLBACK_MODEL].filter(Boolean);
  const errors = [];

  for (const model of models) {
    try {
      const parsed = await callGroqModel(model, prompt);
      return { parsed, provider: `groq:${model}` };
    } catch (err) {
      errors.push(`${model}: ${err.message}`);
      console.error(`[AI] Groq ${model} failed:`, err.message);
    }
  }

  throw new Error(errors.join(' | ') || 'Groq unavailable');
}

async function runModelChain(prompt) {
  const hasGemini = Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here');
  const errors = [];

  if (hasGemini) {
    try {
      return await runWithGemini(prompt);
    } catch (err) {
      errors.push(`gemini: ${err.message}`);
    }
  }

  try {
    return await runWithGroq(prompt);
  } catch (err) {
    errors.push(`groq: ${err.message}`);
  }

  throw new Error(errors.join(' | ') || 'No AI providers configured');
}

export async function generatePrediction(homeTeam, awayTeam) {
  const hasGemini = Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here');
  const hasGroq = Boolean(GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here');

  if (!hasGemini && !hasGroq) {
    console.log(`[AI] Simulated prediction for ${homeTeam} vs ${awayTeam} (no API keys)`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getSimulatedPrediction(homeTeam, awayTeam);
  }

  try {
    const { parsed, provider } = await runModelChain(buildPredictionPrompt(homeTeam, awayTeam));
    const prediction = normalizePrediction(parsed, provider);
    console.log(`[AI] Prediction generated with ${provider}`);
    return prediction;
  } catch (err) {
    console.error(`[AI] All models failed, using simulation. ${err.message}`);
    return getSimulatedPrediction(homeTeam, awayTeam);
  }
}

export async function generateChatReply(homeTeam, awayTeam, userMessage) {
  const text = String(userMessage || '').trim();
  if (!text) {
    return { reply: 'Send a message about predictions, swaps, or NFT tickets.', provider: 'local' };
  }

  const hasGemini = Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here');
  const hasGroq = Boolean(GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here');

  if (!hasGemini && !hasGroq) {
    return {
      reply: `Analyzing "${text}" for ${homeTeam} vs ${awayTeam}. Try predicting a 2-2 draw or visit Swap for OKB.`,
      suggestedHome: 2,
      suggestedAway: 2,
      provider: 'simulation',
    };
  }

  try {
    const { parsed, provider } = await runModelChain(buildChatPrompt(homeTeam, awayTeam, text));
    const reply = typeof parsed?.reply === 'string' ? parsed.reply.trim() : '';
    if (!reply) throw new Error('Empty chat reply');

    const suggestedHome = Number(parsed?.suggestedHome);
    const suggestedAway = Number(parsed?.suggestedAway);

    return {
      reply,
      suggestedHome: Number.isFinite(suggestedHome) ? suggestedHome : null,
      suggestedAway: Number.isFinite(suggestedAway) ? suggestedAway : null,
      provider,
    };
  } catch (err) {
    console.error(`[AI] Chat failed, using heuristic. ${err.message}`);
    const lower = text.toLowerCase();
    if (lower.includes('predict') || lower.includes('score') || lower.includes('win') || lower.includes('draw')) {
      return {
        reply: `Tactical read for ${homeTeam} vs ${awayTeam}: competitive matchup — a 2-2 draw is a solid stake candidate.`,
        suggestedHome: 2,
        suggestedAway: 2,
        provider: 'simulation',
      };
    }
    return {
      reply: `Room synced for ${homeTeam} vs ${awayTeam}. Ask about scores, OKB swaps, or your LiveHype NFT ticket.`,
      provider: 'simulation',
    };
  }
}
