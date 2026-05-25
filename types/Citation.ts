export interface Citation {
  id: string;
  docId: string;
  docName: string;
  page: number;
  text: string;
  kind: 'page' | 'selection';
}
