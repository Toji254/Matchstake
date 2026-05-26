// AI Prediction Service
// When GROQ_API_KEY is not set, returns intelligent simulation data.
// When set, calls Groq LLM for real AI-generated predictions.

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Fallback simulation predictions (used when no API key is configured)
const SIMULATION_DB = {
  default: {
    homeScore: 2,
    awayScore: 1,
    confidence: 68,
    reasoning: 'Based on historical head-to-head performance and current team form, the home side holds a tactical advantage through set-piece efficiency and midfield control.',
    keyPlayer: 'Home Team Captain — consistently decisive in high-stakes tournament fixtures.',
  },
};

function getSimulatedPrediction(homeTeam, awayTeam) {
  // Generate deterministic but varied predictions based on team names
  const seed = (homeTeam + awayTeam).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const homeScore = (seed % 4);
  const awayScore = ((seed * 7) % 3);
  const confidence = 55 + (seed % 35);

  const reasonings = [
    `${homeTeam}'s high pressing system should create early chances against ${awayTeam}'s transitional defense. Recent form suggests a tight contest with the home side edging possession.`,
    `${awayTeam}'s counter-attacking style poses threats, but ${homeTeam}'s defensive solidity in recent qualifiers gives them an edge. Set pieces could be decisive.`,
    `Both teams enter with strong World Cup qualifying records. ${homeTeam}'s midfield depth should control tempo, though ${awayTeam}'s pace on the break will test the backline.`,
    `Historical data shows ${homeTeam} performing well in opening fixtures. ${awayTeam} tends to start tournaments cautiously, which could lead to a low-scoring tactical affair.`,
  ];

  const keyPlayers = [
    `${homeTeam} striker — tournament-proven goalscorer with 8 goals in last 10 international matches.`,
    `${awayTeam} playmaker — creative hub averaging 2.3 key passes per game in qualifiers.`,
    `${homeTeam} midfielder — controls tempo and has the highest pass completion rate in the squad.`,
    `${awayTeam} goalkeeper — made crucial saves in qualifying and could be the difference maker.`,
  ];

  return {
    homeScore,
    awayScore,
    confidence,
    reasoning: reasonings[seed % reasonings.length],
    keyPlayer: keyPlayers[(seed * 3) % keyPlayers.length],
  };
}

export async function generatePrediction(homeTeam, awayTeam) {
  // If no API key, return simulation data (perfectly fine for hackathon demo)
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    console.log(`[AI] Generating simulated prediction for ${homeTeam} vs ${awayTeam} (no GROQ_API_KEY)`);
    // Small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    return getSimulatedPrediction(homeTeam, awayTeam);
  }

  const prompt = `You are a football match analyst for the 2026 World Cup. Predict the exact scoreline outcome of the match between ${homeTeam} vs ${awayTeam}.

You have extensive knowledge of both teams' current form, historical head-to-head records, and key player availability.

Respond ONLY with valid JSON in this exact format — no markdown, no explanation, no extra text:
{"homeScore": 0, "awayScore": 0, "confidence": 60, "reasoning": "Brief 2-sentence tactical analysis", "keyPlayer": "Player Name — one sentence on why they are decisive"}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error(`[AI] Groq API error: ${response.status}, falling back to simulation`);
      return getSimulatedPrediction(homeTeam, awayTeam);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonStr = content.replace(/^```json\n?|```$/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error(`[AI] Error calling Groq API: ${err.message}, falling back to simulation`);
    return getSimulatedPrediction(homeTeam, awayTeam);
  }
}
