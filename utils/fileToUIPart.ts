import { convertFileListToFileUIParts, type FileUIPart } from "ai";

export async function fileToUIPart(file: File): Promise<FileUIPart> {
  const dt = new DataTransfer();
  dt.items.add(file);
  const [part] = await convertFileListToFileUIParts(dt.files);
  return part;
}
