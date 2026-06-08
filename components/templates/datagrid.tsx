'use client'

import {
  ColDef,
  CsvExportModule,
  GridReadyEvent,
  ITextFilterParams,
  RowNode,
  StatusPanelDef,
  themeQuartz,
} from 'ag-grid-community'
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule])

// ── Types ─────────────────────────────────────────────────────────────────────
export interface DatagridProps {
  tableId?: string
  columns: ColDef[]
  data: any[]
  enablePagination?: boolean
  paginationPageSize?: number
  selectionType?: 'singleRow' | 'multiRow'
  handleRowClick?: (data: any) => void
  handleCellChange?: (data: any) => void
  onCellValueChanged?: (event: any) => void
  handleRowSelectonClick?: (data: any[]) => void
  enableCheckboxes?: boolean
  enableClickSelection?: boolean
  containerHeight?: number
  containerStyles?: React.CSSProperties
  gridHeight?: number | string
  pageSizeAuto?: boolean
  paginationPageSizeSelector?: number[]
  handlePageChanged?: (event: any) => void
  loadingIndicator?: boolean
  handleFetchMore?: () => void
  hasMore?: boolean
  onExportCSV?: () => void
  onExportXLSX?: () => void
  handleExportXLSXRef?: React.RefObject<(() => void) | null>
  onScrollChange?: (scrollTop: number) => void
  isRowSelectable?: (rowNode: any) => boolean
  onGridReady?: (api: any) => void
  enableRowNumbers?: boolean
  subColumns?: ColDef[]
  getRowHeight?: (params: any) => number
  totalRecordCount?: number
  onPaginationButtonClick?: (params: { pageIndex: number; pageNumber: number; pageSize: number }) => void
  recordsPerPage?: number
  currentPage?: number
  paginationContextKey?: any
  refreshDnD?: any
  syncRefresh?: boolean
  getRowIdFromDataId?: boolean
  domLayout?: 'normal' | 'autoHeight' | 'print'
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
export const CustomTooltip = (props: any) => (
  <div className="text-stone-500 bg-white p-2 rounded-lg shadow-lg max-w-xs text-sm">{props.value}</div>
)

// ── Status bar panels ─────────────────────────────────────────────────────────
const CustomTotalRowCount = React.forwardRef((props: any, ref) => {
  const [displayCount, setDisplayCount] = useState(0)
  useImperativeHandle(ref, () => ({}))
  const countFromProp = props.totalRecordCount != null && Number.isFinite(Number(props.totalRecordCount)) ? Number(props.totalRecordCount) : null
  useEffect(() => {
    const update = () => setDisplayCount(countFromProp ?? props.api?.getDisplayedRowCount?.() ?? 0)
    update()
    if (props.api) {
      props.api.addEventListener('modelUpdated', update)
      return () => props.api.removeEventListener('modelUpdated', update)
    }
  }, [props.api, countFromProp, props.paginationContextKey])
  const val = countFromProp ?? displayCount
  return (
    <div className="ag-status-name-value">
      <span className="ag-status-name-value-value">{val > 0 ? `Total: ${Number(val).toLocaleString()}` : ''}</span>
    </div>
  )
})
CustomTotalRowCount.displayName = 'CustomTotalRowCount'

const RowCountStatusPanel = React.forwardRef((props: any, ref) => {
  const [count, setCount] = useState(0)
  useImperativeHandle(ref, () => ({}))
  const countFromProp = props.totalRecordCount != null && Number.isFinite(Number(props.totalRecordCount)) ? Number(props.totalRecordCount) : null
  const sync = useCallback(() => {
    if (props.api?.getDisplayedRowCount) setCount(props.api.getDisplayedRowCount())
  }, [props.api])
  useEffect(() => {
    if (!props.api) return
    sync()
    props.api.addEventListener?.('modelUpdated', sync)
    return () => props.api.removeEventListener?.('modelUpdated', sync)
  }, [props.api, sync, props.paginationContextKey])
  const val = countFromProp ?? count
  return (
    <div className="ag-status-name-value">
      <span>Rows: </span>
      <span className="ag-status-name-value-value">{Number(val).toLocaleString()}</span>
    </div>
  )
})
RowCountStatusPanel.displayName = 'RowCountStatusPanel'

const PaginationStatusPanel = React.forwardRef((props: any, ref) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [rowCount, setRowCount] = useState(0)
  useImperativeHandle(ref, () => ({}))
  const pageSizeFromProp = props.pageSize != null && Number.isFinite(Number(props.pageSize)) ? Number(props.pageSize) : null

  const syncCount = useCallback(() => {
    if (props.api?.getDisplayedRowCount) setRowCount(props.api.getDisplayedRowCount() ?? 0)
  }, [props.api])

  useEffect(() => {
    if (!props.api) return
    syncCount()
    props.api.addEventListener?.('modelUpdated', syncCount)
    return () => props.api.removeEventListener?.('modelUpdated', syncCount)
  }, [props.api, syncCount])

  useEffect(() => {
    queueMicrotask(syncCount)
  }, [syncCount, props.totalRecordCount, props.pageSize, props.paginationContextKey, props.currentPage])

  useEffect(() => {
    if (!props.api || props.currentPage != null) return
    const api: any = props.api
    const sync = () => setCurrentPage(typeof api.paginationGetCurrentPage === 'function' ? api.paginationGetCurrentPage() : 0)
    sync()
    api.addEventListener?.('paginationChanged', sync)
    return () => api.removeEventListener?.('paginationChanged', sync)
  }, [props.api, props.currentPage])

  const totalPages = useMemo(() => {
    const totalFromProp = props.totalRecordCount != null && Number.isFinite(Number(props.totalRecordCount)) ? Number(props.totalRecordCount) : null
    let pageSize: number | null = pageSizeFromProp
    if (!pageSize) {
      const api: any = props.api
      const fromGrid = api?.paginationGetPageSize ? Number(api.paginationGetPageSize()) : null
      pageSize = fromGrid && fromGrid > 0 ? fromGrid : (props.onPaginationButtonClick ? 50 : null)
    }
    if (!pageSize) return 0
    const source = totalFromProp ?? rowCount
    return source > 0 ? Math.ceil(source / pageSize) : 0
  }, [props.totalRecordCount, props.pageSize, props.api, props.onPaginationButtonClick, pageSizeFromProp, rowCount])

  const goToPage = (idx: number) => {
    if (!props.api) return
    const api: any = props.api
    if (props.currentPage == null) setCurrentPage(idx)
    let pageSize = pageSizeFromProp ?? (api.paginationGetPageSize?.() ?? 0)
    if (!pageSize && props.onPaginationButtonClick) pageSize = 50
    props.onPaginationButtonClick?.({ pageIndex: idx, pageNumber: idx + 1, pageSize })
    api.paginationGoToPage?.(idx)
  }

  const buildPageList = (current: number, total: number): (number | 'ellipsis')[] => {
    if (total <= 0) return []
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | 'ellipsis')[] = [1]
    const start = Math.max(current - 1, 2)
    const end = Math.min(current + 1, total - 1)
    if (start > 2) pages.push('ellipsis')
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < total - 1) pages.push('ellipsis')
    pages.push(total)
    return pages
  }

  const activePage = (props.currentPage != null && Number.isInteger(props.currentPage) ? props.currentPage : currentPage) + 1
  const pages = buildPageList(activePage, totalPages)
  if (!pages.length) return null

  return (
    <div className="ag-status-name-value flex items-center gap-1">
      {pages.map((page, i) =>
        page === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-1 text-xs text-gray-400">…</span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => goToPage((page as number) - 1)}
            className={`px-2 py-1 rounded text-xs ${page === activePage ? 'bg-[#13161A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {page}
          </button>
        )
      )}
    </div>
  )
})
PaginationStatusPanel.displayName = 'PaginationStatusPanel'

// ── Main component ────────────────────────────────────────────────────────────
const DatagridTemplate = ({
  tableId = 'tableName',
  columns,
  data,
  enablePagination = false,
  paginationPageSize = 200,
  selectionType = 'singleRow',
  handleRowClick,
  handleCellChange,
  onCellValueChanged,
  handleRowSelectonClick,
  enableCheckboxes = true,
  enableClickSelection = true,
  containerHeight,
  containerStyles,
  gridHeight,
  pageSizeAuto = false,
  paginationPageSizeSelector = [200, 500, 1000],
  handlePageChanged,
  loadingIndicator,
  handleFetchMore,
  hasMore,
  onExportCSV,
  onExportXLSX,
  handleExportXLSXRef,
  onScrollChange,
  isRowSelectable,
  onGridReady,
  enableRowNumbers = false,
  getRowHeight,
  totalRecordCount,
  onPaginationButtonClick,
  recordsPerPage = 50,
  currentPage: currentPageFromParent,
  paginationContextKey,
  refreshDnD,
  syncRefresh = false,
  getRowIdFromDataId = true,
  domLayout = 'normal',
}: DatagridProps) => {
  const gridRef = useRef<any>(null)

  const agGridReactKey = useMemo(() => {
    if (paginationContextKey != null && onPaginationButtonClick) {
      return `${tableId}-${paginationContextKey}-${totalRecordCount ?? 0}`
    }
    return tableId
  }, [tableId, paginationContextKey, onPaginationButtonClick, totalRecordCount])

  const containerStyle = useMemo(() => ({ width: '100%', height: containerHeight ?? 500, ...containerStyles }), [containerHeight, containerStyles])
  const gridStyle = useMemo(() => ({ height: gridHeight ?? '100%', width: '100%' }), [gridHeight])

  const defaultColDef = useMemo<ColDef>(() => ({
    filter: true,
    filterParams: {} as ITextFilterParams,
    sortable: true,
    editable: false,
    resizable: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    enableCellChangeFlash: true,
    tooltipComponent: CustomTooltip,
    cellRenderer: (params: any) => params.value,
  }), [])

  const onRowDragEnd = useCallback((event: any) => {
    const ids: string[] = []
    event.api.forEachNode((node: any) => { if (node.data?.id != null) ids.push(String(node.data.id)) })
    localStorage.setItem(tableId, JSON.stringify(ids))
  }, [tableId])

  useEffect(() => {
    if (!gridRef?.current?.api || !data?.length) return
    const saved = JSON.parse(localStorage.getItem(tableId) || '[]')
    if (!saved.length) return
    const sorted = [...data].sort((a, b) => saved.indexOf(String(a.id)) - saved.indexOf(String(b.id)))
    gridRef.current.api.setGridOption('rowData', sorted)
  }, [data, tableId, refreshDnD])

  const prevDataRef = useRef<any[]>([])
  useEffect(() => {
    const api = gridRef?.current?.api
    if (!api || !data || !syncRefresh) { prevDataRef.current = data ? [...data] : []; return }
    const prevMap: Record<string, any> = {}
    prevDataRef.current.forEach(r => { if (r?.id != null) prevMap[String(r.id)] = r })
    const changed: any[] = []
    data.forEach(r => {
      if (r?.id != null) {
        const prev = prevMap[String(r.id)]
        if (!prev || JSON.stringify(prev) !== JSON.stringify(r)) {
          const node = api.getRowNode(String(r.id))
          if (node) changed.push(node)
        }
      }
    })
    if (changed.length) api.refreshCells({ rowNodes: changed, force: true })
    prevDataRef.current = [...data]
  }, [data, syncRefresh])

  useEffect(() => {
    if (syncRefresh) {
      try { gridRef?.current?.api?.refreshCells({ force: true }) } catch { gridRef?.current?.api?.redrawRows() }
    }
  }, [columns, syncRefresh])

  const onCellValueChangedHandler = useCallback((event: any) => {
    onCellValueChanged?.(event)
    if (handleCellChange) handleCellChange(event.data)
  }, [handleCellChange, onCellValueChanged])

  const onBtnExport = useCallback(() => {
    gridRef?.current?.api?.exportDataAsCsv({
      fileName: `export-${new Date().toISOString().split('T')[0]}.csv`,
      columnKeys: columns?.map(c => c.field).filter(Boolean),
      allColumns: true,
    })
    onExportCSV?.()
  }, [columns, onExportCSV])

  const handleExportXLSX = useCallback(() => {
    (gridRef?.current?.api as any)?.exportDataAsExcel?.({ allColumns: true })
    onExportXLSX?.()
  }, [onExportXLSX])

  useEffect(() => {
    if (!handleExportXLSXRef) return
    handleExportXLSXRef.current = handleExportXLSX
    return () => { if (handleExportXLSXRef) handleExportXLSXRef.current = null }
  }, [handleExportXLSXRef, handleExportXLSX])

  const onSelectionChanged = useCallback(() => {
    const selected = gridRef?.current?.api.getSelectedNodes()?.map((n: RowNode) => n.data)
    if (handleRowSelectonClick) queueMicrotask(() => handleRowSelectonClick(selected))
  }, [handleRowSelectonClick])

  const isFetchingRef = useRef(false)
  const prevLenRef = useRef(0)
  const lastVisibleRowRef = useRef<number | null>(null)
  const shouldRestoreRef = useRef(false)

  useEffect(() => {
    if (!gridRef?.current?.api) return
    const len = data?.length || 0
    if (len > prevLenRef.current && shouldRestoreRef.current && lastVisibleRowRef.current != null) {
      requestAnimationFrame(() => {
        gridRef.current.api.ensureIndexVisible(lastVisibleRowRef.current as number, 'bottom')
        shouldRestoreRef.current = false
      })
    }
    prevLenRef.current = len
  }, [data])

  const handleBodyScroll = useCallback(() => {
    const gridBody = document.querySelector('.ag-body-viewport') as HTMLElement | null
    if (gridBody && onScrollChange) {
      const top = Number(gridBody.scrollTop)
      if (Number.isFinite(top)) onScrollChange(top)
    }
    if (isFetchingRef.current || !handleFetchMore || hasMore === false || !gridBody) return
    const { scrollTop, clientHeight, scrollHeight } = gridBody
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      const api = gridRef?.current?.api as any
      if (api) {
        const lastIdx = api.getLastDisplayedRowIndex?.()
        if (lastIdx != null && lastIdx >= 0) {
          lastVisibleRowRef.current = lastIdx
          api.ensureIndexVisible(lastIdx, 'bottom')
        }
      }
      shouldRestoreRef.current = true
      isFetchingRef.current = true
      handleFetchMore()
      setTimeout(() => { isFetchingRef.current = false }, 1000)
    }
  }, [handleFetchMore, hasMore, onScrollChange])

  const rowNumberColumnDef = useMemo<ColDef | null>(() => {
    if (!enableRowNumbers) return null
    const pageSize = recordsPerPage ?? paginationPageSize ?? 1
    const page = currentPageFromParent != null && Number.isInteger(currentPageFromParent) ? currentPageFromParent : 0
    return {
      colId: '__rowNo',
      headerName: '#',
      width: 70,
      pinned: 'left' as const,
      sortable: false,
      filter: false,
      valueGetter: (params: any) => page * pageSize + (params.node?.rowIndex ?? 0) + 1,
    }
  }, [enableRowNumbers, currentPageFromParent, recordsPerPage, paginationPageSize])

  const columnDefsWithRowNumbers = useMemo(() => {
    const defs = columns || []
    return rowNumberColumnDef ? [rowNumberColumnDef, ...defs] : defs
  }, [columns, rowNumberColumnDef])

  const statusBar = useMemo<{ statusPanels: StatusPanelDef[] }>(() => ({
    statusPanels: [
      { statusPanel: RowCountStatusPanel, statusPanelParams: { totalRecordCount, paginationContextKey } },
      { statusPanel: CustomTotalRowCount, statusPanelParams: { totalRecordCount, paginationContextKey } },
      ...(onPaginationButtonClick ? [{
        statusPanel: PaginationStatusPanel,
        statusPanelParams: {
          totalRecordCount,
          pageSize: recordsPerPage ?? paginationPageSize,
          onPaginationButtonClick,
          currentPage: currentPageFromParent,
          paginationContextKey,
        },
      }] : []),
    ],
  }), [totalRecordCount, recordsPerPage, paginationPageSize, onPaginationButtonClick, currentPageFromParent, paginationContextKey])

  return (
    <div className="w-full overflow-x-auto sm:overflow-visible" style={containerStyle}>
      <div className="min-w-[600px] sm:min-w-0" style={{ ...gridStyle, '--ag-font-family': 'Roboto, sans-serif' } as React.CSSProperties}>
        <AgGridReact
          key={agGridReactKey}
          ref={gridRef}
          theme={themeQuartz}
          rowData={loadingIndicator && (!data || data.length === 0) ? Array(5).fill({}) : data || []}
          columnDefs={columnDefsWithRowNumbers}
          defaultColDef={defaultColDef}
          domLayout={domLayout}
          getRowHeight={getRowHeight}
          {...(getRowIdFromDataId && { getRowId: (p: any) => String(p.data?.id) })}
          rowDragManaged
          animateRows
          rowDragEntireRow
          onRowDragEnd={onRowDragEnd}
          onRowDataUpdated={p => p.api.refreshCells({ force: true })}
          onGridReady={(p: GridReadyEvent) => { onGridReady?.(p.api) }}
          undoRedoCellEditing
          undoRedoCellEditingLimit={20}
          selectionColumnDef={{ sortable: false, resizable: false, width: 50, pinned: 'left' as const }}
          rowSelection={{
            mode: selectionType,
            headerCheckbox: enableCheckboxes,
            enableClickSelection,
            checkboxes: enableCheckboxes,
            selectAll: 'filtered',
            isRowSelectable,
          }}
          onSelectionChanged={onSelectionChanged}
          onRowClicked={e => { if (handleRowClick) handleRowClick(e.data) }}
          onCellValueChanged={onCellValueChangedHandler}
          tooltipMouseTrack
          suppressServerSideFullWidthLoadingRow
          pagination={enablePagination}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={paginationPageSizeSelector}
          onPaginationChanged={handlePageChanged}
          paginationAutoPageSize={pageSizeAuto}
          statusBar={statusBar}
        />
      </div>
    </div>
  )
}

export default DatagridTemplate
