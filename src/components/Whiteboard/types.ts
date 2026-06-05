export type PenStyle = 'solid' | 'dashed' | 'dotted';

export type ToolType =
  | 'select' | 'hand' | 'pen' | 'highlighter' | 'rect' | 'ellipse'
  | 'arrow' | 'line' | 'sticky' | 'text' | 'eraser' | 'frame';

interface Base { id: string }

export interface PenEl extends Base {
  type: 'pen' | 'highlighter';
  points: number[]; // flat [x1,y1,x2,y2,...]
  color: string;
  strokeWidth: number;
  penStyle?: PenStyle;
}

export interface RectEl extends Base {
  type: 'rect';
  x: number; y: number;
  width: number; height: number;
  color: string;
  fillColor: string;
  strokeWidth: number;
  penStyle?: PenStyle;
}

export interface EllipseEl extends Base {
  type: 'ellipse';
  cx: number; cy: number;
  rx: number; ry: number;
  color: string;
  fillColor: string;
  strokeWidth: number;
  penStyle?: PenStyle;
}

export interface ArrowEl extends Base {
  type: 'arrow';
  x1: number; y1: number;
  x2: number; y2: number;
  color: string;
  strokeWidth: number;
  penStyle?: PenStyle;
}

export interface LineEl extends Base {
  type: 'line';
  x1: number; y1: number;
  x2: number; y2: number;
  color: string;
  strokeWidth: number;
  penStyle?: PenStyle;
}

export interface StickyEl extends Base {
  type: 'sticky';
  x: number; y: number;
  width: number; height: number;
  text: string;
  bgColor: string;
}

export interface TextEl extends Base {
  type: 'text';
  x: number; y: number;
  text: string;
  fontSize: number;
  color: string;
  bold?: boolean;
}

export interface FrameEl extends Base {
  type: 'frame';
  x: number; y: number;
  width: number; height: number;
  title: string;
  color: string;
}

export type WBElement =
  | PenEl | RectEl | EllipseEl | ArrowEl | LineEl
  | StickyEl | TextEl | FrameEl;
