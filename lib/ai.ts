type Filters = {
  sender?: string;
  contains?: string;
  exclude?: string;
  after?: string;
  before?: string;
};

export async function interpretQuery(query: string): Promise<Filters> {
  const prompt = `
Convert the following user query into JSON filters.

Allowed fields:
- sender
- contains
- exclude
- after (ISO date)
- before (ISO date)

User query:
"${query}"

Respond ONLY with valid JSON. No markdown.
`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
      }),
    });

    if (!res.ok) {
      console.error("OpenAI API error:", await res.text());
      return fallbackFilters(query);
    }

    const data = await res.json();

    const content =
      data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Invalid OpenAI response:", data);
      return fallbackFilters(query);
    }

    return JSON.parse(content);
  } catch (err) {
    console.error("AI interpretQuery failed:", err);
    return fallbackFilters(query);
  }
}

/**
 * VERY IMPORTANT:
 * This ensures the app NEVER crashes if AI fails.
 * We still return usable results.
 */
function fallbackFilters(query: string): Filters {
  return {
    contains: query,
  };
}
