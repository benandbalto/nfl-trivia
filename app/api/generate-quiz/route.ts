import { NextResponse } from "next/server";
import { generateTriviaQuiz } from "@/lib/claude";
import { difficultySchema } from "@/lib/triviaTypes";

export const dynamic = "force-dynamic";

function getDifficulty(searchParams: URLSearchParams) {
  const raw = searchParams.get("difficulty") ?? "medium";
  const parsed = difficultySchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const difficulty = getDifficulty(url.searchParams);
    if (!difficulty) {
      return NextResponse.json(
        { error: "Invalid difficulty. Use one of: easy, medium, hard." },
        { status: 400 },
      );
    }

    const theme = url.searchParams.get("theme")?.trim() || undefined;
    const quiz = await generateTriviaQuiz({ difficulty, theme });
    return NextResponse.json(quiz, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

