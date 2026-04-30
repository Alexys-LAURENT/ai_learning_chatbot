import { quizTool } from "@/app/tools/quizTool";
import { revisionSheetTool } from "@/app/tools/revisionSheetTool";
import { InferUITools, type ToolSet, type UIMessage } from "ai";

const tools = {
  quizTool,
  revisionSheetTool,
} satisfies ToolSet;

type MyTools = InferUITools<typeof tools>;

export type MyUIMessage = UIMessage<Record<string, never>, Record<string, never>, MyTools>;
