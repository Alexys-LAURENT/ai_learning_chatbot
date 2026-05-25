import { tool } from 'ai';
import { z } from 'zod';

export const displayPdfPageTool = tool({
  title: 'Affichage page PDF',
  description:
    "Affiche une page précise d'un document PDF déjà fourni par l'utilisateur, " +
    'directement dans le chat. Utile pour pointer un schéma, une illustration ou ' +
    "une page citée dans ton explication. N'invente jamais un nom de fichier : " +
    "réutilise exactement le nom indiqué dans la balise <document filename=\"...\">.",
  inputSchema: z.object({
    source: z
      .string()
      .describe(
        "Nom EXACT du fichier PDF tel qu'il apparaît dans <document filename=\"...\">"
      ),
    page: z
      .number()
      .int()
      .min(1)
      .describe('Numéro de page (commence à 1)'),
    caption: z
      .string()
      .optional()
      .describe('Légende courte expliquant pourquoi cette page est montrée'),
  }),
  inputExamples: [
    {
      input: {
        source: 'cours-volcans.pdf',
        page: 5,
        caption: 'Schéma annoté des trois types de volcans',
      },
    },
  ],
  execute: async ({ source, page, caption }) => {
    return { source, page, caption };
  },
});
