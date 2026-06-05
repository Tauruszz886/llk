import { GRID_COLUMNS, GRID_ROWS, LLK_MAX_LEVEL, TILE_KIND_COUNT } from "./config"
import { LLK_FORMAL_LEVEL_COLUMNS, LLK_FORMAL_LEVEL_ROWS, LLK_FORMAL_LEVELS } from "./level_maps"
import { toIntOrThrow } from "@common/num"

export type LlkLevelConfig = {
  level: number
  tileKindCount: number
  shufflePasses: number
  map: number[][]
}

const LEVEL_CONFIGS: LlkLevelConfig[] = createFormalLevelConfigs()

export function getLlkLevelConfig(level: number): LlkLevelConfig {
  const normalizedLevel = normalizeLlkLevel(level)
  return LEVEL_CONFIGS[normalizedLevel - 1]
}

export function normalizeLlkLevel(level: number | null | undefined, fallback = 1): number {
  if (level === null || level === undefined || level < 1) {
    return clampLevel(toIntOrThrow(fallback, { ctx: "llk_level_fallback", logger: print }))
  }
  return clampLevel(toIntOrThrow(level, { ctx: "llk_level", logger: print }))
}

function createFormalLevelConfigs(): LlkLevelConfig[] {
  if (LLK_FORMAL_LEVEL_ROWS !== GRID_ROWS || LLK_FORMAL_LEVEL_COLUMNS !== GRID_COLUMNS) {
    print(`[LlkLevelConfig] formal_map_shape_mismatch rows=${LLK_FORMAL_LEVEL_ROWS}/${GRID_ROWS} columns=${LLK_FORMAL_LEVEL_COLUMNS}/${GRID_COLUMNS}`)
  }

  const configs: LlkLevelConfig[] = []
  const total = LLK_FORMAL_LEVELS.length < LLK_MAX_LEVEL ? LLK_FORMAL_LEVELS.length : LLK_MAX_LEVEL
  for (let index = 0; index < total; index += 1) {
    const formalLevel = LLK_FORMAL_LEVELS[index]
    const level = normalizeFormalLevelNumber(formalLevel.level, index + 1)
    const tileKindCount = clampTileKindCount(formalLevel.tileKinds)
    const map = cloneAndValidateLevelMap(level, tileKindCount, formalLevel.map)
    configs.push({
      level,
      tileKindCount,
      shufflePasses: 1,
      map,
    })
  }

  for (let level = total + 1; level <= LLK_MAX_LEVEL; level += 1) {
    const previous = configs[configs.length - 1]
    configs.push({
      level,
      tileKindCount: previous.tileKindCount,
      shufflePasses: 1,
      map: cloneLevelMap(previous.map),
    })
  }

  print(`[LlkLevelConfig] formal_levels_loaded=${configs.length} source_levels=${LLK_FORMAL_LEVELS.length} rows=${GRID_ROWS} columns=${GRID_COLUMNS}`)
  return configs
}

function normalizeFormalLevelNumber(level: number, fallback: number): number {
  if (level < 1 || level > LLK_MAX_LEVEL) {
    print(`[LlkLevelConfig] formal_level_number_out_of_range value=${level} fallback=${fallback}`)
    return fallback
  }
  return level
}

function cloneAndValidateLevelMap(level: number, tileKindCount: number, map: number[][]): number[][] {
  const cloned: number[][] = []
  let emptyCount = 0
  let playableCount = 0
  const counts: number[] = []
  for (let value = 0; value <= TILE_KIND_COUNT; value += 1) {
    counts[value] = 0
  }

  for (let row = 0; row < GRID_ROWS; row += 1) {
    const sourceRow = map[row]
    const targetRow: number[] = []
    if (sourceRow === undefined || sourceRow.length !== GRID_COLUMNS) {
      print(`[LlkLevelConfig] map_row_shape_mismatch level=${level} row=${row}`)
    }
    for (let column = 0; column < GRID_COLUMNS; column += 1) {
      const sourceValue = sourceRow !== undefined && sourceRow[column] !== undefined ? sourceRow[column] : 0
      const value = normalizeMapValue(level, row, column, sourceValue, tileKindCount)
      targetRow.push(value)
      counts[value] = (counts[value] === undefined ? 0 : counts[value]) + 1
      if (value === 0) {
        emptyCount += 1
      } else {
        playableCount += 1
      }
    }
    cloned.push(targetRow)
  }

  for (let value = 1; value <= tileKindCount; value += 1) {
    if (counts[value] % 2 !== 0) {
      print(`[LlkLevelConfig] odd_tile_count level=${level} value=${value} count=${counts[value]}`)
    }
  }
  print(`[LlkLevelConfig] level=${level} tile_kinds=${tileKindCount} playable=${playableCount} empty=${emptyCount}`)
  return cloned
}

function normalizeMapValue(level: number, row: number, column: number, value: number, tileKindCount: number): number {
  if (value < 0 || value > TILE_KIND_COUNT) {
    print(`[LlkLevelConfig] map_value_out_of_range level=${level} row=${row} column=${column} value=${value}`)
    return 0
  }
  if (value > tileKindCount) {
    print(`[LlkLevelConfig] map_value_over_tile_kind_count level=${level} row=${row} column=${column} value=${value} tile_kinds=${tileKindCount}`)
  }
  return value
}

function cloneLevelMap(map: number[][]): number[][] {
  const cloned: number[][] = []
  for (let row = 0; row < map.length; row += 1) {
    const rowValues: number[] = []
    for (let column = 0; column < map[row].length; column += 1) {
      rowValues.push(map[row][column])
    }
    cloned.push(rowValues)
  }
  return cloned
}

function clampTileKindCount(tileKindCount: number): number {
  if (tileKindCount < 1) {
    return 1
  }
  if (tileKindCount > TILE_KIND_COUNT) {
    return TILE_KIND_COUNT
  }
  return tileKindCount
}

function clampLevel(level: number): number {
  if (level < 1) {
    return 1
  }
  if (level > LLK_MAX_LEVEL) {
    return LLK_MAX_LEVEL
  }
  return level
}
