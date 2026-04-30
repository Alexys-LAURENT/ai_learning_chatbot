import { tool, zodSchema } from "ai";
import { z } from "zod";

const textBlockSchema = z.object({
  type: z.enum(["h1", "h2", "h3", "p", "li", "code", "bold"]),
  content: z.string().describe("Le contenu textuel du bloc"),
});

const tableBlockSchema = z.object({
  type: z.literal("table"),
  headers: z.array(z.string()).describe("Les en-têtes de colonnes"),
  rows: z.array(z.array(z.string())).describe("Les lignes du tableau"),
});

const blockSchema = z.discriminatedUnion("type", [
  textBlockSchema,
  tableBlockSchema,
]);

export type RevisionBlock = z.infer<typeof blockSchema>;

export const revisionSheetTool = tool({
  description:
    "Génère une fiche de révision structurée sous forme de blocs rich text (h1, h2, h3, p, li, code, bold, table). A utiliser seulement si l\'user le demande explicitement. Fais quelque chose de plaisant visuellement en utilisant des emojis et des tableaux pour organiser les informations. Ne génère que les blocs de contenu sans aucune introduction ou conclusion. Remplis tous les champs de chaque bloc avec du contenu pertinent pour le sujet donné.",
  inputSchema: zodSchema(
    z.object({
      subject: z.string().describe("Le sujet ou chapitre de la fiche"),
      blocks: z
        .array(blockSchema)
        .min(1)
        .describe("Les blocs de contenu structurés générés par le LLM"),
    }),
  ),
  execute: async ({ subject, blocks }) => {
    return { subject, blocks };
  },
});
