import React, { useState, useRef, useEffect } from 'react';
import {
  FiMousePointer, FiMove, FiEdit3, FiEdit2, FiSquare, FiCircle,
  FiArrowUpRight, FiMinus, FiFileText, FiType, FiLayout,
  FiRotateCcw, FiRotateCw, FiZoomIn, FiZoomOut, FiMaximize2,
  FiTrash2, FiCopy, FiSlash, FiDelete,
} from 'react-icons/fi';
import type { ToolType, PenStyle } from './types';

// ─── Color palettes ──────────────────────────────────────────────────────────
const STROKE_PALETTE = [
  '#ffffff', '#cbd5e1', '#64748b', '#0f172a',
  '#f87171', '#fb923c', '#fbbf24', '#4ade80',
  '#60a5fa', '#a78bfa', '#f472b6', '#2dd4bf',
  '#a5b4fc', '#fde68a', '#6ee7b7', '#fca5a5',
];

const FILL_PALETTE = [
  'rgba(255,255,255,0.12)', 'rgba(100,116,139,0.25)', 'rgba(15,23,42,0.5)',
  'rgba(248,113,113,0.2)', 'rgba(251,146,60,0.2)', 'rgba(251,191,36,0.2)',
  'rgba(74,222,128,0.2)', 'rgba(96,165,250,0.2)', 'rgba(167,139,250,0.2)',
  'rgba(244,114,182,0.2)', 'rgba(45,212,180,0.2)', 'rgba(165,180,252,0.2)',
];

const STICKY_COLORS: Record<string, string> = {
  yellow: '#f59e0b', purple: '#8b5cf6', blue: '#3b82f6',
  green: '#22c55e', pink: '#ec4899', orange: '#f97316',
};

const STROKE_WIDTHS = [1, 2, 4, 8] as const;

// ─── Tool definitions ────────────────────────────────────────────────────────
interface ToolDef { id: ToolType; icon: React.ComponentType<any>; label: string; shortcut: string; }

const NAV_TOOLS: ToolDef[] = [
  { id: 'select', icon: FiMousePointer, label: 'Select', shortcut: 'V' },
  { id: 'hand', icon: FiMove, label: 'Hand / Pan', shortcut: 'H' },
];
const DRAW_TOOLS: ToolDef[] = [
  { id: 'pen', icon: FiEdit3, label: 'Pen', shortcut: 'P' },
  { id: 'highlighter', icon: FiEdit2, label: 'Highlighter', shortcut: 'W' },
  { id: 'eraser', icon: FiDelete, label: 'Eraser', shortcut: 'E' },
];
const SHAPE_TOOLS: ToolDef[] = [
  { id: 'rect', icon: FiSquare, label: 'Rectangle', shortcut: 'R' },
  { id: 'ellipse', icon: FiCircle, label: 'Circle', shortcut: 'O' },
  { id: 'arrow', icon: FiArrowUpRight, label: 'Arrow', shortcut: 'A' },
  { id: 'line', icon: FiMinus, label: 'Line', shortcut: 'L' },
];
const ADD_TOOLS: ToolDef[] = [
  { id: 'sticky', icon: FiFileText, label: 'Sticky Note', shortcut: 'S' },
  { id: 'text', icon: FiType, label: 'Text', shortcut: 'T' },
  { id: 'frame', icon: FiLayout, label: 'Frame', shortcut: 'F' },
];

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
  isDark: boolean;
  activeTool: ToolType;
  onToolChange: (t: ToolType) => void;
  strokeColor: string;
  onStrokeColorChange: (c: string) => void;
  fillColor: string;
  onFillColorChange: (c: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (w: number) => void;
  penStyle?: PenStyle;
  onPenStyleChange?: (ps: PenStyle) => void;
  fontSize: number;
  onFontSizeChange: (s: number) => void;
  stickyBg: string;
  onStickyBgChange: (c: string) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedId: string | null;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onClearCanvas: () => void;
  elementCount: number;
}

