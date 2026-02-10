const RULES: Record<string, string[]> = {
  apologetic: [
    "sorry",
    "apologize",
    "apology",
    "my fault",
    "forgive me",
    "i messed up",
    "i was wrong",
  ],
  sad: [
    "sad",
    "hurt",
    "not okay",
    "depressed",
    "tired of",
    "this hurts",
    "feels bad",
  ],
  angry: [
    "angry",
    "furious",
    "done with this",
    "never again",
    "fed up",
    "pissed",
  ],
  affectionate: [
    "love you",
    "miss you",
    "care about you",
    "thinking of you",
    "❤️",
    "😘",
  ],
  argumentative: [
    "always",
    "never",
    "you don't",
    "you never",
    "your fault",
    "stop this",
  ],
};

export function extractTags(text: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];

  for (const [tag, phrases] of Object.entries(RULES)) {
    if (phrases.some((p) => lower.includes(p))) {
      tags.push(tag);
    }
  }

  return tags;
}
