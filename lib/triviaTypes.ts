import { z } from "zod/v4";

export type Difficulty = "easy" | "medium" | "hard";

export const difficultySchema = z.enum(["easy", "medium", "hard"]);

export type TriviaQuestion = {
  question: string;
  choices: string[]; // Always length 4 (validated at runtime)
  answerIndex: number; // 0..3 (validated at runtime)
  explanation: string;
};

export type TriviaQuiz = {
  theme: string;
  questions: TriviaQuestion[]; // Always length 15 (validated at runtime)
};

export const triviaQuestionSchema = z.object({
  question: z.string().min(1),
  choices: z.array(z.string().min(1)).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
});

export const triviaQuizSchema = z.object({
  theme: z.string().min(1),
  questions: z.array(triviaQuestionSchema).length(15),
});

