# Lattice Grid

A data grid for the browser, written from scratch in plain JavaScript. There are no dependencies and no build
step: one `.js` file, one `.css` file.

**Live demo:** https://michaelinman28.github.io/lattice-grid/ (or run it locally, see [Run the demo](#run-the-demo)).

**Every feature is optional.** You turn features on or off with options, either for the whole grid or per
column. The smallest setup is a plain, read-only, sortable table. The largest has grouping, pivoting, charts,
Excel export and tool panels. See [Choosing your features](#choosing-your-features).

---

## Contents

1. [Quick start](#quick-start)
2. [Choosing your features](#choosing-your-features)
3. [Recipes](#recipes)
4. [Defining columns](#defining-columns)
5. [Grid options reference](#grid-options-reference)
6. [Feature guides](#feature-guides)
7. [Working with the grid from code (API)](#working-with-the-grid-from-code-api)
8. [Events](#events)
9. [Theming](#theming)
10. [Keyboard shortcuts](#keyboard-shortcuts)
11. [Run the demo](#run-the-demo)
12. [Browser support and limits](#browser-support-and-limits)

---

## Quick start

**1. Add the files.** Copy `lattice-grid.js` and `lattice-grid.css` into your project, or reference them from
GitHub Pages.

```html
<link rel="stylesheet" href="lattice-grid.css">
<script src="lattice-grid.js"></script>
```

**2. Add a container with a height.** The grid fills its container, so the container must have a height.

```html
<div id="myGrid" style="height: 500px"></div>
```

**3. Create the grid.**

```html
<script>
  const grid = new LatticeGrid('#myGrid', {
    columns: [
      { field: 'name', header: 'Name' },
      { field: 'city', header: 'City' },
      { field: 'age',  header: 'Age', type: 'number' },
    ],
    rows: [
      { name: 'Ada',   city: 'London',   age: 36 },
      { name: 'Grace', city: 'New York', age: 45 },
      { name: 'Linus', city: 'Helsinki', age: 28 },
    ],
  });
</script>
```

The first argument is a CSS selector or a DOM element. The second is the options object. The script defines a
global `LatticeGrid` class.

---

## Choosing your features

Features fall into three groups.

**On by default.** Switch them off with `false` if you don't want them.

| Option | What it does |
|---|---|
| `toolbar` | Top bar with quick filter, find, undo/redo, expand/collapse and export buttons |
| `groupPanel` | "Drag a column here to group" bar |
| `floatingFilters` | Filter inputs under each column header |
| `statusBar` | Bottom bar with row counts and sum/avg/min/max of selected cells |
| `rangeSelection` | Drag or Shift+click to select a block of cells (when off, only one cell is focused) |
| `fillHandle` | Small square on a selected range that you drag to copy or extend values |
| `contextMenu` | Right-click menu (copy, paste, charts, export…). When off, the browser's own menu shows |
| `columnMenu` | ⋮ button on each column header (sort, pin, filter, group, hide, autosize) |
| `columnMove` | Drag column headers to reorder them or drop them on the group bar |
| `flashChanges` | Briefly highlight cells whose values change |

Sorting, filtering and resizing are on for every column. Switch them off per column with
`sortable: false`, `filter: false` and `resizable: false`.

**Off by default.** Switch them on when you need them.

| Option | What it does |
|---|---|
| `selection: 'single'` or `'multiple'` | Checkbox column for selecting rows |
| `rowReorder: true` | Drag handles to reorder rows |
| `sideBar: true` or `'open'` | Side panel for showing/hiding columns, grouping, pivoting and filters |
| `totalsRow: true` | Totals row pinned to the bottom |
| `pagination: true` | Page through rows instead of scrolling. Can also be switched on and off at any time with `setPagination()` |
| `groupBy: [...]` | Group rows by one or more columns |
| `pivotMode: true` | Pivot table (with `pivotBy` and aggregated columns) |
| `treeData: true` | Show a hierarchy (with `getTreePath`) |
| `masterDetail: true` | Expandable detail panel under each row (with `detailRenderer`) |
| `readOnly: true` | Turns off all editing, even for columns marked `editable` |

**Per column.** These are set in each column definition. See [Defining columns](#defining-columns).
They include `editable`, `filter`, `aggregate`, `sparkline`, `pinned`, `render`, `format` and `validate`.

---

## Recipes

### A plain, read-only table

```js
new LatticeGrid('#grid', {
  columns, rows,
  toolbar: false, groupPanel: false, floatingFilters: false, statusBar: false,
  rangeSelection: false, fillHandle: false, contextMenu: false, columnMenu: false, columnMove: false,
  readOnly: true,
});
```

Columns can still be sorted by clicking the header. Add `sortable: false` to a column to stop that.

### An editable list, like a spreadsheet

```js
new LatticeGrid('#grid', {
  rowId: (row) => row.id,
  groupPanel: false,
  columns: [
    { field: 'task',  header: 'Task',  flex: 1, editable: true },
    { field: 'owner', header: 'Owner', editable: true, editor: 'select', editorOptions: ['Ann', 'Ben', 'Cy'] },
    { field: 'due',   header: 'Due',   type: 'date', editable: true },
    { field: 'hours', header: 'Hours', type: 'number', editable: true,
      validate: (v) => v >= 0 || 'Hours cannot be negative' },
    { field: 'done',  header: 'Done',  type: 'boolean', editable: true },
  ],
  rows: tasks,
  rowReorder: true,
});
```

### A report with grouping and totals

```js
new LatticeGrid('#grid', {
  columns: [
    { field: 'region',  header: 'Region',  filter: 'set' },
    { field: 'product', header: 'Product', filter: 'set' },
    { field: 'units',   header: 'Units',   type: 'number', aggregate: 'sum' },
    { field: 'price',   header: 'Price',   type: 'number', aggregate: 'avg', format: (v) => v == null ? '' : '$' + v.toFixed(2) },
  ],
  rows: sales,
  groupBy: ['region'],
  groupDefaultExpanded: 0,      // 0 = collapsed, 1 = first level open, -1 = everything open
  totalsRow: true,
  sideBar: 'open',
});
```

### Everything on (like the demo)

See `index.html`, which uses grouping, pivot presets, editing, sparklines, reordering, the side bar, totals,
live updates and saving the layout.

---

## Defining columns

Each entry in `columns` is either a column, or a **column group** with a `header` and `children`:

```js
columns: [
  { field: 'id', header: 'ID', type: 'number', pinned: 'left', width: 90 },
  { header: 'Customer', children: [            // shows "Customer" above both columns
    { field: 'name', header: 'Name' },
    { field: 'address.city', header: 'City' }, // dot paths read nested values
  ] },
]
```

### Column options

| Option | Default | Description |
|---|---|---|
| `field` | – | Property to read from each row. Dot paths like `'address.city'` work |
| `id` | `field` | Unique column id. Needed when there is no `field` (for example, computed columns) |
| `header` | `field` | Header text |
| `type` | `'text'` | `'text'`, `'number'`, `'date'` (ISO `YYYY-MM-DD` strings or `Date`) or `'boolean'`. Sets alignment, default filter, editor and sorting |
| `width` / `minWidth` | `150` / `48` | Width in pixels |
| `flex` | `0` | Share of the leftover width (like CSS flex). Overrides `width` |
| `pinned` | `null` | `'left'` or `'right'` to keep the column visible while scrolling sideways |
| `hidden` | `false` | Start hidden. Users can show it again from the side bar |
| `sortable` | `true` | Allow sorting by clicking the header |
| `sort` | – | Initial sort: `'asc'` or `'desc'` |
| `comparator(a, b)` | – | Custom sort function |
| `resizable` | `true` | Allow drag-resizing |
| `filter` | by type | `'text'`, `'number'`, `'date'`, `'set'` (checkbox list) or `false` |
| `editable` | `false` | `true`, or `(row) => boolean` |
| `editor` | by type | `'text'`, `'number'`, `'date'`, `'select'`, `'checkbox'` or `'textarea'` |
| `editorOptions` | – | Choices for `editor: 'select'` (array, or `(row) => array`) |
| `validate(value, row)` | – | Return `true` to accept, or a message string to reject |
| `parse(text)` | – | Convert typed or pasted text to a value |
| `getValue(row)` | – | Compute a value instead of reading `field` (for example, `row.qty * row.price`) |
| `setValue(row, value)` | – | Custom write-back when editing a computed column |
| `format(value, row)` | – | Display text (for example, currency). `row` is `null` on group and total rows |
| `render({ value, data, text })` | – | Return a DOM node or an HTML string for custom cells. **Escape untrusted text** |
| `cellClass` | – | CSS class string, or `({ value, data }) => string` |
| `tooltip` | – | `true` to show the cell text on hover, or `(value, row) => string` |
| `headerTooltip` | – | Tooltip for the header |
| `aggregate` | – | `'sum'`, `'avg'`, `'min'`, `'max'`, `'count'`, `'first'`, `'last'` or `(values) => result`. Used by group rows, totals and pivot |
| `groupable` / `pivotable` | `true` | Allow this column to be used for grouping / pivoting |
| `groupIndex` / `pivotIndex` | – | Group or pivot by this column at start-up (0 = first level) |
| `sparkline` | – | `{ type: 'line' \| 'area' \| 'bar', color }` for cells whose value is an array of numbers |
| `exportFormatted` | `false` | Export the formatted text instead of the raw value |

---

## Grid options reference

| Option | Default | Description |
|---|---|---|
| `columns` | `[]` | Column definitions |
| `rows` | `[]` | Array of row objects |
| `rowId(row)` | – | Returns a unique id per row. Needed for `updateRows` and recommended in general |
| `theme` | `'light'` | `'light'` or `'dark'` |
| `rowHeight` / `headerHeight` | `34` / `38` | Pixels |
| `emptyMessage` | `'No rows to show'` | Shown when there are no rows |
| **Interface** | | |
| `toolbar` | `true` | Top toolbar |
| `groupPanel` | `true` | Group-by drop bar |
| `floatingFilters` | `true` | Filter inputs under the headers |
| `statusBar` | `true` | Bottom status bar |
| `sideBar` | `false` | `true` = available but closed, `'open'` = open at start |
| `contextMenu` | `true` | Right-click menu |
| `contextMenuItems(items, ctx)` | – | Change the right-click menu: return a new array of items |
| `columnMenu` | `true` | ⋮ header menu |
| `columnMove` | `true` | Drag headers to reorder or group |
| **Selection and editing** | | |
| `selection` | `null` | `'single'` or `'multiple'` row selection with checkboxes |
| `rowClickSelection` | `false` | Clicking a row also selects it |
| `rangeSelection` | `true` | Multi-cell range selection |
| `fillHandle` | `true` | Drag-to-fill handle |
| `readOnly` | `false` | Turns off all editing |
| `flashChanges` | `true` | Highlight changed cells |
| `rowReorder` | `false` | Row drag handles. See [Row reordering](#row-reordering) |
| **Data shaping** | | |
| `groupBy` | `[]` | Column ids to group by, in order |
| `groupDefaultExpanded` | `0` | Levels open at start (`-1` = all) |
| `hideGroupedColumns` | `true` | Hide a column while rows are grouped by it |
| `groupColumnHeader` / `groupColumnWidth` | `'Group'` / `240` | The automatic group column |
| `pivotMode` / `pivotBy` | `false` / `[]` | Pivot table. See [Pivoting](#pivoting) |
| `treeData` / `getTreePath(row)` | `false` / – | Hierarchy. See [Tree data](#tree-data) |
| `treeColumnHeader` | `'Hierarchy'` | Header of the tree column |
| `masterDetail` / `detailRenderer` / `detailHeight` | `false` / – / `280` | See [Master / detail](#master--detail) |
| `totalsRow` | `false` | Pinned totals row |
| `pagination` / `pageSize` | `false` / `100` | Paging. See [Paging](#paging) |
| `externalFilter(row)` | – | Your own filter function: return `false` to hide a row |
| `rowClass(row)` | – | Extra CSS class for a row |
| `exportFileName` | `'export'` | File name for CSV/Excel downloads |

---

## Feature guides

### Sorting

Click a header to sort ascending, then descending, then off. Shift+click (or Ctrl+click) adds more columns to
the sort. From code: `grid.setSort([{ id: 'age', dir: 'desc' }, { id: 'name', dir: 'asc' }])`.

### Filtering

- **Column filters.** Open from the funnel in the column menu, or from the Filters tab of the side bar.
  - *Text:* contains, equals, starts with, and so on.
  - *Number:* =, ≠, >, ≥, <, ≤, between, blank.
  - *Date:* on, before, after, between.
  - *Set:* a checkbox list of every value, with search.
- **Floating filters.** Type straight under the header. Number columns accept `>100`, `<=5`, `!=0` and `10..20`.
- **Quick filter.** The toolbar search box matches across all columns. From code: `grid.setQuickFilter('text')`.
- **From code:** `grid.setFilter('age', { type: 'number', op: 'gt', value: 30 })`,
  `grid.setFilter('city', { type: 'set', values: ['London', 'Paris'] })` or `grid.clearFilters()`.

### Find

Type in the toolbar **Find** box, or press Ctrl+F, to highlight matching cells without hiding any rows.
Enter goes to the next match and Shift+Enter to the previous one.

### Editing

Set `editable: true` on a column. Then double-click a cell, press Enter or F2, or just start typing. Enter
saves and moves down, Tab saves and moves right, and Esc cancels. If `validate` returns a message, the
editor stays open and shows it. Every change fires `cellValueChanged` and can be undone with Ctrl+Z.

### Range selection, copy, paste and fill

- Drag across cells, or Shift+click, or Shift+arrows, to select a range. The status bar shows its
  count, sum, average, min and max.
- Ctrl+C copies the range as tab-separated text, which pastes straight into Excel or Google Sheets.
- Ctrl+V pastes into editable cells. A single copied value fills the whole selected range.
- Drag the small square at the bottom-right of a range down to fill. Two or more numbers continue as a
  series (1, 2 → 3, 4, 5). Other values repeat.

### Row selection

`selection: 'multiple'` adds a checkbox column with a select-all box, which selects all rows that pass the
current filters. Shift+click selects a run of rows, and Space toggles the focused row. Read the result with
`grid.getSelectedRows()`.

### Row reordering

`rowReorder: true` adds a ⠿ handle column.

- Drag a handle to move a row. A blue line shows where it will land, and Esc cancels.
- If you drag a selected row, all selected rows move together.
- Alt+↑ / Alt+↓ moves the focused (or selected) rows from the keyboard.
- Ctrl+Z undoes a move. The `rowsReordered` event fires, and your original `rows` array is updated to the
  new order.
- Reordering is **paused** while a sort, filter, quick filter, grouping, pivot, tree data or pagination is
  active, because the visible order is then not the real row order. The handles turn grey and their
  tooltip says what to clear. This matches how AG Grid's managed row dragging behaves.
- From code: `grid.moveRows(['id1', 'id2'], 0)` moves those rows to the top. `grid.canReorderRows()` tells
  you whether reordering is currently allowed.

### Grouping and aggregation

- Start grouped with `groupBy: ['region', 'country']`.
- Users can drag a header into the group bar, use the column menu, or use the side bar's **Row groups** zone.
  Removing a group chip ungroups.
- Columns with `aggregate` show their summary on each group row and in the totals row. Users can change the
  function (sum, avg…) in the side bar's **Values** zone.

### Pivoting

Turn on **Pivot mode** in the side bar, or set `pivotMode: true`. Choose **row groups** (`groupBy`),
**column labels** (`pivotBy`) and **values** (columns with `aggregate`). The grid creates one column for each
column label × value, plus totals.

```js
{ groupBy: ['region'], pivotMode: true, pivotBy: ['category'] }   // plus aggregate on numeric columns
```

### Tree data

Use this for data that is already a hierarchy, such as an org chart or folders. Give each row a path:

```js
{
  treeData: true,
  getTreePath: (row) => row.path,     // e.g. ['CEO name', 'VP name', 'Employee name']
  groupDefaultExpanded: 1,
  columns: [ /* ... */ { field: 'salary', type: 'number', aggregate: 'sum' } ],
}
```

Parent rows show their own values. Columns with `aggregate` roll up the parent plus everyone under it.

### Master / detail

Rows get a ▶ that opens a full-width panel. You decide what goes in it:

```js
{
  masterDetail: true,
  detailHeight: 300,
  detailRenderer: ({ data, container, theme }) => {
    // put anything in `container`, even another grid
    const host = document.createElement('div');
    host.style.height = '100%';
    container.appendChild(host);
    new LatticeGrid(host, { columns: orderColumns, rows: data.orders, toolbar: false, groupPanel: false, theme });
  },
}
```

### Sparklines

For a column whose value is an array of numbers, add `sparkline: { type: 'line' }`. Other types are `'area'`
and `'bar'`, and you can set `color`.

### Charts

Select a range that includes numbers, right-click and choose **Chart range**. You get bar, stacked, line,
area and pie charts in a dialog, with **Download SVG**. From code: `grid.chartRange('line')` charts the
current selection.

### Export

The toolbar **CSV** and **Excel** buttons, or `grid.exportCsv()` and `grid.exportExcel()`, export what's
showing: current filters, sort and grouping. Excel files are real `.xlsx` with a bold header, a frozen top
row and autofilter. `grid.getCsv()` and `grid.getExcelBlob()` return the data instead of downloading it.

### Paging

Start with paging on using `pagination: true` (and optionally `pageSize`, default 100). You can also switch
it at any time without rebuilding the grid:

```js
grid.setPagination(true, 25);   // turn paging on, 25 rows per page
grid.setPageSize(50);           // change page size (goes back to page 1)
grid.setPage(2);                // jump to the third page (pages count from 0)
grid.setPagination(false);      // back to one scrolling list
grid.getPaginationInfo();       // { enabled, page, pageSize, pageCount, rowCount }
```

When paging is on, a pager bar appears above the status bar, with page size, first, previous, next and
last. Sorting, filtering and grouping still apply to all rows; paging just splits the result. Grouped
rows are paged as they are displayed. Row reordering pauses while paging is on.
The `paginationChanged` event fires whenever paging is switched or the page changes, and the paging
choice is included in `getState()` / `setState()`.

### Saving and restoring the layout

```js
const state = grid.getState();                        // columns, widths, order, sort, filters, grouping, pivot, paging
localStorage.setItem('myGrid', JSON.stringify(state));
grid.setState(JSON.parse(localStorage.getItem('myGrid')));
```

### Live data

With `rowId` set, `grid.updateRows([{ id: 7, price: 12.5 }])` merges the changes in place. Changed cells
flash green (up) or red (down), and totals update. Use `addRows`, `removeRows` or `setRows` for bigger
changes.

---

## Working with the grid from code (API)

| Area | Methods |
|---|---|
| Data | `setRows(rows)`, `getRows()`, `addRows(rows)`, `removeRows(ids \| fn)`, `updateRows(partials)`, `refresh()` |
| Sort / filter | `setSort(list)`, `setFilter(colId, model)`, `getFilterModel()`, `setFilterModel(model)`, `clearFilters()`, `setQuickFilter(text)` |
| Find | `setFind(text)`, `findNext(1 \| -1)` |
| Grouping / pivot | `groupBy(ids)`, `pivotBy(ids)`, `setPivotMode(bool)`, `setAggregate(colId, fn)`, `expandAll()`, `collapseAll()`, `toggleExpand(node)`, `toggleDetail(node)` |
| Selection | `selectAll()`, `deselectAll()`, `getSelectedRows()` |
| Rows | `moveRows(ids, toIndex)`, `canReorderRows()`, `getReorderBlockReason()` |
| Paging | `setPagination(on, pageSize)`, `setPageSize(n)`, `setPage(n)`, `getPaginationInfo()` |
| Columns | `moveColumn(id, targetId, after)`, `setColumnVisible(id, bool)`, `pinColumn(id, 'left' \| 'right' \| null)`, `autoSizeColumn(id)`, `autoSizeAll()`, `resetColumns()` |
| Editing | `startEdit(rowIndex, colIndex)`, `stopEdit(commit)`, `undo()`, `redo()` |
| Clipboard / charts | `copyRange(withHeaders)`, `pasteFromClipboard()`, `chartRange(type)` |
| Export | `exportCsv(name)`, `getCsv()`, `exportExcel(name)`, `getExcelBlob()` |
| State / misc | `getState()`, `setState(state)`, `setTheme('light' \| 'dark')`, `toggleSideBar()`, `ensureVisible(rowIndex, colIndex)`, `destroy()` |

---

## Events

```js
grid.on('cellValueChanged', (e) => console.log(e.column, e.oldValue, '→', e.newValue, e.data));
grid.off('cellValueChanged', handler);
```

| Event | Payload |
|---|---|
| `cellValueChanged` | `{ data, column, oldValue, newValue }` |
| `selectionChanged` | array of selected row objects |
| `sortChanged` | `[{ id, dir }]` |
| `filterChanged` | filter model object |
| `rangeChanged` | `{ r1, r2, c1, c2 }` |
| `rowsReordered` | `{ ids, toIndex, rows }` |
| `paginationChanged` | `{ enabled, page, pageSize, pageCount, rowCount }` |
| `columnMoved` | `{ column }` |
| `columnResized` | `{ column, width }` |

---

## Theming

Use `theme: 'dark'` or `grid.setTheme('dark')`. Colours are CSS variables, so you can restyle the grid
without editing the library:

```css
.lg-theme-light {
  --lg-accent: #0f766e;        /* selection, focus, sort arrows */
  --lg-header-bg: #f0fdfa;
  --lg-row-alt: #f8fafc;
}
```

Other variables include `--lg-bg`, `--lg-fg`, `--lg-muted`, `--lg-border`, `--lg-selected`, `--lg-group-bg`
and `--lg-range`. They are listed at the top of `lattice-grid.css`.

---

## Keyboard shortcuts

| Keys | Action |
|---|---|
| Arrows | Move between cells |
| Shift + arrows | Extend the selected range |
| Ctrl + arrows, Home / End, PageUp / PageDown | Jump |
| Tab / Shift+Tab | Next / previous cell |
| Enter or F2, or start typing | Edit (Enter on a group row expands or collapses it) |
| Esc | Cancel edit or drag |
| Space | Select row, or expand/collapse a group |
| Delete / Backspace | Clear editable cells in the range |
| Ctrl+C / Ctrl+V | Copy / paste |
| Ctrl+Z / Ctrl+Y | Undo / redo |
| Ctrl+A | Select all cells |
| Ctrl+F | Find |
| Alt+↑ / Alt+↓ | Move rows (when `rowReorder` is on) |

---

## Run the demo

```bash
git clone https://github.com/michaelinman28/lattice-grid.git
cd lattice-grid
python3 -m http.server 8000      # any static web server works
# open http://localhost:8000
```

The demo has four tabs:

- **Simple**: a pared-down grid with only movable columns, column filters, sorting, row drag-and-drop and a
  show/hide columns picker, plus a Paging on/off button. Its configuration is shown on the page.
- **Sales analytics**: everything turned on, up to 100,000 rows.
- **Tree data**: an org chart.
- **Master / detail**: customers with nested order grids. The grids are also exposed as
`window.simpleGrid` and `window.salesGrid`, so you can try the API from the browser console.

---

## Browser support and limits

- Current Chrome, Edge, Firefox and Safari. The grid needs `ResizeObserver` and CSS `position: sticky`.
- Handles 100,000+ rows in the browser, because only the visible rows are drawn.
- **Not included yet:** loading data from a server page by page as you scroll, spreadsheet formulas,
  drawing only the visible columns (very wide grids), dragging rows between groups or grids, and
  right-to-left layout.

## License

MIT. See [LICENSE](LICENSE).
