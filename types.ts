export enum EditorMode {
  RAW_TEXT = 'RAW_TEXT',
  LATEX = 'LATEX'
}

export enum AIStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AIResponse {
  text: string;
  explanation?: string;
}

export interface SelectionRange {
  start: number;
  end: number;
  text: string;
}

export interface ParsedElement {
  id: string;
  type: 'section' | 'subsection' | 'paragraph' | 'math' | 'list' | 'unknown';
  content: string;
  raw: string;
}