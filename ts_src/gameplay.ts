import {
  EMPTY_GRID_VALUE,
  GRID_COLUMNS,
  GRID_ROWS,
  LLK_MATCH_CLEAR_DELAY_FRAMES,
  LLK_SCORE_PER_MATCH,
  LLK_SHUFFLE_MAX_ATTEMPTS,
} from "./config"
import { playLlkMatchSound, playLlkSelectSound } from "./audio"
import { countPlayableGridCells, isPlayableCell, isSameGridCell } from "./grid"
import { canLinkCells } from "./path"
import type { GridCellClickHandler, LinkPathResult, LlkGridCell } from "./types"
import { createLinkPathVisual, destroyCellVisuals, destroyLinkPathVisual, refreshCellStickerVisual, setCellSelected } from "./visuals"

export type LlkGameplay = {
  handleGridTileClickEvent: GridCellClickHandler
  failGame: () => void
  isCompleted: () => boolean
}

export type LlkGameplayOptions = {
  onWin?: () => void
  onScore?: (delta: number) => void
  onFail?: () => void
}

export function createLlkGameplay(grid: LlkGridCell[][], options?: LlkGameplayOptions): LlkGameplay {
  let selectedCell: LlkGridCell | null = null
  let matchedTileCount = 0
  const totalPlayableTileCount = countPlayableGridCells(grid)
  let gridClickLocked = false
  let boardSettling = false
  let gameCompleted = false
  print(`[LlkGameplay] initialized playable_total=${totalPlayableTileCount}`)

  function matchCells(first: LlkGridCell, second: LlkGridCell, linkPath: LinkPathResult): void {
    const matchedValue = first.value
    playLlkMatchSound(first, linkPath)
    const linkVisual = createLinkPathVisual(linkPath, first)
    boardSettling = true
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
      if (!gameCompleted && options?.onScore !== undefined) {
        options.onScore(LLK_SCORE_PER_MATCH)
      }
      print(`[LlkMatch] removed first=(${first.row},${first.column}) second=(${second.row},${second.column}) value=${matchedValue} score_delta=${LLK_SCORE_PER_MATCH} matched=${matchedTileCount}/${totalPlayableTileCount}`)
      resolveBoardAfterMatch()
      boardSettling = false
    })
  }

  function resolveBoardAfterMatch(): void {
    const playableCells = collectPlayableCells()
    if (playableCells.length === 0 || matchedTileCount >= totalPlayableTileCount) {
      gameCompleted = true
      print(`[LlkWin] cleared=true matched=${matchedTileCount}/${totalPlayableTileCount}`)
      if (options?.onWin !== undefined) {
        options.onWin()
      }
      return
    }

    if (findAvailableLink(playableCells) !== null) {
      return
    }

    const shuffled = shuffleRemainingTilesUntilLinked(playableCells)
    print(`[LlkShuffle] triggered cells=${playableCells.length} success=${shuffled}`)
  }

  function collectPlayableCells(): LlkGridCell[] {
    const cells: LlkGridCell[] = []
    for (let row = 0; row < GRID_ROWS; row += 1) {
      for (let column = 0; column < GRID_COLUMNS; column += 1) {
        const cell = grid[row][column]
        if (isPlayableCell(cell)) {
          cells.push(cell)
        }
      }
    }
    return cells
  }

  function findAvailableLink(cells: LlkGridCell[]): LinkPathResult | null {
    for (let firstIndex = 0; firstIndex < cells.length - 1; firstIndex += 1) {
      const first = cells[firstIndex]
      for (let secondIndex = firstIndex + 1; secondIndex < cells.length; secondIndex += 1) {
        const second = cells[secondIndex]
        if (first.value === second.value) {
          const linkPath = canLinkCells(grid, first, second, false)
          if (linkPath !== null) {
            return linkPath
          }
        }
      }
    }
    return null
  }

  function shuffleRemainingTilesUntilLinked(cells: LlkGridCell[]): boolean {
    const values = collectCellValues(cells)
    for (let attempt = 1; attempt <= LLK_SHUFFLE_MAX_ATTEMPTS; attempt += 1) {
      shuffleValues(values)
      applyValuesToCells(cells, values)
      if (findAvailableLink(cells) !== null) {
        refreshShuffledStickers(cells)
        print(`[LlkShuffle] attempt=${attempt} result=linked`)
        return true
      }
    }

    refreshShuffledStickers(cells)
    print(`[LlkShuffle] attempt=${LLK_SHUFFLE_MAX_ATTEMPTS} result=no_link`)
    return false
  }

  function collectCellValues(cells: LlkGridCell[]): number[] {
    const values: number[] = []
    for (let index = 0; index < cells.length; index += 1) {
      values.push(cells[index].value)
    }
    return values
  }

  function shuffleValues(values: number[]): void {
    for (let index = values.length - 1; index > 0; index -= 1) {
      const swapIndex = (GameAPI as any).random_int(0, index) as number
      const value = values[index]
      values[index] = values[swapIndex]
      values[swapIndex] = value
    }
  }

  function applyValuesToCells(cells: LlkGridCell[], values: number[]): void {
    for (let index = 0; index < cells.length; index += 1) {
      cells[index].value = values[index]
    }
  }

  function refreshShuffledStickers(cells: LlkGridCell[]): void {
    let refreshed = 0
    for (let index = 0; index < cells.length; index += 1) {
      if (refreshCellStickerVisual(cells[index])) {
        refreshed += 1
      }
    }
    print(`[LlkShuffle] refreshed_stickers=${refreshed}/${cells.length}`)
  }

  function failGame(): void {
    if (gameCompleted) {
      return
    }
    gameCompleted = true
    if (selectedCell !== null) {
      setCellSelected(selectedCell, false)
      selectedCell = null
    }
    print(`[LlkFail] reason=timeout matched=${matchedTileCount}/${totalPlayableTileCount}`)
    if (options?.onFail !== undefined) {
      options.onFail()
    }
  }

  function isCompleted(): boolean {
    return gameCompleted
  }

  function handleGridTileClick(cell: LlkGridCell, touchSource: string): void {
    print(`[GridTileButtonTouch] source=${touchSource} row=${cell.row} column=${cell.column} value=${cell.value} matched=${cell.matched}`)

    if (gameCompleted || boardSettling) {
      print(`[GridTileButtonTouch] locked source=${touchSource} completed=${gameCompleted} settling=${boardSettling}`)
      return
    }

    if (!isPlayableCell(cell)) {
      return
    }

    playLlkSelectSound(cell)

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

  return {
    handleGridTileClickEvent,
    failGame: () => {
      failGame()
    },
    isCompleted: () => {
      return isCompleted()
    },
  }
}
