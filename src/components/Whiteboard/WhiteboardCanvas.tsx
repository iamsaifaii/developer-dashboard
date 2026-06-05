import React, { useReducer, useRef, useEffect, useCallback, useState } from 'react';
import type {
  WBElement, ToolType, StickyEl, TextEl, PenStyle
} from './types';
import { WhiteboardToolbar } from './WhiteboardToolbar';
import { useTheme } from '../Theme/ThemeProvider';

// ─── Constants ───────────────────────────────────────────────────────────────
const GRID = 30;
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 8;

const STICKY_C: Record<string, { bg: string; border: string; text: string; header: string }> = {
  yellow: { bg: '#fef9c3', border: '#d97706', text: '#78350f', header: '#f59e0b' },
  purple: { bg: '#ede9fe', border: '#7c3aed', text: '#4c1d95', header: '#8b5cf6' },
  blue: { bg: '#dbeafe', border: '#2563eb', text: '#1e3a8a', header: '#3b82f6' },
  green: { bg: '#dcfce7', border: '#16a34a', text: '#14532d', header: '#22c55e' },
  pink: { bg: '#fce7f3', border: '#db2777', text: '#831843', header: '#ec4899' },
  orange: { bg: '#ffedd5', border: '#ea580c', text: '#7c2d12', header: '#f97316' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
let _cnt = 0;
const genId = () => `wb-${Date.now()}-${_cnt++}`;

function smoothPath(pts: number[]): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M ${pts[0]} ${pts[1]}`;
  if (pts.length === 4) return `M ${pts[0]} ${pts[1]} L ${pts[2]} ${pts[3]}`;
  let d = `M ${pts[0]} ${pts[1]}`;
  for (let i = 2; i < pts.length - 2; i += 2) {
    const cx = (pts[i] + pts[i + 2]) / 2;
    const cy = (pts[i + 1] + pts[i + 3]) / 2;
    d += ` Q ${pts[i]} ${pts[i + 1]} ${cx} ${cy}`;
  }
  d += ` L ${pts[pts.length - 2]} ${pts[pts.length - 1]}`;
  return d;
}

function getBBox(el: WBElement): { x: number; y: number; w: number; h: number } {
  switch (el.type) {
    case 'rect': case 'sticky': case 'frame':
      return { x: el.x, y: el.y, w: el.width, h: el.height };
    case 'ellipse':
      return { x: el.cx - el.rx, y: el.cy - el.ry, w: el.rx * 2, h: el.ry * 2 };
    case 'arrow': case 'line':
      return {
        x: Math.min(el.x1, el.x2), y: Math.min(el.y1, el.y2),
        w: Math.abs(el.x2 - el.x1) || 2, h: Math.abs(el.y2 - el.y1) || 2,
      };
    case 'pen':
    case 'highlighter': {
      let [mnX, mnY, mxX, mxY] = [Infinity, Infinity, -Infinity, -Infinity];
      for (let i = 0; i < el.points.length; i += 2) {
        mnX = Math.min(mnX, el.points[i]); mxX = Math.max(mxX, el.points[i]);
        mnY = Math.min(mnY, el.points[i + 1]); mxY = Math.max(mxY, el.points[i + 1]);
      }
      return { x: mnX, y: mnY, w: mxX - mnX || 2, h: mxY - mnY || 2 };
    }
    case 'text':
      return {
        x: el.x, y: el.y - el.fontSize,
        w: Math.max(80, el.text.length * el.fontSize * 0.56), h: el.fontSize * 1.5,
      };
    default: return { x: 0, y: 0, w: 0, h: 0 };
  }
}

function moveEl(el: WBElement, dx: number, dy: number): WBElement {
  switch (el.type) {
    case 'rect': case 'sticky': case 'frame': case 'text':
      return { ...el, x: el.x + dx, y: el.y + dy };
    case 'ellipse':
      return { ...el, cx: el.cx + dx, cy: el.cy + dy };
    case 'arrow': case 'line':
      return { ...el, x1: el.x1 + dx, y1: el.y1 + dy, x2: el.x2 + dx, y2: el.y2 + dy };
    case 'pen':
    case 'highlighter': {
      const pts: number[] = [];
      for (let i = 0; i < el.points.length; i += 2) pts.push(el.points[i] + dx, el.points[i + 1] + dy);
      return { ...el, points: pts };
    }
    default: return el;
  }
}

// ─── History reducer ─────────────────────────────────────────────────────────
interface Hist { past: WBElement[][]; present: WBElement[]; future: WBElement[][] }
type HistAct = { type: 'PUSH'; els: WBElement[] } | { type: 'UNDO' } | { type: 'REDO' } | { type: 'RESET' };

function histReducer(s: Hist, a: HistAct): Hist {
  switch (a.type) {
    case 'PUSH':
      return { past: [...s.past, s.present], present: a.els, future: [] };
    case 'UNDO':
      if (!s.past.length) return s;
      return { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] };
    case 'REDO':
      if (!s.future.length) return s;
      return { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) };
    case 'RESET':
      return { past: [], present: [], future: [] };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
export const WhiteboardCanvas: React.FC = () => {
  const { isDark } = useTheme();
  const [hist, dispatch] = useReducer(histReducer, { past: [], present: [], future: [] });
  const elements = hist.present;
  const canUndo = hist.past.length > 0;
  const canRedo = hist.future.length > 0;

  // View state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Tool state
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [strokeColor, setStrokeColor] = useState(isDark ? '#a5b4fc' : '#4f46e5');

  // Set default colors based on dark/light mode on change
  useEffect(() => {
    setStrokeColor(isDark ? '#a5b4fc' : '#4f46e5');
  }, [isDark]);
  const [fillColor, setFillColor] = useState('none');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [penStyle, setPenStyle] = useState<PenStyle>('solid');
  const [fontSize, setFontSize] = useState(20);
  const [stickyBg, setStickyBg] = useState('yellow');

  // UI state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentEl, setCurrentEl] = useState<WBElement | null>(null);
  const [dragEl, setDragEl] = useState<WBElement | null>(null);

  // Refs — always-current values for event handlers
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef(1); zoomRef.current = zoom;
  const panXRef = useRef(0); panXRef.current = panX;
  const panYRef = useRef(0); panYRef.current = panY;
  const toolRef = useRef<ToolType>('select'); toolRef.current = activeTool;
  const strokeRef = useRef('#a5b4fc'); strokeRef.current = strokeColor;
  const fillRef = useRef('none'); fillRef.current = fillColor;
  const swRef = useRef(2); swRef.current = strokeWidth;
  const psRef = useRef<PenStyle>('solid'); psRef.current = penStyle;
  const fsRef = useRef(20); fsRef.current = fontSize;
  const sbgRef = useRef('yellow'); sbgRef.current = stickyBg;
  const selRef = useRef<string | null>(null); selRef.current = selectedId;
  const editRef = useRef<string | null>(null); editRef.current = editingId;
  const elsRef = useRef<WBElement[]>([]); elsRef.current = elements;
  const curElRef = useRef<WBElement | null>(null);

  // Interaction refs
  const isPanning = useRef(false);
  const isDrawing = useRef(false);
  const isDragging = useRef(false);
  const panStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const drawStart = useRef<{ x: number; y: number } | null>(null);
  const dragData = useRef<{ id: string; sw: { x: number; y: number }; snap: WBElement } | null>(null);

  // Helper: screen → world
  const s2w = useCallback((sx: number, sy: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const r = svgRef.current.getBoundingClientRect();
    return {
      x: (sx - r.left - panXRef.current) / zoomRef.current,
      y: (sy - r.top - panYRef.current) / zoomRef.current,
    };
  }, []);

  // Sync currentEl state + ref together
  const setCurEl = (el: WBElement | null) => {
    curElRef.current = el;
    setCurrentEl(el);
  };

  // Push to history
  const push = useCallback((els: WBElement[]) => dispatch({ type: 'PUSH', els }), []);

  // ─── Zoom via wheel ─────────────────────────────────────────────────────────
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const r = svgRef.current!.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomRef.current * factor));
    const scale = nz / zoomRef.current;
    setZoom(nz);
    setPanX(mx - (mx - panXRef.current) * scale);
    setPanY(my - (my - panYRef.current) * scale);
  };

  // ─── Pointer Down (SVG background) ──────────────────────────────────────────
  const onSvgDown = (e: React.PointerEvent) => {
    if (editRef.current) return;

    // Middle mouse / hand → pan
    if (e.button === 1 || toolRef.current === 'hand') {
      e.preventDefault();
      isPanning.current = true;
      panStart.current = { mx: e.clientX, my: e.clientY, px: panXRef.current, py: panYRef.current };
      svgRef.current?.setPointerCapture(e.pointerId);
      return;
    }
    if (e.button !== 0) return;
    svgRef.current?.setPointerCapture(e.pointerId);

    const w = s2w(e.clientX, e.clientY);
    const id = genId();
    const tool = toolRef.current;

    switch (tool) {
      case 'pen':
      case 'highlighter':
        isDrawing.current = true;
        drawStart.current = w;
        setCurEl({ id, type: tool, points: [w.x, w.y], color: strokeRef.current, strokeWidth: swRef.current, penStyle: psRef.current });
        break;
      case 'rect':
        isDrawing.current = true;
        drawStart.current = w;
        setCurEl({ id, type: 'rect', x: w.x, y: w.y, width: 0, height: 0, color: strokeRef.current, fillColor: fillRef.current, strokeWidth: swRef.current, penStyle: psRef.current });
        break;
      case 'ellipse':
        isDrawing.current = true;
        drawStart.current = w;
        setCurEl({ id, type: 'ellipse', cx: w.x, cy: w.y, rx: 0, ry: 0, color: strokeRef.current, fillColor: fillRef.current, strokeWidth: swRef.current, penStyle: psRef.current });
        break;
      case 'arrow':
        isDrawing.current = true;
        drawStart.current = w;
        setCurEl({ id, type: 'arrow', x1: w.x, y1: w.y, x2: w.x, y2: w.y, color: strokeRef.current, strokeWidth: swRef.current, penStyle: psRef.current });
        break;
      case 'line':
        isDrawing.current = true;
        drawStart.current = w;
        setCurEl({ id, type: 'line', x1: w.x, y1: w.y, x2: w.x, y2: w.y, color: strokeRef.current, strokeWidth: swRef.current, penStyle: psRef.current });
        break;
      case 'frame':
        isDrawing.current = true;
        drawStart.current = w;
        setCurEl({ id, type: 'frame', x: w.x, y: w.y, width: 0, height: 0, title: 'Frame', color: strokeRef.current });
        break;
      case 'sticky': {
        const newEl: StickyEl = { id, type: 'sticky', x: w.x - 110, y: w.y - 80, width: 220, height: 160, text: '', bgColor: sbgRef.current };
        push([...elsRef.current, newEl]);
        setSelectedId(id);
        setTimeout(() => setEditingId(id), 50);
        break;
      }
      case 'text': {
        const newEl: TextEl = { id, type: 'text', x: w.x, y: w.y, text: 'Text', fontSize: fsRef.current, color: strokeRef.current };
        push([...elsRef.current, newEl]);
        setSelectedId(id);
        setTimeout(() => setEditingId(id), 50);
        break;
      }
      case 'select':
        setSelectedId(null);
        break;
    }
  };

  // ─── Pointer Move (SVG) ──────────────────────────────────────────────────────
  const onSvgMove = (e: React.PointerEvent) => {
    if (isPanning.current && panStart.current) {
      setPanX(panStart.current.px + e.clientX - panStart.current.mx);
      setPanY(panStart.current.py + e.clientY - panStart.current.my);
      return;
    }

    if (isDragging.current && dragData.current) {
      const w = s2w(e.clientX, e.clientY);
      const dx = w.x - dragData.current.sw.x;
      const dy = w.y - dragData.current.sw.y;
      const moved = moveEl(dragData.current.snap, dx, dy);
      setDragEl(moved);
      return;
    }

    if (!isDrawing.current || !drawStart.current) return;
    const w = s2w(e.clientX, e.clientY);
    const cur = curElRef.current;
    if (!cur) return;

    if (cur.type === 'pen' || cur.type === 'highlighter') {
      const lx = cur.points[cur.points.length - 2], ly = cur.points[cur.points.length - 1];
      if (Math.hypot(w.x - lx, w.y - ly) > 1.5 / zoomRef.current) {
        const updated = { ...cur, points: [...cur.points, w.x, w.y] };
        setCurEl(updated);
      }
    } else if (cur.type === 'rect' || cur.type === 'frame') {
      const x = Math.min(drawStart.current.x, w.x), y = Math.min(drawStart.current.y, w.y);
      setCurEl({ ...cur, x, y, width: Math.abs(w.x - drawStart.current.x), height: Math.abs(w.y - drawStart.current.y) });
    } else if (cur.type === 'ellipse') {
      setCurEl({
        ...cur,
        cx: (drawStart.current.x + w.x) / 2,
        cy: (drawStart.current.y + w.y) / 2,
        rx: Math.abs(w.x - drawStart.current.x) / 2,
        ry: Math.abs(w.y - drawStart.current.y) / 2,
      });
    } else if (cur.type === 'arrow' || cur.type === 'line') {
      setCurEl({ ...cur, x2: w.x, y2: w.y } as WBElement);
    }
  };

  // ─── Pointer Up ──────────────────────────────────────────────────────────────
  const onSvgUp = () => {
    isPanning.current = false;
    panStart.current = null;

    if (isDragging.current && dragData.current) {
      isDragging.current = false;
      const tid = dragData.current.id;
      const finalEl = dragEl;
      dragData.current = null;
      setDragEl(null);
      if (finalEl) push(elsRef.current.map(el => el.id === tid ? finalEl : el));
      return;
    }

    if (isDrawing.current && curElRef.current) {
      const el = curElRef.current;
      let valid = true;
      if (el.type === 'pen' || el.type === 'highlighter') valid = el.points.length >= 4;
      else if (el.type === 'rect' || el.type === 'frame') valid = el.width > 5 && el.height > 5;
      else if (el.type === 'ellipse') valid = el.rx > 2 && el.ry > 2;
      else if (el.type === 'arrow' || el.type === 'line') valid = Math.hypot(el.x2 - el.x1, el.y2 - el.y1) > 10;
      if (valid) push([...elsRef.current, el]);
      isDrawing.current = false;
      drawStart.current = null;
      setCurEl(null);
    }
  };

  // ─── Element pointer handlers ─────────────────────────────────────────────
  const onElDown = (e: React.PointerEvent, el: WBElement) => {
    if (toolRef.current === 'eraser') {
      e.stopPropagation();
      push(elsRef.current.filter(x => x.id !== el.id));
      return;
    }
    if (toolRef.current === 'select') {
      e.stopPropagation();
      setSelectedId(el.id);
      const w = s2w(e.clientX, e.clientY);
      dragData.current = { id: el.id, sw: w, snap: el };
      isDragging.current = true;
      setDragEl(el);
      svgRef.current?.setPointerCapture(e.pointerId);
    }
  };

  const onElDblClick = (e: React.MouseEvent, el: WBElement) => {
    if (el.type === 'sticky' || el.type === 'text' || el.type === 'frame') {
      e.stopPropagation();
      setSelectedId(el.id);
      setEditingId(el.id);
    }
  };

  const handleEditDone = (id: string, value: string) => {
    push(elsRef.current.map(el => {
      if (el.id !== id) return el;
      if (el.type === 'sticky') return { ...el, text: value };
      if (el.type === 'text') return { ...el, text: value };
      if (el.type === 'frame') return { ...el, title: value };
      return el;
    }));
    setEditingId(null);
  };

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); dispatch({ type: 'UNDO' }); }
        if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); dispatch({ type: 'REDO' }); }
        return;
      }
      const toolMap: Record<string, ToolType> = {
        v: 'select', h: 'hand', p: 'pen', r: 'rect', o: 'ellipse',
        a: 'arrow', l: 'line', s: 'sticky', t: 'text', e: 'eraser', f: 'frame',
      };
      if (toolMap[e.key]) setActiveTool(toolMap[e.key]);
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selRef.current) {
          dispatch({ type: 'PUSH', els: elsRef.current.filter(x => x.id !== selRef.current) });
          setSelectedId(null);
        }
      }
      if (e.key === 'Escape') { setSelectedId(null); setEditingId(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ─── Render SVG element ────────────────────────────────────────────────────
  const selRect = (bb: { x: number; y: number; w: number; h: number }, pad = 7) => (
    <rect
      x={bb.x - pad} y={bb.y - pad}
      width={bb.w + pad * 2} height={bb.h + pad * 2}
      fill="none"
      stroke="#818cf8"
      strokeWidth={1.5 / zoom}
      strokeDasharray={`${5 / zoom},${3 / zoom}`}
      rx={3 / zoom}
      pointerEvents="none"
    />
  );

  const renderEl = (el: WBElement, preview = false): React.ReactNode => {
    const isSel = selectedId === el.id && !preview;
    const elProps = preview ? {} : {
      onPointerDown: (e: React.PointerEvent) => onElDown(e, el),
      onDoubleClick: (e: React.MouseEvent) => onElDblClick(e, el),
    };
    const mc = activeTool === 'select' ? 'move' : activeTool === 'eraser' ? 'crosshair' : 'default';

    switch (el.type) {
      case 'pen':
      case 'highlighter': {
        const d = smoothPath(el.points);
        const bb = getBBox(el);
        const dash = el.penStyle === 'dashed' ? `${el.strokeWidth * 3},${el.strokeWidth * 3}` : el.penStyle === 'dotted' ? `${el.strokeWidth},${el.strokeWidth * 2}` : 'none';
        return (
          <g key={el.id} {...elProps} style={{ cursor: mc }}>
            <path d={d} fill="none" stroke="transparent" strokeWidth={Math.max(14, el.strokeWidth * 2.5)} />
            <path d={d} fill="none" stroke={el.color} strokeWidth={el.strokeWidth} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={dash}
              opacity={el.type === 'highlighter' ? 0.4 : 1}
              style={el.type === 'highlighter' ? { mixBlendMode: 'screen' } : {}}
            />
            {isSel && selRect(bb)}
          </g>
        );
      }

      case 'rect': {
        const bb = getBBox(el);
        const dash = el.penStyle === 'dashed' ? `${el.strokeWidth * 3},${el.strokeWidth * 3}` : el.penStyle === 'dotted' ? `${el.strokeWidth},${el.strokeWidth * 2}` : 'none';
        return (
          <g key={el.id} {...elProps} style={{ cursor: mc }}>
            <rect x={el.x} y={el.y} width={el.width} height={el.height}
              fill={el.fillColor === 'none' ? 'transparent' : el.fillColor}
              stroke={el.color} strokeWidth={el.strokeWidth} strokeDasharray={dash} rx={2} />
            {isSel && selRect(bb)}
          </g>
        );
      }

      case 'ellipse': {
        const bb = getBBox(el);
        const dash = el.penStyle === 'dashed' ? `${el.strokeWidth * 3},${el.strokeWidth * 3}` : el.penStyle === 'dotted' ? `${el.strokeWidth},${el.strokeWidth * 2}` : 'none';
        return (
          <g key={el.id} {...elProps} style={{ cursor: mc }}>
            <ellipse cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry}
              fill={el.fillColor === 'none' ? 'transparent' : el.fillColor}
              stroke={el.color} strokeWidth={el.strokeWidth} strokeDasharray={dash} />
            {isSel && selRect(bb)}
          </g>
        );
      }

      case 'arrow': {
        const dx = el.x2 - el.x1, dy = el.y2 - el.y1;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len, px = -uy, py = ux;
        const as = Math.min(16, len * 0.28);
        const ax = el.x2 - ux * as, ay = el.y2 - uy * as;
        const pts = `${el.x2},${el.y2} ${ax + px * as * 0.42},${ay + py * as * 0.42} ${ax - px * as * 0.42},${ay - py * as * 0.42}`;
        const bb = getBBox(el);
        const dash = el.penStyle === 'dashed' ? `${el.strokeWidth * 3},${el.strokeWidth * 3}` : el.penStyle === 'dotted' ? `${el.strokeWidth},${el.strokeWidth * 2}` : 'none';
        return (
          <g key={el.id} {...elProps} style={{ cursor: mc }}>
            <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="transparent" strokeWidth={Math.max(14, el.strokeWidth * 2.5)} />
            <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={el.color} strokeWidth={el.strokeWidth} strokeLinecap="round" strokeDasharray={dash} />
            <polygon points={pts} fill={el.color} />
            {isSel && selRect(bb)}
          </g>
        );
      }

      case 'line': {
        const bb = getBBox(el);
        const dash = el.penStyle === 'dashed' ? `${el.strokeWidth * 3},${el.strokeWidth * 3}` : el.penStyle === 'dotted' ? `${el.strokeWidth},${el.strokeWidth * 2}` : 'none';
        return (
          <g key={el.id} {...elProps} style={{ cursor: mc }}>
            <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="transparent" strokeWidth={Math.max(14, el.strokeWidth * 2.5)} />
            <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={el.color} strokeWidth={el.strokeWidth} strokeLinecap="round" strokeDasharray={dash} />
            {isSel && selRect(bb)}
          </g>
        );
      }

      case 'sticky': {
        const c = STICKY_C[el.bgColor] || STICKY_C.yellow;
        const isEd = editingId === el.id;
        const bb = getBBox(el);
        return (
          <g key={el.id} {...elProps} style={{ cursor: mc }}>
            {/* Drop shadow */}
            <rect x={el.x + 4} y={el.y + 4} width={el.width} height={el.height}
              fill="rgba(0,0,0,0.18)" rx={10} />
            {/* Body */}
            <rect x={el.x} y={el.y} width={el.width} height={el.height}
              fill={c.bg} stroke={c.border} strokeWidth={1.5} rx={10} />
            {/* Header */}
            <rect x={el.x} y={el.y} width={el.width} height={28} fill={c.header} rx={10} />
            <rect x={el.x} y={el.y + 20} width={el.width} height={8} fill={c.header} />
            {/* Header dots */}
            {[12, 24, 36].map((cx, i) => (
              <circle key={i} cx={el.x + cx} cy={el.y + 14} r={3} fill="rgba(255,255,255,0.75)" />
            ))}
            {/* Text content */}
            {!isEd && (
              <foreignObject x={el.x + 10} y={el.y + 34} width={el.width - 20} height={el.height - 44}>
                <div style={{
                  width: '100%', height: '100%',
                  fontSize: 13, color: c.text, lineHeight: 1.55,
                  fontFamily: 'Poppins, sans-serif',
                  wordBreak: 'break-word', overflow: 'hidden', whiteSpace: 'pre-wrap',
                }}>
                  {el.text || <span style={{ opacity: 0.35, fontStyle: 'italic', fontSize: 12 }}>Double-click to edit…</span>}
                </div>
              </foreignObject>
            )}
            {isSel && !isEd && selRect(bb)}
          </g>
        );
      }

      case 'text': {
        if (editingId === el.id) return null;
        const bb = getBBox(el);
        return (
          <g key={el.id} {...elProps} style={{ cursor: activeTool === 'select' ? 'text' : 'default' }}>
            <rect x={bb.x - 2} y={bb.y - 2} width={bb.w + 4} height={bb.h + 4} fill="transparent" />
            <text x={el.x} y={el.y} fontSize={el.fontSize} fill={el.color}
              fontFamily="Poppins, sans-serif" fontWeight={el.bold ? 700 : 400}>
              {el.text}
            </text>
            {isSel && selRect(bb)}
          </g>
        );
      }

      case 'frame': {
        const isEd = editingId === el.id;
        const bb = getBBox(el);
        return (
          <g key={el.id} {...elProps} style={{ cursor: mc }}>
            <rect x={el.x} y={el.y} width={el.width} height={el.height}
              fill="rgba(99,102,241,0.04)"
              stroke={el.color} strokeWidth={1.5 / zoom}
              strokeDasharray={`${8 / zoom},${4 / zoom}`} rx={4} />
            {!isEd && (
              <text x={el.x + 10} y={el.y - 8} fontSize={12 / zoom} fill={el.color}
                fontFamily="Poppins, sans-serif" fontWeight={700}>
                {el.title}
              </text>
            )}
            {isSel && selRect(bb)}
          </g>
        );
      }

      default: return null;
    }
  };

  // ─── Editing overlay ──────────────────────────────────────────────────────
  const renderEditOverlay = () => {
    if (!editingId || !svgRef.current) return null;
    const el = elsRef.current.find(e => e.id === editingId);
    if (!el) return null;
    const r = svgRef.current.getBoundingClientRect();

    if (el.type === 'sticky') {
      const c = STICKY_C[el.bgColor] || STICKY_C.yellow;
      return (
        <textarea
          key={`ed-${editingId}`}
          autoFocus
          defaultValue={el.text}
          placeholder="Type here..."
          style={{
            position: 'fixed',
            left: el.x * zoom + panXRef.current + r.left + 10 * zoom,
            top: (el.y + 34) * zoom + panYRef.current + r.top,
            width: (el.width - 20) * zoom, height: (el.height - 44) * zoom,
            fontSize: 13 * zoom, color: c.text, background: 'transparent',
            border: 'none', outline: 'none', resize: 'none',
            fontFamily: 'Poppins, sans-serif', lineHeight: 1.55,
            padding: 0, zIndex: 9999, boxSizing: 'border-box',
          }}
          onBlur={e => handleEditDone(editingId, e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') e.currentTarget.blur(); }}
        />
      );
    }

    if (el.type === 'text') {
      return (
        <input
          key={`ed-${editingId}`}
          autoFocus
          defaultValue={el.text}
          style={{
            position: 'fixed',
            left: el.x * zoom + panXRef.current + r.left,
            top: (el.y - el.fontSize) * zoom + panYRef.current + r.top,
            fontSize: el.fontSize * zoom, color: el.color,
            background: 'transparent', border: 'none',
            outline: '1.5px dashed rgba(129,140,248,0.7)',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: el.bold ? 700 : 400,
            zIndex: 9999, minWidth: 120, padding: '2px 4px',
          }}
          onBlur={e => handleEditDone(editingId, e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur(); }}
        />
      );
    }

    if (el.type === 'frame') {
      return (
        <input
          key={`ed-${editingId}`}
          autoFocus
          defaultValue={el.title}
          style={{
            position: 'fixed',
            left: (el.x + 10) * zoom + panXRef.current + r.left,
            top: (el.y - 22) * zoom + panYRef.current + r.top,
            fontSize: 12 * zoom, color: el.color,
            background: 'rgba(16,16,22,0.92)',
            border: '1px solid rgba(129,140,248,0.5)',
            outline: 'none', borderRadius: 5,
            fontFamily: 'Poppins, sans-serif', fontWeight: 700,
            zIndex: 9999, minWidth: 100, padding: '2px 8px',
          }}
          onBlur={e => handleEditDone(editingId, e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur(); }}
        />
      );
    }
    return null;
  };

  // ─── Cursor ───────────────────────────────────────────────────────────────
  const getCursor = () => {
    if (isPanning.current) return 'grabbing';
    if (activeTool === 'hand') return 'grab';
    if (['pen', 'highlighter', 'rect', 'ellipse', 'arrow', 'line', 'frame'].includes(activeTool)) return 'crosshair';
    if (activeTool === 'sticky' || activeTool === 'text') return 'cell';
    if (activeTool === 'eraser') return 'crosshair';
    return 'default';
  };

  // ─── Grid ─────────────────────────────────────────────────────────────────
  const gs = GRID * zoom;
  const gox = panX % gs, goy = panY % gs;
  const dotR = Math.max(0.8, Math.min(2.2, zoom * 1.1));

  const draggingId = dragData.current?.id;

  const canvasBg = '#000000';
  const dotColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';
  const zoomPillBg = isDark ? 'rgba(18,18,26,0.88)' : 'rgba(255,255,255,0.88)';
  const zoomPillBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const zoomPillColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: canvasBg }}>
      <svg
        ref={svgRef}
        style={{ display: 'block', width: '100%', height: '100%', cursor: getCursor() }}
        onPointerDown={onSvgDown}
        onPointerMove={onSvgMove}
        onPointerUp={onSvgUp}
        onPointerCancel={onSvgUp}
        onWheel={onWheel}
      >
        <defs>
          <pattern id="wb-dots" x={gox} y={goy} width={gs} height={gs} patternUnits="userSpaceOnUse">
            <circle cx={gs / 2} cy={gs / 2} r={dotR} fill={dotColor} />
          </pattern>
        </defs>

        {/* Background */}
        <rect width="100%" height="100%" fill={canvasBg} />
        <rect width="100%" height="100%" fill="url(#wb-dots)" />

        {/* World transform group */}
        <g transform={`translate(${panX},${panY}) scale(${zoom})`}>
          {/* Frames first (behind everything) */}
          {elements.filter(el => el.type === 'frame' && el.id !== draggingId).map(el => renderEl(el))}

          {/* All other elements */}
          {elements.filter(el => el.type !== 'frame' && el.id !== draggingId).map(el => renderEl(el))}

          {/* Dragging element (rendered live, on top) */}
          {dragEl && renderEl(dragEl, true)}

          {/* Current element being drawn */}
          {currentEl && renderEl(currentEl, true)}
        </g>
      </svg>

      {/* Editing overlays */}
      {renderEditOverlay()}

      {/* Toolbar */}
      <WhiteboardToolbar
        isDark={isDark}
        activeTool={activeTool}
        onToolChange={t => { setActiveTool(t); setSelectedId(null); setEditingId(null); }}
        strokeColor={strokeColor}
        onStrokeColorChange={setStrokeColor}
        fillColor={fillColor}
        onFillColorChange={setFillColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        penStyle={penStyle}
        onPenStyleChange={setPenStyle}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        stickyBg={stickyBg}
        onStickyBgChange={setStickyBg}
        zoom={zoom}
        onZoomIn={() => setZoom(z => Math.min(MAX_ZOOM, z * 1.2))}
        onZoomOut={() => setZoom(z => Math.max(MIN_ZOOM, z / 1.2))}
        onFitScreen={() => { setZoom(1); setPanX(0); setPanY(0); }}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onRedo={() => dispatch({ type: 'REDO' })}
        canUndo={canUndo}
        canRedo={canRedo}
        selectedId={selectedId}
        onDeleteSelected={() => {
          if (selRef.current) {
            dispatch({ type: 'PUSH', els: elsRef.current.filter(x => x.id !== selRef.current) });
            setSelectedId(null);
          }
        }}
        onDuplicateSelected={() => {
          if (selRef.current) {
            const orig = elsRef.current.find(x => x.id === selRef.current);
            if (orig) {
              const nid = genId();
              const copy = moveEl({ ...orig, id: nid }, 24, 24);
              dispatch({ type: 'PUSH', els: [...elsRef.current, copy] });
              setSelectedId(nid);
            }
          }
        }}
        onClearCanvas={() => {
          if (elsRef.current.length > 0) dispatch({ type: 'RESET' });
          setSelectedId(null);
          setEditingId(null);
        }}
        elementCount={elements.length}
      />

      {/* Zoom pill — top left */}
      <div style={{
        position: 'absolute', top: 14, left: 14,
        background: zoomPillBg, backdropFilter: 'blur(14px)',
        border: `1px solid ${zoomPillBorder}`, borderRadius: 10,
        padding: '5px 13px', color: zoomPillColor,
        fontSize: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 600,
        pointerEvents: 'none', userSelect: 'none',
        boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.35)' : '0 2px 12px rgba(0,0,0,0.12)',
      }}>
        {Math.round(zoom * 100)}%
      </div>

      {/* Element count — top right */}
      {elements.length > 0 && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: zoomPillBg, backdropFilter: 'blur(14px)',
          border: `1px solid ${zoomPillBorder}`, borderRadius: 10,
          padding: '5px 13px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          fontSize: 11, fontFamily: 'Poppins, sans-serif',
          pointerEvents: 'none', userSelect: 'none',
        }}>
          {elements.length} element{elements.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Keyboard hint — bottom right */}
      <div style={{
        position: 'absolute', bottom: 88, right: 14,
        color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.35)', fontSize: 10,
        fontFamily: 'Poppins, sans-serif', pointerEvents: 'none',
        lineHeight: 1.8, textAlign: 'right',
      }}>
        V Select · H Hand · P Pen<br />
        R Rect · O Circle · A Arrow<br />
        S Sticky · T Text · F Frame<br />
        Ctrl+Z Undo · Del Delete
      </div>
    </div>
  );
};
