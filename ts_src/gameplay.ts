import { EMPTY_GRID_VALUE, GRID_COLUMNS, GRID_ROWS, LLK_MATCH_CLEAR_DELAY_FRAMES } from "./config"
import { isPlayableCell, isSameGridCell } from "./grid"
import { canLinkCells } from "./path"
import type { GridCellClickHandler, LinkPathResult, LlkGridCell } from "./types"
import { createLinkPathVisual, destroyCellVisuals, destroyLinkPathVisual, setCellSelected } from "./visuals"

export type LlkGameplay = {
  handleGridTileClickEvent: GridCellClickHandler
}

export function createLlkGameplay(grid: LlkGridCell[][]): LlkGameplay {
  let selectedCell: LlkGridCell | null = null
  let matchedTileCount = 0
  let gridClickLocked = false

  function matchCells(first: LlkGridCell, second: LlkGridCell, linkPath: LinkPathResult): void {
    const matchedValue = first.value
    const linkVisual = createLinkPathVisual(linkPath, first)
    first.matched = true
    second.matched = true
    first.value = EMPTY_GRID_VALUE
    second.value = EMPTY_GRID_VALUE
    selectedCell = null
    matchedTileCount += 2
    ;(LuaAPI as any).call_delay_frame(LLK_MATCH_CLEAR_DELAY_FRAMES, () => {
      destroyCellVisuals(first)
      destroyCellVisuals(second)
      destroyLinkPathVisual(linkVisual)
      print(`[LlkMatch] removed first=(${first.row},${first.column}) second=(${second.row},${second.column}) value=${matchedValue} matched=${matchedTileCount}/${GRID_ROWS * GRID_COLUMNS - 1}`)
    })
  }

  function handleGridTileClick(cell: LlkGridCell, touchSource: string): void {
    print(`[GridTileButtonTouch] source=${touchSource} row=${cell.row} column=${cell.column} value=${cell.value} matched=${cell.matched}`)

    if (!isPlayableCell(cell)) {
      return
    }

    if (selectedCell === null) {
      selectedCell = cell
      setCellSelected(cell, true)
      print(`[LlkSelect] first row=${cell.row} column=${cell.column} value=${cell.value}`)
      return
    }

    if (isSameGridCell(selectedCell, cell)) {
      setCellSelected(selectedCell, false)
      print(`[LlkSelect] cancel row=${cell.row} column=${cell.column}`)
      selectedCell = null
      return
    }

    const first = selectedCell
    if (first.value !== cell.value) {
      setCellSelected(first, false)
      selectedCell = cell
      setCellSelected(cell, true)
      print(`[LlkSelect] switch row=${cell.row} column=${cell.column} value=${cell.value}`)
      return
    }

    const linkPath = canLinkCells(grid, first, cell)
    if (linkPath !== null) {
      matchCells(first, cell, linkPath)
      return
    }

    setCellSelected(first, false)
    selectedCell = cell
    setCellSelected(cell, true)
    print(`[LlkSelect] path_failed_switch row=${cell.row} column=${cell.column} value=${cell.value}`)
  }

  function handleGridTileClickEvent(cell: LlkGridCell, touchSource: string): void {
    if (gridClickLocked) {
      print(`[GridTileButtonTouch] duplicate_ignored source=${touchSource} row=${cell.row} column=${cell.column}`)
      return
    }

    gridClickLocked = true
    handleGridTileClick(cell, touchSource)
    ;(LuaAPI as any).call_delay_frame(1, () => {
      gridClickLocked = false
    })
  }

  return { handleGridTileClickEvent }
}