// ─── Component ───────────────────────────────────────────────────────────────
export const WhiteboardToolbar: React.FC<Props> = ({
  isDark,
  activeTool, onToolChange,
  strokeColor, onStrokeColorChange,
  fillColor, onFillColorChange,
  strokeWidth, onStrokeWidthChange,
  penStyle, onPenStyleChange,
  fontSize, onFontSizeChange,
  stickyBg, onStickyBgChange,
  zoom, onZoomIn, onZoomOut, onFitScreen,
  onUndo, onRedo, canUndo, canRedo,
  selectedId, onDeleteSelected, onDuplicateSelected,
  onClearCanvas, elementCount,
}) => {
  const [popup, setPopup] = useState<'stroke' | 'fill' | 'sticky' | 'width' | null>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const toolbarBg = isDark ? 'rgba(14,14,20,0.96)' : 'rgba(255,255,255,0.96)';
  const toolbarBorder = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)';
  const iconColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const iconHoverColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';
  const dividerBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  // Close popups on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setPopup(null);
      }
    };
    if (popup) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popup]);

  // ─── Sub-renderers ───────────────────────────────────────────────────────
  const renderDivider = (key?: string) => (
    <div key={key} style={{ width: 1, height: 30, background: dividerBg, flexShrink: 0, margin: '0 3px' }} />
  );

  const renderToolBtn = (def: ToolDef) => {
    const active = activeTool === def.id;
    const Icon = def.icon;
    return (
      <button
        onClick={() => onToolChange(def.id)}
        title={`${def.label}  (${def.shortcut})`}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 2, width: 46, height: 46, borderRadius: 10, flexShrink: 0,
          background: active ? (isDark ? 'rgba(99,102,241,0.22)' : 'rgba(79,70,229,0.15)') : 'transparent',
          border: active ? (isDark ? '1px solid rgba(129,140,248,0.6)' : '1px solid rgba(79,70,229,0.5)') : '1px solid transparent',
          color: active ? (isDark ? '#a5b4fc' : '#4f46e5') : iconColor,
          cursor: 'pointer', transition: 'all 0.13s',
        }}
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'; }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        <Icon size={17} />
        <span style={{ fontSize: 9, fontFamily: 'Poppins, sans-serif', fontWeight: 700, letterSpacing: 0.5, opacity: 0.65 }}>
          {def.shortcut}
        </span>
      </button>
    );
  };

  const renderIconBtn = (
    onClick: () => void, title: string, disabled: boolean | undefined,
    children: React.ReactNode, color: string | undefined, size: number = 32
  ) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: size, height: size, borderRadius: 8, flexShrink: 0,
        background: 'transparent', border: 'none',
        color: color || (disabled ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : iconColor),
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.13s',
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.color = color || iconHoverColor; }}
      onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.color = color || (disabled ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : iconColor); }}
    >
      {children}
    </button>
  );

  // Color swatch helper
  const renderSwatch = (color: string, active: boolean, onClick: () => void, size: number = 22) => (
    <button
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: 5,
        background: color === 'none' ? 'transparent' : color,
        border: active ? (isDark ? '2px solid #a5b4fc' : '2px solid #4f46e5') : (isDark ? '2px solid rgba(255,255,255,0.15)' : '2px solid rgba(0,0,0,0.15)'),
        cursor: 'pointer', flexShrink: 0, transition: 'border 0.13s',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {color === 'none' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg,transparent 44%,rgba(239,68,68,0.85) 44%,rgba(239,68,68,0.85) 56%,transparent 56%)',
        }} />
      )}
    </button>
  );

  // ─── Popup panels ────────────────────────────────────────────────────────
  const renderPopupPanel = (children: React.ReactNode) => (
    <div style={{
      position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
      marginBottom: 10,
      background: isDark ? 'rgba(15,15,22,0.97)' : 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', borderRadius: 14,
      padding: 14, zIndex: 300, minWidth: 180,
      boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)' : '0 16px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
    }}>
      {children}
    </div>
  );

  const renderSectionLabel = (children: string) => (
    <div style={{
      fontSize: 9, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
      fontFamily: 'Poppins, sans-serif', fontWeight: 700,
      letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8,
    }}>
      {children}
    </div>
  );

  const strokePopup = (
    renderPopupPanel(
      <>
        {renderSectionLabel('Stroke Color')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
          {STROKE_PALETTE.map(c => (
            <React.Fragment key={c}>{renderSwatch(c, strokeColor === c, () => onStrokeColorChange(c))}</React.Fragment>
          ))}
        </div>
      <input
        type="color"
        value={strokeColor}
        onChange={e => onStrokeColorChange(e.target.value)}
        style={{ width: '100%', height: 30, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
      />
      </>
    )
  );

  const fillPopup = (
    renderPopupPanel(
      <>
        {renderSectionLabel('Fill Color')}
        <div style={{ marginBottom: 8 }}>
          {renderSwatch('none', fillColor === 'none', () => onFillColorChange('none'), 30)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
          {FILL_PALETTE.map(c => (
            <React.Fragment key={c}>{renderSwatch(c, fillColor === c, () => onFillColorChange(c))}</React.Fragment>
          ))}
        </div>
      <input
        type="color"
        value={fillColor === 'none' ? '#6366f1' : fillColor}
        onChange={e => onFillColorChange(e.target.value)}
        style={{ width: '100%', height: 30, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
      />
      </>
    )
  );

  const stickyPopup = (
    renderPopupPanel(
      <>
        {renderSectionLabel('Sticky Color')}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {Object.entries(STICKY_COLORS).map(([name, color]) => (
          <button
            key={name}
            onClick={() => { onStickyBgChange(name); setPopup(null); }}
            title={name.charAt(0).toUpperCase() + name.slice(1)}
            style={{
              width: 30, height: 30, borderRadius: '50%', background: color,
              border: stickyBg === name ? (isDark ? '3px solid white' : '3px solid black') : '2px solid rgba(255,255,255,0.2)',
              cursor: 'pointer', transition: 'all 0.13s', flexShrink: 0,
            }}
          />
        ))}
        </div>
      </>
    )
  );

  const smlBtnStyle = (isDark: boolean): React.CSSProperties => ({
    width: 28, height: 28, borderRadius: 8, border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
    cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  const widthPopup = (
    renderPopupPanel(
      <>
        {renderSectionLabel('Stroke Style')}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {['solid', 'dashed', 'dotted'].map(st => (
          <button
            key={st}
            onClick={() => { if(onPenStyleChange) onPenStyleChange(st as PenStyle); setPopup(null); }}
            style={{
              flex: 1, padding: '4px 0', borderRadius: 6, cursor: 'pointer',
              background: penStyle === st ? 'rgba(99,102,241,0.2)' : 'transparent',
              border: penStyle === st ? '1px solid rgba(129,140,248,0.5)' : '1px solid transparent',
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
              fontSize: 10, fontFamily: 'Poppins', textTransform: 'capitalize'
            }}
          >
            {st}
          </button>
        ))}
        </div>
        {renderSectionLabel('Stroke Width')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {STROKE_WIDTHS.map(w => (
          <button
            key={w}
            onClick={() => { onStrokeWidthChange(w); setPopup(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
              background: strokeWidth === w ? 'rgba(99,102,241,0.2)' : 'transparent',
              border: strokeWidth === w ? '1px solid rgba(129,140,248,0.5)' : '1px solid transparent',
            }}
          >
            <div style={{ flex: 1, height: w === 1 ? 1 : w === 2 ? 2 : w === 4 ? 3 : 5, background: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)', borderRadius: 2 }} />
            <span style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontFamily: 'Poppins', width: 24, textAlign: 'right' }}>{w}px</span>
          </button>
        ))}
        </div>
        <div style={{ marginTop: 12 }}>
          {renderSectionLabel('Font Size')}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => onFontSizeChange(Math.max(10, fontSize - 2))} style={smlBtnStyle(isDark)}>−</button>
          <span style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontFamily: 'Poppins', minWidth: 24, textAlign: 'center' }}>{fontSize}</span>
            <button onClick={() => onFontSizeChange(Math.min(96, fontSize + 2))} style={smlBtnStyle(isDark)}>+</button>
          </div>
        </div>
      </>
    )
  );

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={popRef}
      style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 3,
        background: toolbarBg, backdropFilter: 'blur(24px)',
        border: `1px solid ${toolbarBorder}`,
        borderRadius: 20, padding: '6px 10px',
        boxShadow: isDark ? '0 12px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03)' : '0 12px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)',
        userSelect: 'none', zIndex: 100,
        maxWidth: 'calc(100vw - 48px)', overflowX: 'auto',
      }}
    >
      {/* Zoom controls */}
      {renderIconBtn(onZoomOut, 'Zoom Out (scroll)', false, <FiZoomOut size={14} />, undefined)}
      <span style={{ ...zoomLabelStyle, color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.65)' }}>{Math.round(zoom * 100)}%</span>
      {renderIconBtn(onZoomIn, 'Zoom In (scroll)', false, <FiZoomIn size={14} />, undefined)}
      {renderIconBtn(onFitScreen, 'Reset View', false, <FiMaximize2 size={13} />, undefined, 30)}

      {renderDivider()}

      {/* Undo / Redo */}
      {renderIconBtn(onUndo, 'Undo (Ctrl+Z)', !canUndo, <FiRotateCcw size={14} />, undefined)}
      {renderIconBtn(onRedo, 'Redo (Ctrl+Y)', !canRedo, <FiRotateCw size={14} />, undefined)}

      {renderDivider()}

      {/* Nav tools */}
      {NAV_TOOLS.map(t => <React.Fragment key={t.id}>{renderToolBtn(t)}</React.Fragment>)}

      {renderDivider()}

      {/* Draw tools */}
      {DRAW_TOOLS.map(t => <React.Fragment key={t.id}>{renderToolBtn(t)}</React.Fragment>)}

      {renderDivider()}

      {/* Shape tools */}
      {SHAPE_TOOLS.map(t => <React.Fragment key={t.id}>{renderToolBtn(t)}</React.Fragment>)}

      {renderDivider()}

      {/* Add tools (sticky special) */}
      {ADD_TOOLS.map(t => {
        if (t.id === 'sticky') {
          const active = activeTool === 'sticky';
          const accentColor = STICKY_COLORS[stickyBg] || '#f59e0b';
          return (
            <div key="sticky" style={{ position: 'relative' }}>
              <button
                onClick={() => onToolChange('sticky')}
                onContextMenu={e => { e.preventDefault(); setPopup(p => p === 'sticky' ? null : 'sticky'); }}
                title="Sticky Note (S) · Right-click for colors"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 2, width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                  background: active ? `${accentColor}25` : 'transparent',
                  border: active ? `1px solid ${accentColor}88` : '1px solid transparent',
                  color: active ? accentColor : iconColor,
                  cursor: 'pointer', transition: 'all 0.13s', position: 'relative',
                }}
              >
                <FiFileText size={17} />
                <span style={{ fontSize: 9, fontFamily: 'Poppins', fontWeight: 700, letterSpacing: 0.5, opacity: 0.65 }}>S</span>
                {/* Color indicator dot */}
                <div
                  onClick={e => { e.stopPropagation(); setPopup(p => p === 'sticky' ? null : 'sticky'); }}
                  style={{
                    position: 'absolute', top: 3, right: 3,
                    width: 8, height: 8, borderRadius: '50%',
                    background: accentColor, border: '1.5px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                  }}
                />
              </button>
              {popup === 'sticky' && stickyPopup}
            </div>
          );
        }
        return <React.Fragment key={t.id}>{renderToolBtn(t)}</React.Fragment>;
      })}

      {renderDivider()}

      {/* Style controls */}
      {/* Stroke color */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setPopup(p => p === 'stroke' ? null : 'stroke')}
          title="Stroke Color"
          style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
            padding: 0,
          }}
        >
          <div style={{ width: 18, height: 18, borderRadius: 4, background: strokeColor, border: isDark ? '1.5px solid rgba(255,255,255,0.25)' : '1.5px solid rgba(0,0,0,0.25)' }} />
          <div style={{ width: 18, height: 2.5, background: strokeColor, borderRadius: 2 }} />
        </button>
        {popup === 'stroke' && strokePopup}
      </div>

      {/* Fill color */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setPopup(p => p === 'fill' ? null : 'fill')}
          title="Fill Color"
          style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: 4,
            background: fillColor === 'none' ? 'transparent' : fillColor,
            border: isDark ? '1.5px solid rgba(255,255,255,0.25)' : '1.5px solid rgba(0,0,0,0.25)',
            position: 'relative', overflow: 'hidden',
          }}>
            {fillColor === 'none' && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg,transparent 44%,rgba(239,68,68,0.9) 44%,rgba(239,68,68,0.9) 56%,transparent 56%)',
              }} />
            )}
          </div>
        </button>
        {popup === 'fill' && fillPopup}
      </div>

      {/* Stroke width */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setPopup(p => p === 'width' ? null : 'width')}
          title="Stroke Width / Font Size"
          style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
            padding: '0 6px',
          }}
        >
          {[1, 2, 3.5].map((h, i) => (
            <div key={i} style={{ width: 18, height: h, background: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)', borderRadius: 1 }} />
          ))}
        </button>
        {popup === 'width' && widthPopup}
      </div>

      {/* Selection actions */}
      {selectedId && (
        <>
          {renderDivider()}
          {renderIconBtn(onDuplicateSelected, 'Duplicate', false, <FiCopy size={14} />, undefined, 32)}
          {renderIconBtn(onDeleteSelected, 'Delete (Del)', false, <FiTrash2 size={14} />, '#f87171', 32)}
        </>
      )}

      {/* Clear canvas (when elements exist) */}
      {elementCount > 0 && (
        <>
          {renderDivider()}
          {renderIconBtn(
            () => { if (window.confirm('Clear the entire whiteboard?')) onClearCanvas(); },
            'Clear Canvas',
            false,
            <FiSlash size={13} />,
            'rgba(239,68,68,0.6)',
            30
          )}
        </>
      )}
    </div>
  );
};

// ─── Shared mini styles ──────────────────────────────────────────────────────
const zoomLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontFamily: 'Poppins, sans-serif', fontWeight: 700,
  minWidth: 36, textAlign: 'center', flexShrink: 0,
};
