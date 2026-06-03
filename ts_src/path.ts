import { EMPTY_GRID_VALUE, GRID_COLUMNS, GRID_ROWS, LLK_MAX_TURNS, PATH_DIRECTIONS } from "./config"
import { isPlayableCell, isSameGridCell } from "./grid"
import type { LlkGridCell, PathSearchState } from "./types"

export function canLinkCells(grid: LlkGridCell[][], first: LlkGridCell, second: LlkGridCell): boolean {
  if (isSameGridCell(first, second) || !isPlayableCell(first) || !isPlayableCell(second) || first.value !== second.value) {
    return false
  }

  const startRow = first.row + 1
  const startColumn = first.column + 1
  const targetRow = second.row + 1
  const targetColumn = second.column + 1
  const queue: PathSearchState[] = [{ row: startRow, column: startColumn, direction: -1, turns: 0 }]
  const visitedTurns: { [key: string]: number } = {}
  let queueIndex = 0

  while (queueIndex < queue.length) {
    const state = queue[queueIndex]
    queueIndex += 1

    for (let direction = 0; direction < PATH_DIRECTIONS.length; direction += 1) {
      const nextTurns = state.direction === -1 || state.direction === direction ? state.turns : state.turns + 1
      if (nextTurns > LLK_MAX_TURNS) {
        continue
      }

      const nextRow = state.row + PATH_DIRECTIONS[direction].rowDelta
      const nextColumn = state.column + PATH_DIRECTIONS[direction].columnDelta
      if (!isExtendedPathCellPassable(grid, nextRow, nextColumn, targetRow, targetColumn)) {
        continue
      }

      if (nextRow === targetRow && nextColumn === targetColumn) {
        print(`[LlkPath] linked from=(${first.row},${first.column}) to=(${second.row},${second.column}) value=${first.value} turns=${nextTurns}`)
        return true
      }

      const key = getVisitedKey(nextRow, nextColumn, direction)
      const bestTurns = visitedTurns[key]
      if (bestTurns !== undefined && bestTurns <= nextTurns) {
        continue
      }

      visitedTurns[key] = nextTurns
      queue.push({ row: nextRow, column: nextColumn, direction, turns: nextTurns })
    }
  }

  print(`[LlkPath] blocked from=(${first.row},${first.column}) to=(${second.row},${second.column}) value=${first.value}`)
  return false
}

function isExtendedPathCellPassable(grid: LlkGridCell[][], row: number, column: number, targetRow: number, targetColumn: number): boolean {
  if (row < 0 || row > GRID_ROWS + 1 || column < 0 || column > GRID_COLUMNS + 1) {
    return false
  }

  if (row === targetRow && column === targetColumn) {
    return true
  }

  if (row === 0 || row === GRID_ROWS + 1 || column === 0 || column === GRID_COLUMNS + 1) {
    return true
  }

  const cell = grid[row - 1][column - 1]
  return cell.value === EMPTY_GRID_VALUE || cell.matched
}

function getVisitedKey(row: number, column: number, direction: number): string {
  return `${row}:${column}:${direction}`
}
