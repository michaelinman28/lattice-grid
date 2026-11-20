/*
 * Lattice Grid — Figma design kit generator.
 *
 * Run this plugin once in a Figma design file (Plugins > Development > Lattice Grid kit).
 * Everything is built on the CURRENT page (so it works on the free Starter plan, which limits
 * files to 3 pages), arranged as six labelled sections:
 *   Cover · Tokens · Components · Simple grid · Complex grid · Overlays
 * Components are real Figma components with variant properties (Theme, Density, State, Align,
 * Sort, Filtered, Type…), so you can swap options from the right-hand panel.
 *
 * Original work, MIT License (same as Lattice Grid).
 */

/* ------------------------------------------------------------------ tokens */
const THEMES = {
  Light: {
    bg: '#ffffff', fg: '#1f2430', muted: '#6b7280', border: '#e3e6ea', borderStrong: '#cfd4da',
    headerBg: '#f5f7f9', headerFg: '#39404d', rowAlt: '#fafbfc', hover: '#eef4fd', selected: '#dbe8fd',
    groupBg: '#f2f4f7', accent: '#2563eb', accentFg: '#ffffff', inputBg: '#ffffff', popupBg: '#ffffff',
    page: '#eef1f5', upTint: ['#16a34a', 0.26], downTint: ['#dc2626', 0.24], rangeTint: ['#2563eb', 0.13],
    badge: {
      Delivered: ['#dcfce7', '#166534'], Shipped: ['#dbeafe', '#1e40af'], Processing: ['#fef9c3', '#854d0e'],
      Cancelled: ['#fee2e2', '#991b1b'], Returned: ['#ede9fe', '#5b21b6'],
    },
  },
  Dark: {
    bg: '#181b21', fg: '#e5e7eb', muted: '#9aa3b2', border: '#2b303a', borderStrong: '#3a414d',
    headerBg: '#20242c', headerFg: '#d3d8e0', rowAlt: '#1c1f26', hover: '#242b38', selected: '#1f3458',
    groupBg: '#222731', accent: '#5b8def', accentFg: '#0b1220', inputBg: '#12151a', popupBg: '#1f232b',
    page: '#0f1115', upTint: ['#22c55e', 0.3], downTint: ['#f87171', 0.3], rangeTint: ['#5b8def', 0.2],
    badge: {
      Delivered: ['#14532d', '#bbf7d0'], Shipped: ['#1e3a8a', '#bfdbfe'], Processing: ['#713f12', '#fef08a'],
      Cancelled: ['#7f1d1d', '#fecaca'], Returned: ['#4c1d95', '#ddd6fe'],
    },
  },
};
const DENSITY = { Comfortable: { row: 34, header: 38, filter: 34, font: 13 }, Compact: { row: 28, header: 32, filter: 30, font: 12 } };
const CHART = ['#4e79a7', '#f28e2b', '#59a14f', '#e15759', '#76b7b2', '#edc948'];

/* ------------------------------------------------------------------ helpers */
function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}
function mix(fgHex, alpha, bgHex) {
  const a = hex(fgHex), b = hex(bgHex);
  const c = (x, y) => Math.round((x * alpha + y * (1 - alpha)) * 255).toString(16).padStart(2, '0');
  return '#' + c(a.r, b.r) + c(a.g, b.g) + c(a.b, b.b);
}
function solid(h, opacity) { return [{ type: 'SOLID', color: hex(h), opacity: opacity == null ? 1 : opacity }]; }
const WEIGHTS = { 400: 'Regular', 500: 'Medium', 600: 'Semi Bold', 700: 'Bold' };

function text(chars, o) {
  o = o || {};
  const t = figma.createText();
  t.fontName = { family: 'Inter', style: WEIGHTS[o.weight || 400] };
  t.fontSize = o.size || 13;
  t.characters = chars == null ? '' : String(chars);
  t.fills = solid(o.color || '#000000');
  if (o.align) t.textAlignHorizontal = o.align;
  if (o.name) t.name = o.name;
  if (o.lineHeight) t.lineHeight = { value: o.lineHeight, unit: 'PIXELS' };
  return t;
}

/** Auto-layout frame. dir: 'HORIZONTAL' | 'VERTICAL'. */
function box(name, dir, o) {
  o = o || {};
  const f = o.component ? figma.createComponent() : figma.createFrame();
  f.name = name;
  f.layoutMode = dir;
  f.itemSpacing = o.gap || 0;
  f.paddingLeft = o.pl != null ? o.pl : o.px != null ? o.px : o.p || 0;
  f.paddingRight = o.pr != null ? o.pr : o.px != null ? o.px : o.p || 0;
  f.paddingTop = o.pt != null ? o.pt : o.py != null ? o.py : o.p || 0;
  f.paddingBottom = o.pb != null ? o.pb : o.py != null ? o.py : o.p || 0;
  f.counterAxisAlignItems = o.align || 'CENTER';
  f.primaryAxisAlignItems = o.justify || 'MIN';
  f.fills = o.fill ? solid(o.fill, o.fillOpacity) : [];
  if (o.radius) f.cornerRadius = o.radius;
  if (o.stroke) {
    f.strokes = solid(o.stroke);
    f.strokeAlign = 'INSIDE';
    f.strokeWeight = o.sw || 1;
    if (o.sides) {
      f.strokeTopWeight = o.sides.t || 0;
      f.strokeRightWeight = o.sides.r || 0;
      f.strokeBottomWeight = o.sides.b || 0;
      f.strokeLeftWeight = o.sides.l || 0;
    }
  }
  if (o.w || o.h) f.resize(o.w || 100, o.h || 100);
  f.primaryAxisSizingMode = (dir === 'HORIZONTAL' ? o.w : o.h) ? 'FIXED' : 'AUTO';
  f.counterAxisSizingMode = (dir === 'HORIZONTAL' ? o.h : o.w) ? 'FIXED' : 'AUTO';
  f.clipsContent = !!o.clip;
  if (o.shadow) {
    f.effects = [
      { type: 'DROP_SHADOW', color: { r: 0.06, g: 0.09, b: 0.16, a: 0.16 }, offset: { x: 0, y: 8 }, radius: 28, spread: 0, visible: true, blendMode: 'NORMAL' },
      { type: 'DROP_SHADOW', color: { r: 0.06, g: 0.09, b: 0.16, a: 0.1 }, offset: { x: 0, y: 1 }, radius: 3, spread: 0, visible: true, blendMode: 'NORMAL' },
    ];
  }
  return f;
}
function add(parent, child, sizing) {
  parent.appendChild(child);
  if (sizing) {
    try {
      if (sizing.h) child.layoutSizingHorizontal = sizing.h;
      if (sizing.v) child.layoutSizingVertical = sizing.v;
    } catch (e) { /* older Figma: ignore */ }
  }
  return child;
}
function fill(parent, child) { return add(parent, child, { h: 'FILL' }); }

