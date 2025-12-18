export enum AppMode {
  HOME = 'HOME',
  SUMMARIZER = 'SUMMARIZER',
  SOLVER = 'SOLVER'
}

export interface AnalysisResult {
  text: string;
  timestamp: number;
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}