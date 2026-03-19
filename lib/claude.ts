import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Difficulty, TriviaQuiz } from "@/lib/triviaTypes";
import { triviaQuizSchema } from "@/lib/triviaTypes";

const DEFAULT_MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";

function buildUserPrompt({ difficulty, theme }: { difficulty: Difficulty; theme?: string }) {
  const difficultyGuide =
    difficulty === "easy"
      ? "Keep questions straightforward. Prefer widely known facts and common knowledge. Minimal multi-step reasoning."
      : difficulty === "medium"
        ? "Use a mix of well-known facts and moderately specific details. Some questions can require basic interpretation (e.g., reading a stat in context)."
        : "Make questions really hard. Include obscure details, comparisons, or situations where the year/season context matters, but keep answers within the NFL world.";

  const themeLine = theme
    ? `The theme for this round is: "${theme}". Generate all questions around this theme.`
    : "Pick a fun, coherent NFL trivia theme (for example: Super Bowl upsets, Hall of Fame QBs, iconic team eras, record milestones, rule/game moments).";

  return [
    "You are a zany, funny, and slightly crazy NFL trivia host for a kids-friendly audience.",
    difficultyGuide,
    "",
    themeLine,
    "Then generate exactly 10 multiple-choice questions around that theme.",
    "",
    "For EACH question:",
    "- Provide a clear question (no duplicates).",
    "- Provide exactly 4 answer choices.",
    "- Provide answerIndex as an integer 0..3 pointing at the correct choice.",
    "- Provide a super exuberant explanation (1-2 sentences) that teaches why the answer is correct. Make it fun and engaging for the kids.",
    "",
    "Return the output as strict JSON matching this shape:",
    "{ theme: string, questions: [{ question: string, choices: [string,string,string,string], answerIndex: number, explanation: string }] }",
  ].join("\n");
}

export async function generateTriviaQuiz({
  difficulty,
  theme,
}: {
  difficulty: Difficulty;
  theme?: string;
}): Promise<TriviaQuiz> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY. Set it in your environment variables.");
  }

  const client = new Anthropic({ apiKey });

  const userPrompt = buildUserPrompt({ difficulty, theme });

  const message = await client.messages.parse({
    model: DEFAULT_MODEL,
    max_tokens: 2200,
    temperature: 0.7,
    messages: [{ role: "user", content: userPrompt }],
    output_config: {
      format: zodOutputFormat(triviaQuizSchema),
    },
  });

  // `parsed_output` is validated by the Zod schema above.
  if (!message.parsed_output) {
    throw new Error("Claude did not return parsed_output.");
  }

  return message.parsed_output as TriviaQuiz;
}