/* ---- icons (drawn as vectors so they look identical everywhere) ---- */
function iconFrame(name, w, h) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.fills = [];
  f.clipsContent = false;
  return f;
}
function vec(parent, data, o) {
  const v = figma.createVector();
  v.vectorPaths = [{ windingRule: o.fill ? 'NONZERO' : 'NONE', data }];
  v.fills = o.fill ? solid(o.fill) : [];
  if (o.stroke) {
    v.strokes = solid(o.stroke);
    v.strokeWeight = o.sw || 1.5;
    v.strokeCap = 'ROUND';
    v.strokeJoin = 'ROUND';
  } else v.strokes = [];
  parent.appendChild(v);
  if (o.x != null) v.x = o.x;
  if (o.y != null) v.y = o.y;
  return v;
}
function icon(kind, color, size) {
  size = size || 12;
  const f = iconFrame('icon/' + kind, size, size);
  const s = size / 12;
  const P = (pts) => pts.map((p, i) => (i ? 'L ' : 'M ') + (p[0] * s).toFixed(2) + ' ' + (p[1] * s).toFixed(2)).join(' ');
  switch (kind) {
    case 'sort-asc': vec(f, P([[2, 8.5], [6, 3.5], [10, 8.5]]) + ' Z', { fill: color }); break;
    case 'sort-desc': vec(f, P([[2, 3.5], [6, 8.5], [10, 3.5]]) + ' Z', { fill: color }); break;
    case 'chevron-right': vec(f, P([[4.5, 2.5], [8, 6], [4.5, 9.5]]), { stroke: color, sw: 1.6 }); break;
    case 'chevron-down': vec(f, P([[2.5, 4.5], [6, 8], [9.5, 4.5]]), { stroke: color, sw: 1.6 }); break;
    case 'funnel': vec(f, P([[1, 2], [11, 2], [7, 6.5], [7, 10.5], [5, 9.5], [5, 6.5]]) + ' Z', { fill: color }); break;
    case 'check': vec(f, P([[2.5, 6.2], [5, 8.6], [9.6, 3.6]]), { stroke: color, sw: 1.8 }); break;
    case 'dash': vec(f, P([[3, 6], [9, 6]]), { stroke: color, sw: 1.8 }); break;
    case 'search': {
      const c = figma.createEllipse();
      c.resize(7 * s, 7 * s); c.x = 1.5 * s; c.y = 1.5 * s; c.fills = []; c.strokes = solid(color); c.strokeWeight = 1.4;
      f.appendChild(c);
      vec(f, P([[7.6, 7.6], [10.5, 10.5]]), { stroke: color, sw: 1.4 });
      break;
    }
    case 'kebab':
    case 'grip': {
      const pts = kind === 'kebab' ? [[6, 2.5], [6, 6], [6, 9.5]] : [[4.2, 2.2], [7.8, 2.2], [4.2, 6], [7.8, 6], [4.2, 9.8], [7.8, 9.8]];
      for (const [x, y] of pts) {
        const d = figma.createEllipse();
        d.resize(1.8 * s, 1.8 * s); d.x = x * s - 0.9 * s; d.y = y * s - 0.9 * s; d.fills = solid(color);
        f.appendChild(d);
      }
      break;
    }
    case 'calendar': {
      const r = figma.createRectangle();
      r.resize(9 * s, 8 * s); r.x = 1.5 * s; r.y = 2.5 * s; r.cornerRadius = 1.5; r.fills = []; r.strokes = solid(color); r.strokeWeight = 1.2;
      f.appendChild(r);
      vec(f, P([[1.5, 5], [10.5, 5]]), { stroke: color, sw: 1.2 });
      break;
    }
    case 'undo': vec(f, P([[4, 3], [1.8, 5.2], [4, 7.4]]) + ' M ' + (1.8 * s) + ' ' + (5.2 * s) + ' L ' + (7.5 * s) + ' ' + (5.2 * s) + ' C ' + (11 * s) + ' ' + (5.2 * s) + ' ' + (11 * s) + ' ' + (10 * s) + ' ' + (7.5 * s) + ' ' + (10 * s) + ' L ' + (5 * s) + ' ' + (10 * s), { stroke: color, sw: 1.4 }); break;
    case 'redo': vec(f, P([[8, 3], [10.2, 5.2], [8, 7.4]]) + ' M ' + (10.2 * s) + ' ' + (5.2 * s) + ' L ' + (4.5 * s) + ' ' + (5.2 * s) + ' C ' + (1 * s) + ' ' + (5.2 * s) + ' ' + (1 * s) + ' ' + (10 * s) + ' ' + (4.5 * s) + ' ' + (10 * s) + ' L ' + (7 * s) + ' ' + (10 * s), { stroke: color, sw: 1.4 }); break;
    case 'panels': vec(f, P([[1.5, 3], [10.5, 3]]) + ' ' + P([[1.5, 6], [10.5, 6]]) + ' ' + P([[1.5, 9], [10.5, 9]]), { stroke: color, sw: 1.4 }); break;
  }
  return f;
}
/** The round "clear" button: a centred cross in a circle. */
function clearButton(t) {
  const f = iconFrame('clear', 16, 16);
  const c = figma.createEllipse();
  c.resize(16, 16);
  c.fills = solid(t.muted, 0.65);
  f.appendChild(c);
  vec(f, 'M 5.2 5.2 L 10.8 10.8 M 10.8 5.2 L 5.2 10.8', { stroke: t.bg, sw: 1.6 });
  return f;
}
function stars(n, size) {
  const f = box('Rating', 'HORIZONTAL', { gap: 1 });
  for (let i = 0; i < 5; i++) {
    const s = figma.createStar();
    s.pointCount = 5;
    s.innerRadius = 0.45;
    s.resize(size || 12, size || 12);
    s.fills = solid(i < n ? '#f59e0b' : '#cbd5e1');
    f.appendChild(s);
  }
  return f;
}
function sparkline(values, color, w, h, area) {
  const f = iconFrame('Sparkline', w, h);
  const min = Math.min.apply(null, values), max = Math.max.apply(null, values), span = max - min || 1;
  const X = (i) => 2 + (i * (w - 4)) / (values.length - 1), Y = (v) => 2 + (h - 4) - ((v - min) / span) * (h - 4);
  const line = values.map((v, i) => (i ? 'L ' : 'M ') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
  if (area) {
    const a = vec(f, line + ' L ' + X(values.length - 1).toFixed(1) + ' ' + (h - 1) + ' L ' + X(0).toFixed(1) + ' ' + (h - 1) + ' Z', { fill: color });
    a.opacity = 0.18;
  }
  vec(f, line, { stroke: color, sw: 1.5 });
  return f;
}

/* ------------------------------------------------------------------ components */
const C = {}; // registry: C.cell['Light|Comfortable|Left|Default'] = component, etc.
function key() { return Array.prototype.join.call(arguments, '|'); }
function variants(page, name, comps, x, y, width) {
  const set = figma.combineAsVariants(comps, page);
  set.name = name;
  try {
    set.layoutMode = 'HORIZONTAL';
    set.layoutWrap = 'WRAP';
    set.itemSpacing = 16;
    set.counterAxisSpacing = 16;
    set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 24;
    set.resize(width || 1400, 100);
    set.primaryAxisSizingMode = 'FIXED';
    set.counterAxisSizingMode = 'AUTO';
  } catch (e) {
    // fallback: simple grid placement
    let cx = 24, cy = 24, rowH = 0;
    for (const c of set.children) {
      if (cx + c.width > (width || 1400)) { cx = 24; cy += rowH + 16; rowH = 0; }
      c.x = cx; c.y = cy; cx += c.width + 16; rowH = Math.max(rowH, c.height);
    }
  }
  set.x = x;
  set.y = y;
  return set;
}
function sectionTitle(page, label, sub, x, y) {
  const t = text(label, { size: 22, weight: 700, color: '#1f2430' });
  t.x = x; t.y = y;
  page.appendChild(t);
  if (sub) {
    const s = text(sub, { size: 13, color: '#6b7280' });
    s.x = x; s.y = y + 32;
    page.appendChild(s);
  }
}

const CELL_STATES = ['Default', 'Alt row', 'Hover', 'Selected', 'Group', 'Focused', 'In range', 'Editing', 'Flash up', 'Flash down'];
function cellFill(t, state) {
  switch (state) {
    case 'Alt row': return t.rowAlt;
    case 'Hover': return t.hover;
    case 'Selected': return t.selected;
    case 'Group': return t.groupBg;
    case 'In range': return mix(t.rangeTint[0], t.rangeTint[1], t.bg);
    case 'Editing': return t.inputBg;
    case 'Flash up': return mix(t.upTint[0], t.upTint[1], t.bg);
    case 'Flash down': return mix(t.downTint[0], t.downTint[1], t.bg);
    default: return t.bg;
  }
}

function buildCellComponents(page, y0) {
  C.cell = {};
  const comps = [];
  for (const theme of Object.keys(THEMES)) for (const dens of Object.keys(DENSITY)) for (const align of ['Left', 'Right']) for (const state of CELL_STATES) {
    const t = THEMES[theme], d = DENSITY[dens];
    const c = box('Theme=' + theme + ', Density=' + dens + ', Align=' + align + ', State=' + state, 'HORIZONTAL', {
      component: true, w: 140, h: d.row, px: 10, fill: cellFill(t, state), stroke: t.border, sides: { b: 1 },
      justify: align === 'Right' ? 'MAX' : 'MIN',
    });
    if (state === 'Focused' || state === 'Editing') {
      c.strokes = solid(t.accent);
      c.strokeTopWeight = c.strokeRightWeight = c.strokeBottomWeight = c.strokeLeftWeight = 2;
    }
    if (state === 'In range') {
      c.strokes = solid(t.accent);
      c.strokeTopWeight = c.strokeBottomWeight = 1;
      c.strokeLeftWeight = c.strokeRightWeight = 0;
    }
    const label = text(align === 'Right' ? '1,234.50' : 'Cell value', {
      name: 'Value', size: d.font, weight: state === 'Group' ? 600 : 400, color: t.fg, align: align === 'Right' ? 'RIGHT' : 'LEFT',
    });
    fill(c, label);
    try { label.textTruncation = 'ENDING'; label.maxLines = 1; } catch (e) { /* older API */ }
    comps.push(c);
    C.cell[key(theme, dens, align, state)] = c;
  }
  return variants(page, 'Cell', comps, 0, y0, 1560);
}

function buildHeaderComponents(page, y0) {
  C.header = {};
  const comps = [];
  for (const theme of Object.keys(THEMES)) for (const dens of Object.keys(DENSITY)) for (const align of ['Left', 'Right']) for (const sort of ['None', 'Ascending', 'Descending']) for (const filtered of ['No', 'Yes']) {
    const t = THEMES[theme], d = DENSITY[dens];
    const c = box('Theme=' + theme + ', Density=' + dens + ', Align=' + align + ', Sort=' + sort + ', Filtered=' + filtered, 'HORIZONTAL', {
      component: true, w: 140, h: d.header, pl: 10, pr: 6, gap: 4, fill: t.headerBg, stroke: t.border, sides: { r: 1, b: 1 },
    });
    const label = text('Header', { name: 'Label', size: d.font, weight: 600, color: t.headerFg, align: align === 'Right' ? 'RIGHT' : 'LEFT' });
    const parts = [];
    if (sort !== 'None') parts.push(icon(sort === 'Ascending' ? 'sort-asc' : 'sort-desc', t.accent, 10));
    if (filtered === 'Yes') parts.push(icon('funnel', t.accent, 11));
    const menu = icon('kebab', t.muted, 14);
    if (align === 'Right') { add(c, menu); parts.reverse().forEach((p) => add(c, p)); fill(c, label); }
    else { fill(c, label); parts.forEach((p) => add(c, p)); add(c, menu); }
    try { label.textTruncation = 'ENDING'; label.maxLines = 1; } catch (e) { /* ignore */ }
    comps.push(c);
    C.header[key(theme, dens, align, sort, filtered)] = c;
  }
  return variants(page, 'Header cell', comps, 0, y0, 1560);
}

function inputBox(t, d, o) {
  const f = box(o.name || 'Input', 'HORIZONTAL', { h: d.filter - 10, px: 6, gap: 4, fill: t.inputBg, stroke: o.focus ? t.accent : t.borderStrong, sw: o.focus ? 2 : 1, radius: 4 });
  const v = text(o.value || o.placeholder || '', { name: 'Value', size: d.font - 1, color: o.value ? t.fg : t.muted });
  fill(f, v);
  try { v.textTruncation = 'ENDING'; v.maxLines = 1; } catch (e) { /* ignore */ }
  if (o.calendar) add(f, icon('calendar', t.muted, 12));
  if (o.value && o.clear !== false) add(f, clearButton(t));
  return f;
}

function buildFilterComponents(page, y0) {
  C.filter = {};
  const comps = [];
  const SAMPLES = { Text: ['Filter…', 'engineer'], Number: ['e.g. >100, 5..10', '>150000'], Date: ['mm/dd/yyyy', '04/21/2021'], Set: ['All', '3 selected'], None: ['', ''] };
  for (const theme of Object.keys(THEMES)) for (const dens of Object.keys(DENSITY)) for (const type of ['Text', 'Number', 'Date', 'Set', 'None']) for (const state of ['Empty', 'Filled']) {
    if (type === 'None' && state === 'Filled') continue;
    const t = THEMES[theme], d = DENSITY[dens];
    const c = box('Theme=' + theme + ', Density=' + dens + ', Type=' + type + ', State=' + state, 'HORIZONTAL', {
      component: true, w: 140, h: d.filter, px: 5, fill: t.headerBg, stroke: t.border, sides: { r: 1, b: 1 },
    });
    if (type === 'Set') {
      const b = box('Set button', 'HORIZONTAL', { h: d.filter - 10, px: 6, fill: t.inputBg, stroke: t.borderStrong, radius: 4 });
      const v = text(SAMPLES.Set[state === 'Filled' ? 1 : 0], { name: 'Value', size: d.font - 1, color: t.fg });
      fill(b, v);
      fill(c, b);
    } else if (type !== 'None') {
      fill(c, inputBox(t, d, { value: state === 'Filled' ? SAMPLES[type][1] : '', placeholder: SAMPLES[type][0], calendar: type === 'Date' }));
    }
    comps.push(c);
    C.filter[key(theme, dens, type, state)] = c;
  }
  return variants(page, 'Header filter', comps, 0, y0, 1560);
}

function buildSmallComponents(page, y0) {
  C.handle = {}; C.check = {}; C.group = {}; C.button = {}; C.chip = {}; C.badge = {}; C.search = {};
  const handleComps = [], checkComps = [], groupComps = [], buttonComps = [], chipComps = [], badgeComps = [], searchComps = [];
  for (const theme of Object.keys(THEMES)) {
    const t = THEMES[theme];
    for (const dens of Object.keys(DENSITY)) {
      const d = DENSITY[dens];
      for (const state of ['Enabled', 'Disabled', 'Dragging']) {
        const c = box('Theme=' + theme + ', Density=' + dens + ', State=' + state, 'HORIZONTAL', {
          component: true, w: 34, h: d.row, justify: 'CENTER', fill: state === 'Dragging' ? t.hover : t.bg, stroke: t.border, sides: { b: 1 },
        });
        const g = add(c, icon('grip', state === 'Dragging' ? t.accent : t.muted, 14));
        if (state === 'Disabled') g.opacity = 0.3;
        handleComps.push(c);
        C.handle[key(theme, dens, state)] = c;
      }
      for (const checked of ['Off', 'On', 'Mixed']) {
        const c = box('Theme=' + theme + ', Density=' + dens + ', Checked=' + checked, 'HORIZONTAL', {
          component: true, w: 44, h: d.row, justify: 'CENTER', fill: t.bg, stroke: t.border, sides: { b: 1 },
        });
        const b = box('Checkbox', 'HORIZONTAL', { w: 15, h: 15, justify: 'CENTER', radius: 3, fill: checked === 'Off' ? t.inputBg : t.accent, stroke: checked === 'Off' ? t.borderStrong : t.accent });
        if (checked !== 'Off') add(b, icon(checked === 'On' ? 'check' : 'dash', t.accentFg, 12));
        add(c, b);
        checkComps.push(c);
        C.check[key(theme, dens, checked)] = c;
      }
      for (const expanded of ['No', 'Yes', 'Leaf']) {
        const c = box('Theme=' + theme + ', Density=' + dens + ', Expanded=' + expanded, 'HORIZONTAL', {
          component: true, w: 220, h: d.row, pl: 10, pr: 10, gap: 6, fill: expanded === 'Leaf' ? t.bg : t.groupBg, stroke: t.border, sides: { b: 1 },
        });
        if (expanded !== 'Leaf') {
          add(c, icon(expanded === 'Yes' ? 'chevron-down' : 'chevron-right', t.muted, 12));
          add(c, text('Group name', { name: 'Key', size: d.font, weight: 600, color: t.fg }));
          add(c, text('(1,234)', { name: 'Count', size: d.font, color: t.muted }));
        }
        groupComps.push(c);
        C.group[key(theme, dens, expanded)] = c;
      }
    }
    for (const kind of ['Default', 'Primary', 'Small']) {
      const c = box('Theme=' + theme + ', Kind=' + kind, 'HORIZONTAL', {
        component: true, h: kind === 'Small' ? 26 : 30, px: kind === 'Small' ? 8 : 10, gap: 6, radius: 5,
        fill: kind === 'Primary' ? t.accent : t.inputBg, stroke: kind === 'Primary' ? t.accent : t.borderStrong,
      });
      add(c, text('Button', { name: 'Label', size: 13, weight: 500, color: kind === 'Primary' ? t.accentFg : t.fg }));
      buttonComps.push(c);
      C.button[key(theme, kind)] = c;
    }
    {
      const c = box('Theme=' + theme, 'HORIZONTAL', { component: true, h: 26, pl: 10, pr: 6, gap: 6, radius: 13, fill: t.groupBg, stroke: t.borderStrong });
      add(c, text('Region', { name: 'Label', size: 13, weight: 500, color: t.fg }));
      add(c, clearButton(t));
      chipComps.push(c);
      C.chip[theme] = c;
    }
    for (const status of Object.keys(t.badge)) {
      const [bg, fg] = t.badge[status];
      const c = box('Theme=' + theme + ', Status=' + status, 'HORIZONTAL', { component: true, h: 20, px: 8, radius: 10, fill: bg });
      add(c, text(status, { name: 'Label', size: 12, weight: 600, color: fg }));
      badgeComps.push(c);
      C.badge[key(theme, status)] = c;
    }
    for (const state of ['Empty', 'Filled']) {
      const c = box('Theme=' + theme + ', State=' + state, 'HORIZONTAL', {
        component: true, w: 220, h: 30, px: 8, gap: 6, radius: 5, fill: t.inputBg, stroke: state === 'Filled' ? t.accent : t.borderStrong, sw: state === 'Filled' ? 2 : 1,
      });
      add(c, icon('search', t.muted, 12));
      const v = text(state === 'Filled' ? 'engineer' : 'Quick filter…', { name: 'Value', size: 13, color: state === 'Filled' ? t.fg : t.muted });
      fill(c, v);
      if (state === 'Filled') add(c, clearButton(t));
      searchComps.push(c);
      C.search[key(theme, state)] = c;
    }
  }
  let y = y0;
  const place = (name, comps, w) => { const s = variants(page, name, comps, 0, y, w); y += s.height + 48; return s; };
  place('Row drag handle', handleComps, 700);
  place('Row checkbox', checkComps, 700);
  place('Group cell', groupComps, 1560);
  place('Button', buttonComps, 700);
  place('Group chip', chipComps, 700);
  place('Status badge', badgeComps, 1100);
  place('Quick filter', searchComps, 700);
  return y;
}

/* ------------------------------------------------------------------ instances */
function setText(inst, name, value) {
  const n = inst.findOne((x) => x.type === 'TEXT' && x.name === name);
  if (n) n.characters = String(value);
  return inst;
}
function cellI(theme, dens, align, state, value, w) {
  const i = C.cell[key(theme, dens, align, state)].createInstance();
  setText(i, 'Value', value == null ? '' : value);
  i.resize(w, i.height);
  return i;
}
function headerI(theme, dens, align, label, w, sort, filtered) {
  const i = C.header[key(theme, dens, align, sort || 'None', filtered ? 'Yes' : 'No')].createInstance();
  setText(i, 'Label', label);
  i.resize(w, i.height);
  return i;
}
function filterI(theme, dens, type, value, w) {
  const i = C.filter[key(theme, dens, type, value ? 'Filled' : 'Empty')].createInstance();
  if (value) setText(i, 'Value', value);
  i.resize(w, i.height);
  return i;
}
function buttonI(theme, kind, label) { return setText(C.button[key(theme, kind)].createInstance(), 'Label', label); }

/** A cell that holds a custom element (badge, stars, sparkline) but looks like a Cell of the given state. */
function customCell(theme, dens, state, w, child, align) {
  const t = THEMES[theme], d = DENSITY[dens];
  const f = box('Cell (custom)', 'HORIZONTAL', { w, h: d.row, px: 10, fill: cellFill(t, state), stroke: t.border, sides: { b: 1 }, justify: align === 'Right' ? 'MAX' : 'MIN' });
  if (child) add(f, child);
  return f;
}

/* ------------------------------------------------------------------ grids */
function gridShell(name, theme, w) {
  const t = THEMES[theme];
  const root = box(name, 'VERTICAL', { w, fill: t.bg, stroke: t.borderStrong, radius: 8, clip: true, align: 'MIN' });
  return root;
}
function hrow(name, h, fillHex) {
  return box(name, 'HORIZONTAL', { h, fill: fillHex, align: 'MIN' });
}
function toolbar(theme, items) {
  const t = THEMES[theme];
  const bar = box('Toolbar', 'HORIZONTAL', { p: 8, gap: 6, fill: t.headerBg, stroke: t.border, sides: { b: 1 } });
  for (const it of items) add(bar, it);
  return bar;
}
function statusBar(theme, left, right) {
  const t = THEMES[theme];
  const bar = box('Status bar', 'HORIZONTAL', { h: 34, px: 10, gap: 14, fill: t.headerBg, stroke: t.border, sides: { t: 1 } });
  left.forEach((s) => add(bar, text(s, { size: 12, color: t.muted })));
  if (right && right.length) {
    const sp = box('spacer', 'HORIZONTAL', { h: 10 });
    fill(bar, sp);
    right.forEach((s) => add(bar, text(s, { size: 12, color: t.muted })));
  }
  return bar;
}

const TEAM = [
  ['Sven Nakamura', 'Finance', 'Controller', 'Tokyo', '2021-05-05', '$105,500', 4, 'Owns the customer onboarding checklist and keeps it current. Moving to the Berlin office in spring.'],
  ['Ada Hughes', 'Finance', 'Analyst', 'Tokyo', '2018-09-03', '$126,500', 4, 'Prefers async updates over meetings.'],
  ['Kira Singh', 'Design', 'Designer', 'Sydney', '2015-03-15', '$153,000', 5, 'Runs the internal knowledge-sharing sessions every other Thursday afternoon.'],
  ['Umar Evans', 'Support', 'Support Agent', 'Toronto', '2015-08-16', '$156,500', 2, 'On parental leave until the end of next month.'],
  ['Pri Nakamura', 'Engineering', 'Tech Lead', 'Berlin', '2015-04-11', '$130,000', 3, 'Mentors two new starters.'],
  ['Cleo Diaz', 'Finance', 'Controller', 'Remote', '2024-12-11', '$129,500', 1, 'Speaks German and Japanese.'],
  ['Nils Garcia', 'Sales', 'Account Exec', 'New York', '2021-04-21', '$94,500', 4, 'No notes yet.'],
  ['Elif Diaz', 'Finance', 'Controller', 'London', '2020-07-25', '$83,000', 2, 'Point of contact for vendor contracts.'],
  ['Dev Singh', 'Finance', 'Analyst', 'Sydney', '2021-04-03', '$142,500', 3, 'Certified in accessibility testing.'],
  ['Mina Jensen', 'Support', 'Support Agent', 'New York', '2018-11-02', '$64,500', 5, 'Part-time: Mondays to Wednesdays.'],
];

/**
 * Simple grid: drag handle, sortable/filterable columns, quick filter, optional wrap, paging.
 * opts: { theme, dens, wrap, filtered, paging, dragging }
 */
function buildSimpleGrid(o) {
  const theme = o.theme, dens = o.dens, t = THEMES[theme], d = DENSITY[dens];
  const cols = [
    ['Name', 180, 'Left', 'Text'], ['Department', 150, 'Left', 'Set'], ['Role', 160, 'Left', 'Text'], ['Location', 130, 'Left', 'Set'],
    ['Start date', 140, 'Left', 'Date'], ['Salary', 120, 'Right', 'Number'], ['Rating', 110, 'Right', 'Number'], ['Notes', 260, 'Left', 'Text'],
  ];
  const W = 34 + cols.reduce((s, c) => s + c[1], 0) + 2;
  const root = gridShell(o.name, theme, W);
  const q = C.search[key(theme, o.filtered ? 'Filled' : 'Empty')].createInstance();
  fill(root, toolbar(theme, [q]));
  // header
  const hr = hrow('Header row', d.header, t.headerBg);
  const corner = box('Drag column header', 'HORIZONTAL', { w: 34, h: d.header, justify: 'CENTER', fill: t.headerBg, stroke: t.border, sides: { r: 1, b: 1 } });
  add(corner, icon('grip', t.muted, 12)).opacity = o.filtered ? 0.3 : 1;
  add(hr, corner);
  cols.forEach(([h, w, align]) => add(hr, headerI(theme, dens, align, h, w,
    o.filtered && h === 'Salary' ? 'Descending' : 'None', o.filtered && (h === 'Department' || h === 'Salary'))));
  fill(root, hr);
  // floating filters
  const fr = hrow('Filter row', d.filter, t.headerBg);
  add(fr, box('spacer', 'HORIZONTAL', { w: 34, h: d.filter, fill: t.headerBg, stroke: t.border, sides: { r: 1, b: 1 } }));
  cols.forEach(([h, w, , type]) => {
    let v = '';
    if (o.filtered && h === 'Department') v = '4 selected';
    if (o.filtered && h === 'Salary') v = '>100000';
    add(fr, filterI(theme, dens, type, v, w));
  });
  fill(root, fr);
  // body
  const body = box('Body', 'VERTICAL', { align: 'MIN' });
  let rows = TEAM.slice();
  if (o.filtered) rows = rows.filter((r) => r[1] !== 'Engineering' && parseInt(r[5].replace(/\D/g, ''), 10) > 100000).sort((a, b) => parseInt(b[5].replace(/\D/g, ''), 10) - parseInt(a[5].replace(/\D/g, ''), 10));
  rows.forEach((r, ri) => {
    let state = ri % 2 ? 'Alt row' : 'Default';
    if (o.dragging && ri === 2) state = 'Hover';
    const wrapH = o.wrap ? (r[7].length > 70 ? d.row + 36 : r[7].length > 36 ? d.row + 18 : d.row) : d.row;
    const row = hrow('Row ' + (ri + 1), wrapH, null);
    const hd = C.handle[key(theme, dens, o.filtered ? 'Disabled' : o.dragging && ri === 2 ? 'Dragging' : 'Enabled')].createInstance();
    hd.resize(34, wrapH);
    add(row, hd);
    cols.forEach(([h, w, align], ci) => {
      let node;
      if (h === 'Rating') node = customCell(theme, dens, state, w, stars(r[6], 11), 'Right');
      else {
        node = cellI(theme, dens, align, ri === 1 && ci === 0 && !o.filtered ? 'Focused' : state, r[ci], w);
        if (h === 'Notes' && o.wrap) {
          const tn = node.findOne((x) => x.type === 'TEXT');
          try { tn.textTruncation = 'DISABLED'; tn.maxLines = null; } catch (e) { /* ignore */ }
          try { tn.lineHeight = { value: 18, unit: 'PIXELS' }; } catch (e) { /* ignore */ }
        }
      }
      node.resize(w, wrapH);
      add(row, node);
    });
    add(body, row);
    if (o.dragging && ri === 4) {
      const line = figma.createRectangle();
      line.name = 'Drop indicator';
      line.resize(W - 2, 2);
      line.fills = solid(t.accent);
      add(body, line);
    }
  });
  fill(root, body);
  if (o.paging) {
    const pager = box('Pager', 'HORIZONTAL', { h: 34, px: 10, gap: 8, justify: 'MAX', fill: t.headerBg, stroke: t.border, sides: { t: 1 } });
    [['Page size: 25', null], ['1–25 of 200', null]].forEach(([s]) => add(pager, text(s, { size: 12, color: t.muted })));
    ['«', '‹'].forEach((s) => add(pager, buttonI(theme, 'Small', s)));
    add(pager, text('Page 1 of 8', { size: 12, color: t.muted }));
    ['›', '»'].forEach((s) => add(pager, buttonI(theme, 'Small', s)));
    fill(root, pager);
  }
  fill(root, statusBar(theme, [o.filtered ? 'Rows: ' + rows.length + ' of 200' : 'Rows: 200']));
  if (o.dragging) {
    const ghost = box('Drag ghost', 'HORIZONTAL', { px: 10, py: 5, gap: 6, radius: 6, fill: t.popupBg, stroke: t.borderStrong, shadow: true });
    add(ghost, icon('check', '#16a34a', 12));
    add(ghost, text('Move Kira Singh', { size: 13, weight: 600, color: t.fg }));
    root.appendChild(ghost);
    try { ghost.layoutPositioning = 'ABSOLUTE'; ghost.x = 260; ghost.y = 250; } catch (e) { /* ignore */ }
  }
  return root;
}

const SALES = [
  ['#100001', 'Chile', 'Software', 'Cloud Backup', '2', '$126.11', '$252.22', '25.4%', [20, 34, 28, 40, 38, 52, 47, 60, 58, 66, 61, 72], 'Delivered'],
  ['#100002', 'Chile', 'Services', 'Onboarding', '3', '$811.71', '$2,435.13', '40.1%', [60, 52, 55, 48, 50, 44, 47, 39, 42, 36, 38, 30], 'Shipped'],
  ['#100030', 'Chile', 'Accessories', 'Laptop Bag', '18', '$77.02', '$1,386.36', '15.2%', [30, 32, 31, 35, 33, 37, 36, 40, 39, 41, 44, 43], 'Processing'],
  ['#100032', 'Brazil', 'Software', 'Cloud Backup', '23', '$110.08', '$2,531.84', '12.7%', [40, 45, 38, 50, 42, 55, 48, 58, 52, 61, 57, 66], 'Delivered'],
  ['#100033', 'Colombia', 'Software', 'Office Suite', '14', '$284.77', '$3,986.78', '40.3%', [55, 50, 58, 53, 60, 57, 63, 59, 66, 62, 69, 65], 'Cancelled'],
  ['#100038', 'Argentina', 'Software', 'Cloud Backup', '3', '$108.31', '$324.93', '17.8%', [22, 26, 24, 29, 27, 31, 30, 34, 33, 36, 35, 39], 'Returned'],
];
const GROUPS = [
  ['Middle East & Africa', '2,031', '20,980', '$470.12', '$9,768,312.40', '30.4%'],
  ['Asia Pacific', '1,985', '21,113', '$461.78', '$9,880,141.22', '30.1%'],
  ['North America', '1,955', '20,644', '$459.03', '$9,627,880.15', '29.9%'],
  ['Europe', '1,986', '20,849', '$466.90', '$9,818,603.18', '30.2%'],
];

/**
 * Complex grid: toolbar, group bar, column groups, row grouping with aggregates, range selection,
 * sparklines, badges, totals row, status bar with range stats, and side bar.
 * opts: { theme, dens, pivot, sideBar }
 */
function buildComplexGrid(o) {
  const theme = o.theme, dens = o.dens, t = THEMES[theme], d = DENSITY[dens];
  const sideW = o.sideBar ? 270 : 0;
  const cols = o.pivot
    ? [['Accessories', 'Qty (sum)', 110, 'Right'], ['Accessories', 'Revenue (sum)', 140, 'Right'], ['Hardware', 'Qty (sum)', 110, 'Right'], ['Hardware', 'Revenue (sum)', 150, 'Right'],
      ['Services', 'Qty (sum)', 110, 'Right'], ['Services', 'Revenue (sum)', 150, 'Right'], ['Totals', 'Qty (sum)', 110, 'Right'], ['Totals', 'Revenue (sum)', 160, 'Right']]
    : [[null, 'Order #', 96, 'Right'], ['Market', 'Country', 120, 'Left'], ['Product', 'Category', 116, 'Left'], ['Product', 'Product', 140, 'Left'],
      ['Figures', 'Qty', 76, 'Right'], ['Figures', 'Unit price', 104, 'Right'], ['Figures', 'Revenue', 124, 'Right'], ['Figures', 'Margin', 84, 'Right'],
      ['Figures', '12-wk trend', 120, 'Left'], ['Details', 'Status', 112, 'Left']];
  const fixedW = 34 + 44 + 220;
  const gridW = fixedW + cols.reduce((s, c) => s + c[2], 0);
  const W = gridW + sideW + 2;
  const root = gridShell(o.name, theme, W);

  // toolbar
  const tb = [C.search[key(theme, 'Empty')].createInstance()];
  const find = C.search[key(theme, 'Empty')].createInstance();
  setText(find, 'Value', 'Find (Ctrl+F)');
  find.resize(160, find.height);
  tb.push(find);
  const sp = box('spacer', 'HORIZONTAL', { h: 10 });
  const tbar = toolbar(theme, tb);
  fill(tbar, sp);
  const undo = C.button[key(theme, 'Default')].createInstance();
  setText(undo, 'Label', 'Undo');
  add(tbar, undo);
  ['Redo', 'Expand', 'Collapse', 'CSV', 'Excel', 'Panels'].forEach((l) => add(tbar, buttonI(theme, 'Default', l)));
  fill(root, tbar);

  // group bar
  const gp = box('Group bar', 'HORIZONTAL', { h: 40, px: 10, gap: 6, fill: t.bg, stroke: t.border, sides: { b: 1 } });
  add(gp, icon('panels', t.muted, 12));
  const chip = C.chip[theme].createInstance();
  setText(chip, 'Label', 'Region');
  add(gp, chip);
  if (o.pivot) add(gp, text('Pivot mode: Region × Category', { size: 12, color: t.muted }));
  fill(root, gp);

  // main = grid + side bar
  const main = box('Main', 'HORIZONTAL', { align: 'MIN' });
  const grid = box('Grid', 'VERTICAL', { align: 'MIN' });

  // column group header row
  const gh = hrow('Column groups', 30, t.headerBg);
  add(gh, box('blank', 'HORIZONTAL', { w: fixedW, h: 30, fill: t.headerBg, stroke: t.border, sides: { r: 1, b: 1 } }));
  let i = 0;
  while (i < cols.length) {
    let j = i, w = 0;
    while (j < cols.length && cols[j][0] === cols[i][0]) { w += cols[j][2]; j++; }
    const seg = box('Group: ' + (cols[i][0] || '—'), 'HORIZONTAL', { w, h: 30, justify: 'CENTER', fill: t.headerBg, stroke: t.border, sides: { r: 1, b: 1 } });
    add(seg, text(cols[i][0] || '', { size: 12, weight: 600, color: t.muted }));
    add(gh, seg);
    i = j;
  }
  fill(grid, gh);

  // header row
  const hr = hrow('Header row', d.header, t.headerBg);
  const hd0 = box('Drag', 'HORIZONTAL', { w: 34, h: d.header, justify: 'CENTER', fill: t.headerBg, stroke: t.border, sides: { r: 1, b: 1 } });
  add(hd0, icon('grip', t.muted, 12)).opacity = 0.3;
  add(hr, hd0);
  const hc = C.check[key(theme, dens, 'Off')].createInstance();
  hc.resize(44, d.header);
  add(hr, hc);
  add(hr, headerI(theme, dens, 'Left', 'Group', 220));
  cols.forEach(([, h, w, align]) => add(hr, headerI(theme, dens, align, h, w, !o.pivot && h === 'Revenue' ? 'Descending' : 'None', !o.pivot && h === 'Category')));
  fill(grid, hr);

  // floating filters
  if (!o.pivot) {
    const fr = hrow('Filter row', d.filter, t.headerBg);
    add(fr, box('blank', 'HORIZONTAL', { w: fixedW, h: d.filter, fill: t.headerBg, stroke: t.border, sides: { r: 1, b: 1 } }));
    cols.forEach(([, h, w, align]) => {
      const type = h === '12-wk trend' ? 'None' : align === 'Right' ? 'Number' : ['Country', 'Category', 'Status'].indexOf(h) >= 0 ? 'Set' : 'Text';
      add(fr, filterI(theme, dens, type, h === 'Category' ? '2 selected' : '', w));
    });
    fill(grid, fr);
  }

  // body
  const body = box('Body', 'VERTICAL', { align: 'MIN' });
  const groupRow = (g, expanded, aggs) => {
    const row = hrow('Group row: ' + g[0], d.row, null);
    const h = C.handle[key(theme, dens, 'Disabled')].createInstance();
    add(row, h);
    h.opacity = 1;
    const cb = C.check[key(theme, dens, 'Off')].createInstance();
    add(row, cb);
    const gc = C.group[key(theme, dens, expanded ? 'Yes' : 'No')].createInstance();
    setText(gc, 'Key', g[0]);
    setText(gc, 'Count', '(' + g[1] + ')');
    add(row, gc);
    cols.forEach(([, hName, w, align], ci) => add(row, cellI(theme, dens, align, 'Group', aggs[ci] || '', w)));
    add(body, row);
  };
  if (o.pivot) {
    const piv = [
      ['Latin America', '2,043', ['5,626', '$484,764.84', '5,250', '$3,255,399.27', '5,412', '$5,950,120.11', '21,947', '$10,108,890.73']],
      ['Middle East & Africa', '2,031', ['5,265', '$447,079.75', '4,980', '$3,606,479.40', '5,301', '$5,301,442.80', '20,980', '$9,768,312.40']],
      ['Asia Pacific', '1,985', ['5,853', '$487,436.46', '5,184', '$3,426,813.67', '5,050', '$5,500,410.09', '21,113', '$9,880,141.22']],
      ['North America', '1,955', ['4,990', '$421,168.98', '4,792', '$2,960,975.96', '5,610', '$5,690,735.21', '20,644', '$9,627,880.15']],
      ['Europe', '1,986', ['5,215', '$415,926.46', '5,108', '$3,428,246.43', '5,233', '$5,520,330.29', '20,849', '$9,818,603.18']],
    ];
    piv.forEach((p) => groupRow([p[0], p[1]], false, p[2]));
  } else {
    groupRow(['Latin America', '2,043'], true, ['', '', '', '', '21,947', '$448.36', '$10,108,890.73', '30.2%', '', '']);
    SALES.forEach((r, ri) => {
      const row = hrow('Row ' + r[0], d.row, null);
      const base = ri === 3 ? 'Selected' : ri % 2 ? 'Alt row' : 'Default';
      add(row, C.handle[key(theme, dens, 'Disabled')].createInstance());
      add(row, C.check[key(theme, dens, ri === 3 ? 'On' : 'Off')].createInstance());
      add(row, C.group[key(theme, dens, 'Leaf')].createInstance());
      cols.forEach(([, h, w, align], ci) => {
        const inRange = ri >= 1 && ri <= 3 && ci >= 4 && ci <= 6;
        let state = inRange ? 'In range' : base;
        if (ri === 1 && ci === 4) state = 'Focused';
        if (ri === 5 && ci === 5) state = 'Flash up';
        if (h === '12-wk trend') add(row, customCell(theme, dens, base, w, sparkline(r[8], t.accent, w - 22, d.row - 12, true)));
        else if (h === 'Status') {
          const b = C.badge[key(theme, r[9])].createInstance();
          add(row, customCell(theme, dens, base, w, b));
        } else add(row, cellI(theme, dens, align, state, r[ci], w));
      });
      add(body, row);
    });
    GROUPS.forEach((g) => groupRow(g, false, ['', '', '', '', g[2], g[3], g[4], g[5], '', '']));
  }
  fill(grid, body);

  // totals row
  const tot = hrow('Totals row', d.row, t.headerBg);
  const totLabel = box('Total', 'HORIZONTAL', { w: fixedW, h: d.row, pl: 88, fill: t.headerBg, stroke: t.borderStrong, sides: { t: 1 } });
  add(totLabel, text('Total', { size: d.font, weight: 700, color: t.fg }));
  add(tot, totLabel);
  const totals = o.pivot
    ? ['26,949', '$2,256,376.49', '25,314', '$16,677,914.73', '26,606', '$27,963,038.50', '105,533', '$49,203,827.68']
    : ['', '', '', '', '105,533', '$463.20', '$49,203,827.68', '30.2%', '', ''];
  cols.forEach(([, , w, align], ci) => {
    const c = box('Total cell', 'HORIZONTAL', { w, h: d.row, px: 10, fill: t.headerBg, stroke: t.borderStrong, sides: { t: 1 }, justify: align === 'Right' ? 'MAX' : 'MIN' });
    add(c, text(totals[ci], { size: d.font, weight: 700, color: t.fg }));
    add(tot, c);
  });
  fill(grid, tot);
  add(main, grid);

  if (o.sideBar) add(main, sideBar(theme, d, o.pivot));
  fill(root, main);
  fill(root, statusBar(theme, ['Rows: 10,000', 'Selected: 1', 'Groups: 5 top-level'],
    o.pivot ? [] : ['Count: 9', 'Sum: 9,410.10', 'Avg: 1,045.57', 'Min: 3', 'Max: 3,986.78']));
  return root;
}

function sideBar(theme, d, pivot) {
  const t = THEMES[theme];
  const sb = box('Side bar', 'VERTICAL', { w: 270, fill: t.bg, stroke: t.borderStrong, sides: { l: 1 }, align: 'MIN' });
  const tabs = box('Tabs', 'HORIZONTAL', { h: 34, fill: t.headerBg, stroke: t.border, sides: { b: 1 } });
  ['Columns', 'Filters'].forEach((l, i) => {
    const tab = box('Tab ' + l, 'HORIZONTAL', { h: 34, justify: 'CENTER', stroke: i === 0 ? t.accent : t.headerBg, sides: { b: 2 } });
    add(tab, text(l, { size: 13, weight: 600, color: i === 0 ? t.accent : t.muted }));
    fill(tabs, tab);
  });
  fill(sb, tabs);
  const inner = box('Content', 'VERTICAL', { p: 8, gap: 8, align: 'MIN' });
  const pm = box('Pivot mode', 'HORIZONTAL', { gap: 8 });
  const cb = box('Checkbox', 'HORIZONTAL', { w: 15, h: 15, justify: 'CENTER', radius: 3, fill: pivot ? t.accent : t.inputBg, stroke: pivot ? t.accent : t.borderStrong });
  if (pivot) add(cb, icon('check', t.accentFg, 12));
  add(pm, cb);
  add(pm, text('Pivot mode', { size: 13, color: t.fg }));
  add(inner, pm);
  const search = C.search[key(theme, 'Empty')].createInstance();
  setText(search, 'Value', 'Search columns…');
  fill(inner, search);
  const list = box('Column list', 'VERTICAL', { p: 4, gap: 0, radius: 6, stroke: t.border, align: 'MIN' });
  [['Order #', 'pin left'], ['Region', 'group'], ['Country', ''], ['Category', pivot ? 'pivot' : ''], ['Product', ''], ['Qty', 'sum'], ['Unit price', 'avg'], ['Revenue', 'sum'], ['Margin', 'avg']].forEach(([n, badge]) => {
    const it = box('Item ' + n, 'HORIZONTAL', { h: 26, px: 6, gap: 8 });
    const c = box('Checkbox', 'HORIZONTAL', { w: 15, h: 15, justify: 'CENTER', radius: 3, fill: t.accent, stroke: t.accent });
    add(c, icon('check', t.accentFg, 12));
    add(it, c);
    fill(it, text(n, { size: 13, color: t.fg }));
    if (badge) add(it, text(badge, { size: 10, color: t.muted }));
    fill(list, it);
  });
  fill(inner, list);
  const zone = (title, chips) => {
    const z = box('Zone ' + title, 'VERTICAL', { p: 6, gap: 4, radius: 6, stroke: t.borderStrong, align: 'MIN' });
    try { z.dashPattern = [4, 3]; } catch (e) { /* ignore */ }
    add(z, text(title.toUpperCase(), { size: 10, weight: 700, color: t.muted }));
    const items = box('Chips', 'HORIZONTAL', { gap: 4 });
    try { items.layoutWrap = 'WRAP'; } catch (e) { /* ignore */ }
    chips.forEach((c) => { const ch = C.chip[theme].createInstance(); setText(ch, 'Label', c); add(items, ch); });
    if (!chips.length) add(items, text('Drag columns here', { size: 12, color: t.muted }));
    add(z, items);
    fill(inner, z);
  };
  zone('Row groups', ['Region']);
  zone('Values', ['Qty · sum', 'Revenue · sum', 'Margin · avg']);
  if (pivot) zone('Column labels (pivot)', ['Category']);
  fill(sb, inner);
  return sb;
}

/* ------------------------------------------------------------------ overlays */
function menu(theme, items, w) {
  const t = THEMES[theme];
  const m = box('Menu', 'VERTICAL', { w: w || 230, p: 4, radius: 8, fill: t.popupBg, stroke: t.borderStrong, shadow: true, align: 'MIN' });
  items.forEach((it) => {
    if (it === '-') {
      const s = figma.createRectangle();
      s.name = 'Separator';
      s.resize(10, 1);
      s.fills = solid(t.border);
      fill(m, s);
      return;
    }
    const row = box('Item ' + it[0], 'HORIZONTAL', { h: 30, px: 8, gap: 8, radius: 5, fill: it[2] === 'hover' ? t.hover : null });
    const ic = box('Icon', 'HORIZONTAL', { w: 16, h: 16, justify: 'CENTER' });
    if (it[1] === 'check') add(ic, icon('check', t.fg, 12));
    else if (it[1] === 'funnel') add(ic, icon('funnel', t.muted, 11));
    else if (it[1] === 'asc') add(ic, icon('sort-asc', t.muted, 10));
    else if (it[1] === 'desc') add(ic, icon('sort-desc', t.muted, 10));
    add(row, ic);
    fill(row, text(it[0], { size: 13, color: it[2] === 'disabled' ? t.muted : t.fg }));
    if (it[3]) add(row, it[3] === '>' ? icon('chevron-right', t.muted, 10) : text(it[3], { size: 11, color: t.muted }));
    fill(m, row);
  });
  return m;
}
function filterPopup(theme, kind) {
  const t = THEMES[theme], d = DENSITY.Comfortable;
  const p = box('Filter popup (' + kind + ')', 'VERTICAL', { w: 250, p: 10, gap: 6, radius: 8, fill: t.popupBg, stroke: t.borderStrong, shadow: true, align: 'MIN' });
  add(p, text(kind === 'Set' ? 'Filter: Department' : 'Filter: Salary', { size: 13, weight: 700, color: t.fg }));
  if (kind === 'Set') {
    fill(p, inputBox(t, d, { placeholder: 'Search values…' }));
    const list = box('Values', 'VERTICAL', { p: 2, radius: 5, stroke: t.border, align: 'MIN' });
    [['(Select all)', null, 'Mixed'], ['Design', '38', 'On'], ['Engineering', '41', 'Off'], ['Finance', '44', 'On'], ['Sales', '39', 'On'], ['Support', '38', 'On']].forEach(([n, cnt, st]) => {
      const it = box('Value ' + n, 'HORIZONTAL', { h: 26, px: 8, gap: 8 });
      const c = box('Checkbox', 'HORIZONTAL', { w: 15, h: 15, justify: 'CENTER', radius: 3, fill: st === 'Off' ? t.inputBg : t.accent, stroke: st === 'Off' ? t.borderStrong : t.accent });
      if (st !== 'Off') add(c, icon(st === 'On' ? 'check' : 'dash', t.accentFg, 12));
      add(it, c);
      fill(it, text(n, { size: 13, color: t.fg }));
      if (cnt) add(it, text(cnt, { size: 11, color: t.muted }));
      fill(list, it);
    });
    fill(p, list);
  } else {
    const sel = box('Operator', 'HORIZONTAL', { h: 30, px: 8, radius: 5, fill: t.inputBg, stroke: t.borderStrong });
    fill(sel, text('Greater than', { size: 13, color: t.fg }));
    add(sel, icon('chevron-down', t.muted, 10));
    fill(p, sel);
    const inp = inputBox(t, { filter: 40, font: 14 }, { value: '100000', focus: true });
    fill(p, inp);
  }
  const actions = box('Actions', 'HORIZONTAL', { gap: 6, justify: 'MAX' });
  add(actions, buttonI(theme, 'Small', 'Clear'));
  add(actions, buttonI(theme, 'Small', 'Close'));
  fill(p, actions);
  return p;
}
function chartDialog(theme) {
  const t = THEMES[theme];
  const dlg = box('Chart dialog', 'VERTICAL', { w: 760, radius: 10, fill: t.popupBg, stroke: t.borderStrong, shadow: true, clip: true, align: 'MIN' });
  const head = box('Head', 'HORIZONTAL', { px: 12, py: 10, gap: 6, fill: t.headerBg, stroke: t.border, sides: { b: 1 } });
  fill(head, text('Qty, Unit price, Revenue', { size: 13, weight: 700, color: t.fg }));
  [['Bar', 'Primary'], ['Stacked', 'Small'], ['Line', 'Small'], ['Area', 'Small'], ['Pie', 'Small'], ['Download SVG', 'Small']].forEach(([l, k]) => add(head, buttonI(theme, k === 'Primary' ? 'Primary' : 'Small', l)));
  fill(dlg, head);
  const plot = iconFrame('Plot', 760, 380);
  plot.fills = solid(t.popupBg);
  const vals = [[0.02, 0.16, 0.08], [0.02, 0.2, 0.6], [0.04, 0.06, 0.35], [0.05, 0.08, 0.63], [0.03, 0.18, 0.98]];
  for (let g = 0; g <= 4; g++) {
    const y = 330 - g * 70;
    const ln = figma.createRectangle(); ln.resize(680, 1); ln.x = 60; ln.y = y; ln.fills = solid(t.border); plot.appendChild(ln);
    const lab = text(g + 'K', { size: 11, color: t.muted }); lab.x = 30; lab.y = y - 7; plot.appendChild(lab);
  }
  vals.forEach((grp, i) => {
    grp.forEach((v, si) => {
      const r = figma.createRectangle();
      const h = Math.max(2, v * 280);
      r.resize(30, h); r.x = 90 + i * 132 + si * 32; r.y = 330 - h; r.fills = solid(CHART[si]); r.cornerRadius = 2;
      plot.appendChild(r);
    });
    const lab = text('Row ' + (i + 1), { size: 11, color: t.muted }); lab.x = 110 + i * 132; lab.y = 340; plot.appendChild(lab);
  });
  ['Qty', 'Unit price', 'Revenue'].forEach((n, i) => {
    const sw = figma.createRectangle(); sw.resize(11, 11); sw.x = 60 + i * 110; sw.y = 12; sw.cornerRadius = 2; sw.fills = solid(CHART[i]); plot.appendChild(sw);
    const lab = text(n, { size: 12, color: t.fg }); lab.x = 76 + i * 110; lab.y = 9; plot.appendChild(lab);
  });
  fill(dlg, plot);
  return dlg;
}

/* ------------------------------------------------------------------ pages */
function framePage(page, frames, gap) {
  let x = 0, y = 0;
  frames.forEach((f) => {
    page.appendChild(f);
    f.x = x;
    f.y = y;
    y += f.height + (gap || 120);
  });
}
function labelled(theme, title, node) {
  const t = THEMES[theme];
  const wrap = box(title, 'VERTICAL', { p: 40, gap: 16, fill: t.page, radius: 16, align: 'MIN' });
  add(wrap, text(title, { size: 18, weight: 700, color: t.fg }));
  add(wrap, node);
  return wrap;
}

async function run() {
  await Promise.all([400, 500, 600, 700].map((w) => figma.loadFontAsync({ family: 'Inter', style: WEIGHTS[w] })));

  // One page, six sections (works on every Figma plan).
  const page = figma.currentPage;
  let startX = 0;
  for (const c of page.children) startX = Math.max(startX, c.x + c.width + 400); // don't cover existing work
  const pages = {};
  const pageNames = ['Cover', 'Tokens', 'Components', 'Simple grid', 'Complex grid', 'Overlays'];
  pageNames.forEach((n) => {
    let sec;
    try { sec = figma.createSection(); } catch (e) { sec = figma.createFrame(); sec.fills = solid('#f8fafc'); }
    sec.name = n;
    page.appendChild(sec);
    pages[n] = sec;
  });

  // Cover
  {
    const t = THEMES.Light;
    const cover = box('Cover', 'VERTICAL', { w: 1440, h: 900, p: 96, gap: 20, fill: '#0f172a', align: 'MIN', justify: 'CENTER' });
    add(cover, text('Lattice Grid', { size: 72, weight: 700, color: '#ffffff' }));
    add(cover, text('Design kit for the data grid: simple and complex layouts, light and dark, comfortable and compact.', { size: 22, color: '#cbd5e1' }));
    const opts = [
      'Components section: Cell, Header cell, Header filter, Row drag handle, Row checkbox, Group cell, Button, Group chip, Status badge, Quick filter',
      'Every component has variant properties: Theme (Light / Dark) and Density (Comfortable / Compact), plus State, Align, Sort, Filtered, Type…',
      'Simple grid section: default, sorted + filtered (row drag paused), dragging a row, wrapped text, paging, compact, dark',
      'Complex grid section: grouped with range selection, pivot mode, without side bar, compact, dark',
      'Overlays section: column menu, context menu with Chart submenu, text and set filter popups, chart dialog',
    ];
    opts.forEach((o) => add(cover, text('•  ' + o, { size: 16, color: '#94a3b8' })));
    add(cover, text('Generated by the Lattice Grid Figma plugin · github.com/michaelinman28/lattice-grid', { size: 14, color: t.accent }));
    pages.Cover.appendChild(cover);
  }

  // Tokens
  {
    const page = pages.Tokens;
    let x = 0;
    for (const theme of Object.keys(THEMES)) {
      const t = THEMES[theme];
      const col = box('Tokens / ' + theme, 'VERTICAL', { p: 32, gap: 10, fill: t.page, radius: 16, align: 'MIN' });
      add(col, text(theme + ' theme', { size: 20, weight: 700, color: t.fg }));
      const list = [['Background', t.bg], ['Text', t.fg], ['Muted text', t.muted], ['Border', t.border], ['Border strong', t.borderStrong], ['Header background', t.headerBg],
        ['Alternate row', t.rowAlt], ['Hover', t.hover], ['Selected row', t.selected], ['Group row', t.groupBg], ['Accent', t.accent], ['Range', cellFill(t, 'In range')],
        ['Flash up', cellFill(t, 'Flash up')], ['Flash down', cellFill(t, 'Flash down')], ['Popup', t.popupBg]];
      list.forEach(([n, h]) => {
        const r = box(n, 'HORIZONTAL', { gap: 12 });
        add(r, box('Swatch', 'HORIZONTAL', { w: 40, h: 28, radius: 6, fill: h, stroke: t.borderStrong }));
        add(r, text(n, { size: 13, weight: 600, color: t.fg }));
        add(r, text(h.toUpperCase(), { size: 12, color: t.muted }));
        add(col, r);
      });
      const fonts = box('Type', 'VERTICAL', { gap: 6, pt: 12, align: 'MIN' });
      add(fonts, text('Inter 13 Regular: cells', { size: 13, color: t.fg }));
      add(fonts, text('Inter 13 Semi Bold: headers and group rows', { size: 13, weight: 600, color: t.fg }));
      add(fonts, text('Inter 12 Regular: status bar, hints', { size: 12, color: t.muted }));
      add(col, fonts);
      page.appendChild(col);
      col.x = x;
      x += col.width + 80;
    }
  }

  // Components
  {
    const page = pages.Components;
    let y = 0;
    const section = (title, sub, build) => {
      sectionTitle(page, title, sub, 0, y);
      y += 72;
      const r = build(y);
      y = (typeof r === 'number' ? r : r.y + r.height) + 80;
    };
    section('Cell', 'Options: Theme · Density · Align · State (Default, Alt row, Hover, Selected, Group, Focused, In range, Editing, Flash up, Flash down)', (yy) => buildCellComponents(page, yy));
    section('Header cell', 'Options: Theme · Density · Align · Sort (None, Ascending, Descending) · Filtered', (yy) => buildHeaderComponents(page, yy));
    section('Header filter', 'Options: Theme · Density · Type (Text, Number, Date, Set, None) · State (Empty, Filled). Filled boxes show the round clear button', (yy) => buildFilterComponents(page, yy));
    section('Other parts', 'Row drag handle · Row checkbox · Group cell · Button · Group chip · Status badge · Quick filter', (yy) => buildSmallComponents(page, yy));
  }

  // Simple grid screens
  {
    const page = pages['Simple grid'];
    const frames = [
      ['Simple / Light / Comfortable', { theme: 'Light', dens: 'Comfortable' }],
      ['Simple / Light / Sorted + filtered (row drag paused)', { theme: 'Light', dens: 'Comfortable', filtered: true }],
      ['Simple / Light / Dragging a row', { theme: 'Light', dens: 'Comfortable', dragging: true }],
      ['Simple / Light / Wrap text on', { theme: 'Light', dens: 'Comfortable', wrap: true }],
      ['Simple / Light / Paging on', { theme: 'Light', dens: 'Comfortable', paging: true }],
      ['Simple / Light / Compact', { theme: 'Light', dens: 'Compact' }],
      ['Simple / Dark / Comfortable', { theme: 'Dark', dens: 'Comfortable' }],
      ['Simple / Dark / Sorted + filtered', { theme: 'Dark', dens: 'Comfortable', filtered: true }],
    ].map(([name, o]) => labelled(o.theme, name, buildSimpleGrid(Object.assign({ name: 'Lattice Grid (simple)' }, o))));
    framePage(page, frames, 100);
  }

  // Complex grid screens
  {
    const page = pages['Complex grid'];
    const frames = [
      ['Complex / Light / Grouped + range selection', { theme: 'Light', dens: 'Comfortable', sideBar: true }],
      ['Complex / Light / Pivot mode', { theme: 'Light', dens: 'Comfortable', sideBar: true, pivot: true }],
      ['Complex / Light / No side bar', { theme: 'Light', dens: 'Comfortable', sideBar: false }],
      ['Complex / Light / Compact', { theme: 'Light', dens: 'Compact', sideBar: true }],
      ['Complex / Dark / Grouped + range selection', { theme: 'Dark', dens: 'Comfortable', sideBar: true }],
      ['Complex / Dark / Pivot mode', { theme: 'Dark', dens: 'Comfortable', sideBar: true, pivot: true }],
    ].map(([name, o]) => labelled(o.theme, name, buildComplexGrid(Object.assign({ name: 'Lattice Grid (complex)' }, o))));
    framePage(page, frames, 100);
  }

  // Overlays
  {
    const page = pages.Overlays;
    let x = 0;
    for (const theme of Object.keys(THEMES)) {
      const t = THEMES[theme];
      const wrap = box('Overlays / ' + theme, 'HORIZONTAL', { p: 40, gap: 40, fill: t.page, radius: 16, align: 'MIN' });
      add(wrap, menu(theme, [['Sort ascending', 'asc'], ['Sort descending', 'desc'], ['Clear sort', '', 'disabled'], '-', ['Filter…', 'funnel', 'hover'],
        ['Pin column', '', '', '>'], ['Autosize this column'], ['Autosize all columns'], '-', ['Group by Category'], ['Aggregate (count)'], ['Hide column'], '-', ['Reset columns']]));
      const ctx = box('Context menu + submenu', 'HORIZONTAL', { gap: 0, align: 'MIN' });
      add(ctx, menu(theme, [['Copy', '', '', 'Ctrl+C'], ['Copy with headers'], ['Paste', '', '', 'Ctrl+V'], '-', ['Chart range', '', 'hover', '>'], '-',
        ['Toggle row selection'], ['Expand all'], ['Collapse all'], ['Autosize all columns'], '-', ['Undo', '', '', 'Ctrl+Z'], ['Redo', '', 'disabled', 'Ctrl+Y'], '-', ['Export', '', '', '>']]));
      const sub = menu(theme, [['Grouped bar', '', 'hover'], ['Stacked bar'], ['Line'], ['Area'], ['Pie']], 170);
      add(ctx, sub);
      add(wrap, ctx);
      add(wrap, filterPopup(theme, 'Number'));
      add(wrap, filterPopup(theme, 'Set'));
      add(wrap, chartDialog(theme));
      page.appendChild(wrap);
      wrap.y = x;
      x += wrap.height + 100;
    }
  }

  // Size each section around its content and stack them top to bottom.
  let y = 0;
  const PAD = 120;
  for (const n of pageNames) {
    const sec = pages[n];
    let w = 0, h = 0;
    for (const c of sec.children) {
      c.x += PAD;
      c.y += PAD;
      w = Math.max(w, c.x + c.width);
      h = Math.max(h, c.y + c.height);
    }
    if (sec.resizeWithoutConstraints) sec.resizeWithoutConstraints(w + PAD, h + PAD);
    else sec.resize(w + PAD, h + PAD);
    sec.x = startX;
    sec.y = y;
    y += h + PAD + 300;
  }
  figma.viewport.scrollAndZoomIntoView([pages.Cover]);
  figma.closePlugin('Lattice Grid kit created on this page: 6 sections, ' + Object.keys(C).length + ' component groups.');
}

run().catch((err) => {
  console.error(err);
  figma.closePlugin('Lattice Grid kit failed: ' + (err && err.message ? err.message : err));
});
