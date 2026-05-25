import { tool } from 'ai';
import { z } from 'zod';

const textBlockSchema = z.object({
  type: z.enum(['h1', 'h2', 'h3', 'p', 'li', 'code', 'bold']),
  content: z.string().describe('Le contenu textuel du bloc'),
});

const tableBlockSchema = z.object({
  type: z.literal('table'),
  headers: z.array(z.string()).describe('Les en-têtes de colonnes'),
  rows: z.array(z.array(z.string())).describe('Les lignes du tableau'),
});

const blockSchema = z.discriminatedUnion('type', [
  textBlockSchema,
  tableBlockSchema,
]);

export type RevisionBlock = z.infer<typeof blockSchema>;

export const displayRevisionSheetTool = tool({
  title: 'Fiche de revision',
  description:
    "Génère une fiche de révision claire et structurée sur le sujet demandé. Utilise ce tool uniquement si l'utilisateur te demande une fiche ou un résumé structuré.",
  inputSchema: z.object({
    subject: z.string().describe('Le sujet ou chapitre de la fiche'),
    blocks: z
      .array(blockSchema)
      .min(1)
      .describe(
        'Blocs de contenu structurés (titres, paragraphes, listes, tableaux).'
      ),
  }),
  inputExamples: [
    {
      input: {
        subject: 'Les volcans',
        blocks: [
          { type: 'h1', content: 'Les volcans 🌋' },
          {
            type: 'p',
            content:
              "Un volcan est une ouverture de la croûte terrestre par laquelle s'échappent des matériaux en fusion.",
          },
          { type: 'h2', content: 'Types principaux' },
          { type: 'li', content: 'Volcan effusif (lave fluide)' },
          { type: 'li', content: 'Volcan explosif (nuées ardentes)' },
          {
            type: 'table',
            headers: ['Type', 'Caractéristique', 'Exemple'],
            rows: [
              ['Effusif', 'Éruptions calmes', 'Kilauea'],
              ['Explosif', 'Éruptions violentes', 'Vésuve'],
            ],
          },
        ],
      },
    },
  ],
  execute: async ({ subject, blocks }) => {
    return { subject, blocks };
  },
});
