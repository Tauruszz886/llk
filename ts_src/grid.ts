import {
  EMPTY_GRID_VALUE,
  GRID_CELL_SIZE,
  GRID_COLUMNS,
  GRID_LINE_DURATION,
  GRID_LINE_Y,
  GRID_LINES_VISIBLE,
  GRID_ROWS,
  TILE_CENTER_X,
  TILE_CENTER_Z,
  TILE_KIND_COUNT,
} from "./config"
import type { GridBounds, LlkGridCell } from "./types"
import { asFixed } from "./utils"

export function getGridBounds(): GridBounds {
  return {
    xMin: TILE_CENTER_X - (GRID_COLUMNS * GRID_CELL_SIZE) / 2,
    xMax: TILE_CENTER_X + (GRID_COLUMNS * GRID_CELL_SIZE) / 2,
    zMin: TILE_CENTER_Z - (GRID_ROWS * GRID_CELL_SIZE) / 2,
    zMax: TILE_CENTER_Z + (GRID_ROWS * GRID_CELL_SIZE) / 2,
  }
}

export function drawTileGrid(): void {
  const color = GlobalAPI.str_to_color("FFFFFF")
  const xStep = GRID_CELL_SIZE
  const zStep = GRID_CELL_SIZE
  const bounds = getGridBounds()

  for (let column = 0; column <= GRID_COLUMNS; column += 1) {
    const x = bounds.xMin + xStep * column
    if (GRID_LINES_VISIBLE) {
      drawGridLine(x, bounds.zMin, x, bounds.zMax, color)
    }
  }

  for (let row = 0; row <= GRID_ROWS; row += 1) {
    const z = bounds.zMin + zStep * row
    if (GRID_LINES_VISIBLE) {
      drawGridLine(bounds.xMin, z, bounds.xMax, z, color)
    }
  }

  print(`[TileGrid] configured columns=${GRID_COLUMNS} rows=${GRID_ROWS} cell_size=${GRID_CELL_SIZE} visible=${GRID_LINES_VISIBLE} x_step=${xStep} z_step=${zStep}`)
}

function drawGridLine(startX: number, startZ: number, endX: number, endZ: number, color: any): void {
  ;(GameAPI as any).draw_line(
    math.Vector3(asFixed(startX), asFixed(GRID_LINE_Y), asFixed(startZ)),
    math.Vector3(asFixed(endX), asFixed(GRID_LINE_Y), asFixed(endZ)),
    color,
    asFixed(GRID_LINE_DURATION),
  )
}

export function createInitialLlkGridData(): LlkGridCell[][] {
  const bounds = getGridBounds()
  const grid: LlkGridCell[][] = []
  const values = createPairedGridValues()
  let valueIndex = 0

  for (let row = 0; row < GRID_ROWS; row += 1) {
    const rowCells: LlkGridCell[] = []
    for (let column = 0; column < GRID_COLUMNS; column += 1) {
      const value = values[valueIndex]
      valueIndex += 1
      rowCells.push({
        row,
        column,
        x: bounds.xMin + GRID_CELL_SIZE * (column + 0.5),
        z: bounds.zMin + GRID_CELL_SIZE * (row + 0.5),
        value,
        matched: false,
        tileUnit: null,
        stickerUnit: null,
        buttonLayer: null,
        buttonCircleLayer: null,
        buttonNode: null,
        buttonPosition: null,
        stickerPitch: 0,
        clickProxyUnit: null,
        tileTouchRegistered: false,
        clickProxyTouchRegistered: false,
        buttonTouchBindingCount: 0,
      })
    }
    grid.push(rowCells)
  }

  print(`[LlkGridData] initialized rows=${GRID_ROWS} columns=${GRID_COLUMNS} cell_size=${GRID_CELL_SIZE} value_min=${EMPTY_GRID_VALUE} value_max=${TILE_KIND_COUNT} valid=${GRID_ROWS * GRID_COLUMNS - 1} empty=1`)
  printGridValueCounts(grid)
  return grid
}

function createPairedGridValues(): number[] {
  const totalCells = GRID_ROWS * GRID_COLUMNS
  const validCellCount = totalCells - 1
  const pairCount = validCellCount / 2
  const values: number[] = []

  for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
    const value = (pairIndex % TILE_KIND_COUNT) + 1
    values.push(value)
    values.push(value)
  }
  values.push(EMPTY_GRID_VALUE)
  shuffleValues(values)
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

export function printGridValueCounts(grid: LlkGridCell[][]): void {
  const counts: number[] = []
  for (let value = 0; value <= TILE_KIND_COUNT; value += 1) {
    counts[value] = 0
  }

  for (let row = 0; row < grid.length; row += 1) {
    for (let column = 0; column < grid[row].length; column += 1) {
      const value = grid[row][column].value
      const currentCount = counts[value] === undefined ? 0 : counts[value]
      counts[value] = currentCount + 1
    }
  }

  let text = ""
  for (let value = 0; value <= TILE_KIND_COUNT; value += 1) {
    text = `${text}${value === 0 ? "" : ","}${value}:${counts[value]}`
  }
  print(`[LlkGridData] value_counts=${text}`)
}

export function printInitialLlkGridData(grid: LlkGridCell[][]): void {
  for (let row = 0; row < grid.length; row += 1) {
    let rowValues = ""
    for (let column = 0; column < grid[row].length; column += 1) {
      const value = grid[row][column].value
      rowValues = `${rowValues}${column === 0 ? "" : ","}${value}`
    }
    print(`[LlkGridData] row_${row}=${rowValues}`)
  }
}

export function flattenGridCells(grid: LlkGridCell[][]): LlkGridCell[] {
  const cells: LlkGridCell[] = []
  for (let row = 0; row < grid.length; row += 1) {
    for (let column = 0; column < grid[row].length; column += 1) {
      cells.push(grid[row][column])
    }
  }
  return cells
}

export function isSameGridCell(first: LlkGridCell, second: LlkGridCell): boolean {
  return first.row === second.row && first.column === second.column
}

export function isPlayableCell(cell: LlkGridCell): boolean {
  return cell.value !== EMPTY_GRID_VALUE && !cell.matched
}
