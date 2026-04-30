import { tool, zodSchema } from "ai";
import { z } from "zod";

const questionSchema = z.object({
  question: z.string().describe("Le texte de la question"),
  choices: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
  }),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().describe("Explication de la bonne réponse"),
});

export type QuizQuestion = z.infer<typeof questionSchema>;

export const quizTool = tool({
  description:
    "Génère un quiz interactif sur un sujet de cours. Le LLM remplit toutes les questions avec leurs choix et réponses correctes. A utiliser seulement si l'user le demande explicitement. Ne génère que les questions sans aucune introduction ou conclusion. Fais quelque chose de plaisant visuellement en utilisant des emojis pour rendre le quiz engageant.",
  inputSchema: zodSchema(
    z.object({
      subject: z.string().describe("Le sujet ou chapitre du quiz"),
      questions: z
        .array(questionSchema)
        .min(1)
        .max(20)
        .describe("La liste des questions générées par le LLM"),
    }),
  ),
  execute: async ({ subject, questions }) => {
    return { subject, questions };
  },
});
