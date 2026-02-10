export type ParsedMessage = {
  sender: string;
  timestamp: Date | null;
  text: string;
};

/**
 * Attempts to parse WhatsApp exported chat (.txt).
 * Falls back to generic transcript parsing.
 */
export function parseTextFile(content: string): ParsedMessage[] {
  const lines = content.split(/\r?\n/);

  const messages: ParsedMessage[] = [];

  // WhatsApp format example:
  // 12/01/24, 9:14 PM - John Doe: Hello
  const whatsappRegex =
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s(\d{1,2}:\d{2}\s?(AM|PM|am|pm)?)\s-\s([^:]+):\s(.+)$/;

  let currentMessage: ParsedMessage | null = null;

  for (const line of lines) {
    const match = line.match(whatsappRegex);

    if (match) {
      // Push previous multi-line message
      if (currentMessage) {
        messages.push(currentMessage);
      }

      const [, date, time, , sender, text] = match;

      const parsedDate = new Date(`${date} ${time}`);

      currentMessage = {
        sender: sender.trim(),
        timestamp: isNaN(parsedDate.getTime()) ? null : parsedDate,
        text: text.trim(),
      };
    } else {
      // Continuation of previous message (multi-line)
      if (currentMessage && line.trim() !== "") {
        currentMessage.text += "\n" + line.trim();
      }
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  // Fallback: generic transcript (no timestamps)
  if (messages.length === 0) {
    return lines
      .filter((l) => l.trim() !== "")
      .map((line) => ({
        sender: "Unknown",
        timestamp: null,
        text: line.trim(),
      }));
  }

  return messages;
}
