# Lattice Grid

A dependency-free JavaScript data grid written from scratch: one script, one stylesheet, no build step.
**Live demo:** https://michaelinman28.github.io/lattice-grid/ (or serve this folder locally, e.g. `python3 -m http.server`, and open `index.html`).

```html
<link rel="stylesheet" href="lattice-grid.css">
<script src="lattice-grid.js"></script>
<div id="grid" style="height:600px"></div>
<script>
  const grid = new LatticeGrid('#grid', {
    rowId: (d) => d.id,
    columns: [
      { field: 'id', header: 'ID', type: 'number', pinned: 'left' },
      { header: 'Market', children: [            // column group
        { field: 'region', header: 'Region', filter: 'set' },
        { field: 'country', header: 'Country' },
      ] },
      { field: 'qty', header: 'Qty', type: 'number', editable: true, aggregate: 'sum' },
      { id: 'revenue', header: 'Revenue', type: 'number', aggregate: 'sum',
        getValue: (d) => d.qty * d.price, format: (v) => '$' + v.toFixed(2) },
    ],
    rows: data,
    groupBy: ['region'],
    selection: 'multiple',
    sideBar: 'open',
    totalsRow: true,
  });
</script>
```

## Features

| Area | What you get |
|---|---|
| Rendering | Row virtualisation (100k+ rows), pinned left/right columns, column groups, sticky header and totals row, light/dark themes via CSS variables |
| Columns | Resize (drag, double-click to autosize), drag to reorder, hide/show, pin, flex widths, column menu |
| Sorting | Click to sort, Shift/Ctrl+click for multi-column sort, custom comparators |
| Filtering | Text, number, date and set (checkbox list) filters; floating filters (`>100`, `5..10`); quick filter; external filter; filters tool panel |
| Find | Highlight matches across the grid, step through them with Enter / Shift+Enter |
| Editing | Text, number, date, select, checkbox and large-text editors; validation; undo/redo; change events |
| Range selection | Drag or Shift+click/arrows; status bar shows count/sum/avg/min/max; copy/paste TSV (Excel-compatible); fill handle with linear series; Delete clears |
| Row reordering | Drag the ⠿ handle (mouse or touch) or press Alt+↑/↓; selected rows move together; undoable; paused while a sort, filter, grouping, pivot, tree data or pagination is active (the handles are shown greyed out) |
| Row selection | Checkboxes, select-all (filtered), group checkboxes, Shift range select, single or multiple |
| Grouping | Multi-level row grouping, drag-and-drop group bar, aggregation (`sum avg min max count first last` or a custom function), expand/collapse |
| Pivoting | Pivot mode with generated columns per pivot key and value, plus totals |
| Tree data | Hierarchy from `getTreePath(row)`; parents roll up themselves and their descendants |
| Master/detail | Expandable full-width detail rows with any content, including a nested grid |
| Visuals | Sparklines (line/area/bar) in cells; integrated charts from a cell range (bar, stacked, line, area, pie) with SVG download |
| Export | CSV and native `.xlsx` (bold header, frozen pane, autofilter) |
| Tool panels | Side bar with Columns (visibility, pivot mode, row groups/values/pivot zones) and Filters tabs |
| Other | Context menu, pagination, live updates with cell flashing, `getState()` / `setState()` |

## Column options

`id`, `field` (dot paths allowed), `header`, `type` (`text` `number` `date` `boolean`), `width`, `minWidth`, `flex`,
`pinned`, `hidden`, `sort`, `sortable`, `resizable`, `filter` (`text` `number` `date` `set` or `false`),
`editable` (bool or `fn(row)`), `editor` (`text` `number` `date` `select` `checkbox` `textarea`), `editorOptions`,
`validate(value,row)` (return `true` or a message), `parse(str)`, `getValue(row)`, `setValue(row,value)`,
`format(value,row)`, `render({value,data,text})` (returns a DOM node or an HTML string, so escape untrusted data),
`cellClass`, `tooltip`, `headerTooltip`, `aggregate`, `groupable`, `pivotable`, `groupIndex`, `pivotIndex`,
`sparkline: {type, color}`, `comparator`, `exportFormatted`, `children` (column group).

## Grid options

`rows`, `columns`, `rowId`, `rowHeight`, `headerHeight`, `selection`, `rowClickSelection`, `groupBy`,
`groupDefaultExpanded` (`-1` = all), `hideGroupedColumns`, `groupColumnHeader`, `pivotMode`, `pivotBy`,
`treeData`, `getTreePath`, `masterDetail`, `detailRenderer({data,container,grid})`, `detailHeight`, `totalsRow`,
`pagination`, `pageSize`, `sideBar` (`true` | `'open'`), `toolbar`, `groupPanel`, `statusBar`, `floatingFilters`,
`rowReorder`, `theme`, `flashChanges`, `rowClass(row)`, `externalFilter(row)`, `contextMenuItems(items, ctx)`, `exportFileName`.

## API

`setRows`, `addRows`, `removeRows`, `updateRows`, `getRows`, `refresh`, `setSort`, `setFilter`, `setFilterModel`,
`getFilterModel`, `clearFilters`, `setQuickFilter`, `setFind`, `findNext`, `groupBy`, `pivotBy`, `setPivotMode`,
`setAggregate`, `expandAll`, `collapseAll`, `toggleExpand`, `toggleDetail`, `selectAll`, `deselectAll`,
`getSelectedRows`, `moveRows(ids, toIndex)`, `canReorderRows`, `moveColumn`, `setColumnVisible`, `pinColumn`, `autoSizeColumn`, `autoSizeAll`, `resetColumns`,
`startEdit`, `stopEdit`, `undo`, `redo`, `copyRange`, `pasteFromClipboard`, `chartRange`, `exportCsv`, `getCsv`,
`exportExcel`, `getExcelBlob`, `getState`, `setState`, `setTheme`, `toggleSideBar`, `setPage`, `ensureVisible`,
`destroy`, plus `on(event, fn)` / `off` for `cellValueChanged`, `selectionChanged`, `sortChanged`,
`filterChanged`, `rangeChanged`, `rowsReordered`, `columnMoved` and `columnResized`.

## Keyboard

Arrows move · Shift+arrows extend the range · Ctrl+arrows jump to the edge · PageUp/PageDown · Home/End ·
Tab · Alt+↑/↓ move rows · Enter/F2 edit · Esc cancel · Space select row / toggle group · Delete clear · Ctrl+C / Ctrl+V ·
Ctrl+Z / Ctrl+Y · Ctrl+A · Ctrl+F.

## Not included (yet)

Server-side / infinite row models, spreadsheet formulas, column virtualisation, dragging rows between
groups or grids, and right-to-left layout.

## License

MIT. See [LICENSE](LICENSE).

## Row reordering

Set `rowReorder: true`. A narrow handle column appears on the left. Reordering changes the order of the
underlying `rows` array, fires `rowsReordered` with `{ ids, toIndex, rows }`, and can be undone with Ctrl+Z.

It only runs while the grid shows the raw row order. If a sort, filter (column, quick or external), row
grouping, pivot mode, tree data or pagination is active, the handles turn grey and their tooltip says what
to clear. This matches how AG Grid's managed row dragging behaves under sorting and filtering.
