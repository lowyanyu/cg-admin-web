export interface Message {
  title?: string;
  content: string;
  type?: string;
  timeout?: number;
  level: string;
}
