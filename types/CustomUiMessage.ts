import { displayPdfPageTool } from '@/app/tools/displayPdfPageTool';
import { displayQuizTool } from '@/app/tools/displayQuizTool';
import { displayRevisionSheetTool } from '@/app/tools/displayRevisionSheetTool';
import { InferUITools, type ToolSet, type UIMessage } from 'ai';

const tools = {
  displayQuizTool,
  displayRevisionSheetTool,
  displayPdfPageTool,
} satisfies ToolSet;

type MyTools = InferUITools<typeof tools>;

export type MyUIMessage = UIMessage<
  Record<string, never>,
  Record<string, never>,
  MyTools
>;
