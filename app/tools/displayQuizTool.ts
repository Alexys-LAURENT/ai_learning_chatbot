import { tool } from 'ai';
import { z } from 'zod';

const questionSchema = z.object({
  question: z.string().describe('Le texte de la question'),
  choices: z.array(z.string()).min(2).describe('Les choix de réponses'),
  correctAnswerIndex: z
    .number()
    .int()
    .min(0)
    .describe("L'index (0-based) du choix correct dans le tableau choices"),
  explanation: z.string().describe('Explication de la bonne réponse'),
});

export type QuizQuestion = z.infer<typeof questionSchema>;

export const displayQuizTool = tool({
  title: 'Quiz interactif',
  description:
    "Génère un quiz interactif sur le sujet demandé. Utilise ce tool uniquement si l'utilisateur te demande un quiz ou veut se tester.",
  inputSchema: z.object({
    subject: z.string().describe('Le sujet ou chapitre du quiz'),
    questions: z
      .array(questionSchema)
      .min(1)
      .max(20)
      .describe('Questions du quiz, avec choix et bonne réponse'),
  }),
  inputExamples: [
    {
      input: {
        subject: 'Les fractions',
        questions: [
          {
            question: 'Quelle fraction est équivalente à 1/2 ?',
            choices: ['2/4', '1/3', '3/5', '4/6'],
            correctAnswerIndex: 0,
            explanation: '2/4 se simplifie en 1/2.',
          },
        ],
      },
    },
  ],
  execute: async ({ subject, questions }) => {
    return { subject, questions };
  },
});
