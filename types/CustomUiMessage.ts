import { quizTool } from "@/app/tools/quizTool";
import { revisionSheetTool } from "@/app/tools/revisionSheetTool";
import { InferUITools, ToolSet, UIMessage, tool } from "ai";
import z from "zod";

const metadataSchema = z.object({});

type MyMetadata = z.infer<typeof metadataSchema>;

const dataPartSchema = z.object({});

type MyDataPart = z.infer<typeof dataPartSchema>;

const tools = {
  quizTool: tool(quizTool),
  revisionSheetTool: tool(revisionSheetTool),
} satisfies ToolSet;

type MyTools = InferUITools<typeof tools>;

export type MyUIMessage = UIMessage<MyMetadata, MyDataPart, MyTools>;
