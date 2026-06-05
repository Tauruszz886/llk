import { EMPTY_GRID_VALUE, GRID_COLUMNS, GRID_ROWS, LLK_MAX_TURNS, PATH_DIRECTIONS } from "./config"
import { isPlayableCell, isSameGridCell } from "./grid"
import type { LinkPathPoint, LinkPathResult, LlkGridCell, PathSearchState } from "./types"

export function canLinkCells(grid: LlkGridCell[][], first: LlkGridCell, second: LlkGridCell, logResult = true): LinkPathResult | null {
  if (isSameGridCell(first, second) || !isPlayableCell(first) || !isPlayableCell(second) || first.value !== second.value) {
    return null
  }

  const startRow = first.row + 1
  const startColumn = first.column + 1
  const targetRow = second.row + 1
  const targetColumn = second.column + 1
  const queue: PathSearchState[] = [{ row: startRow, column: startColumn, direction: -1, turns: 0, previousIndex: -1 }]
  const visitedTurns: { [key: string]: number } = {}
  let queueIndex = 0

  while (queueIndex < queue.length) {
    const currentIndex = queueIndex
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

      const nextState: PathSearchState = { row: nextRow, column: nextColumn, direction, turns: nextTurns, previousIndex: currentIndex }
      if (nextRow === targetRow && nextColumn === targetColumn) {
        if (logResult) {
          print(`[LlkPath] linked from=(${first.row},${first.column}) to=(${second.row},${second.column}) value=${first.value} turns=${nextTurns}`)
        }
        return {
          points: simplifyPathPoints(rebuildPathPoints(queue, nextState)),
          turns: nextTurns,
        }
      }

      const key = getVisitedKey(nextRow, nextColumn, direction)
      const bestTurns = visitedTurns[key]
      if (bestTurns !== undefined && bestTurns <= nextTurns) {
        continue
      }

      visitedTurns[key] = nextTurns
      queue.push(nextState)
    }
  }

  if (logResult) {
    print(`[LlkPath] blocked from=(${first.row},${first.column}) to=(${second.row},${second.column}) value=${first.value}`)
  }
  return null
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

function rebuildPathPoints(queue: PathSearchState[], endState: PathSearchState): LinkPathPoint[] {
  const reversed: LinkPathPoint[] = [{ row: endState.row, column: endState.column }]
  let previousIndex = endState.previousIndex
  while (previousIndex >= 0) {
    const state = queue[previousIndex]
    reversed.push({ row: state.row, column: state.column })
    previousIndex = state.previousIndex
  }

  const result: LinkPathPoint[] = []
  for (let index = reversed.length - 1; index >= 0; index -= 1) {
    result.push(reversed[index])
  }
  return result
}

function simplifyPathPoints(points: LinkPathPoint[]): LinkPathPoint[] {
  if (points.length <= 2) {
    return points
  }

  const simplified: LinkPathPoint[] = [points[0]]
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1]
    const current = points[index]
    const next = points[index + 1]
    const sameRow = previous.row === current.row && current.row === next.row
    const sameColumn = previous.column === current.column && current.column === next.column
    if (!sameRow && !sameColumn) {
      simplified.push(current)
    }
  }
  simplified.push(points[points.length - 1])
  return simplified
}
