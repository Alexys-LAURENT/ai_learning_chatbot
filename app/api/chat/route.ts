import { ollama, streamText } from "ai-sdk-ollama";
import {
  convertToModelMessages,
  isTextUIPart,
  isFileUIPart,
  safeValidateUIMessages,
} from "ai";
import { MyUIMessage } from "@/types/CustomUiMessage";
import {
  loadPdfFromBuffer,
  processPdf,
  pdfResultsToAiContent,
} from "@/utils/pdf";
import { quizTool } from "@/app/tools/quizTool";
import { revisionSheetTool } from "@/app/tools/revisionSheetTool";

const systemPrompt = `Tu es un assistant d'apprentissage pour les étudiants ils vont te forward leur cours en format pdf, réponds uniquement à leur demande mais n'hésite pas à leur proposer des fiches de révision ou des quiz pour les aider.`;

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages: MyUIMessage[] };
    const result = await safeValidateUIMessages({ messages });
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error.message,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    const lastMessage = messages[messages.length - 1];
    const textmessage = lastMessage?.parts?.find((part) => isTextUIPart(part));

    if (!textmessage) {
      return new Response(
        JSON.stringify({
          error: "Le prompt est requis et doit être une chaîne de caractères",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const fileParts = lastMessage.parts.filter((part) => isFileUIPart(part));
    const pdfContent: any[] = [];

    if (fileParts && fileParts.length > 0) {
      for (const filePart of fileParts) {
        if (filePart.mediaType !== "application/pdf") {
          return new Response(
            JSON.stringify({
              error: "Les fichiers joints doivent être des fichiers PDF",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        const dataUrl = filePart.url as string;
        const base64Data = dataUrl.includes(",")
          ? dataUrl.split(",")[1]
          : dataUrl;
        const buffer = Buffer.from(base64Data, "base64");
        const pdf = await loadPdfFromBuffer(buffer);
        const results = await processPdf(
          pdf,
          textmessage.text,
          { density: 100, maxWidth: 1024 },
          "text",
        );
        const content = pdfResultsToAiContent(results);
        pdfContent.push(...content);
      }
    }

    try {
      const convertedMessages = await convertToModelMessages(messages);
      if (pdfContent.length > 0 && convertedMessages.length > 0) {
        const lastMsg = convertedMessages[convertedMessages.length - 1];
        if (typeof lastMsg.content === "string") {
          lastMsg.content = [
            { type: "text", text: lastMsg.content },
            ...pdfContent,
          ];
        } else if (Array.isArray(lastMsg.content)) {
          lastMsg.content = [...lastMsg.content, ...pdfContent];
        }
      }

      const result = await streamText({
        model: ollama("gemma4:26b"),
        tools: {
          quizTool,
          revisionSheetTool,
        },
        system: systemPrompt,
        providerOptions: { ollama: { think: true } },
        messages: convertedMessages,
      });
      return result.toUIMessageStreamResponse({
        onError: (error) => {
          return error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "unknown error";
        },
      });
    } catch (error) {
      console.error("Error generating response:", error);
      return new Response(
        JSON.stringify({
          error: "Une erreur est survenue lors de la génération de la réponse",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        error: "Une erreur est survenue lors du traitement de la requête",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
