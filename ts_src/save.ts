import { json_parse, json_stringify } from "@common/json"
import { toIntOrThrow } from "@common/num"
import { ArchiveKeys, GRID_COLUMNS, GRID_ROWS, LLK_LEVEL_TIME_SECONDS } from "./config"

declare function tostring(value: unknown): string

export type LlkSaveRoot = {
  version: number
  savedAt: number
  currentLevel: number
  score: number
  remainingSeconds: number
  gridValues: number[][]
  gameFinished: boolean
}

export type LlkSaveSnapshot = {
  currentLevel: number
  score: number
  remainingSeconds: number
  gridValues: number[][]
  gameFinished?: boolean
}

const LLK_SAVE_VERSION = 2

export function saveLlkProgressSnapshot(snapshot: LlkSaveSnapshot, reason: string): void {
  const payload: LlkSaveRoot = {
    version: LLK_SAVE_VERSION,
    savedAt: (GameAPI as any).get_timestamp() as number,
    currentLevel: snapshot.currentLevel,
    score: math.max(0, snapshot.score),
    remainingSeconds: clampRemainingSeconds(snapshot.remainingSeconds),
    gridValues: snapshot.gridValues,
    gameFinished: snapshot.gameFinished === true,
  }
  const text = json_stringify(payload)
  const roles = getRuntimeRoles()
  let saved = 0
  for (let index = 0; index < roles.length; index += 1) {
    const role = roles[index] as any
    try {
      role.set_archive_by_type(Enums.ArchiveType.Str, ArchiveKeys.PLAYER_SAVE_JSON, text)
      saved += 1
    } catch (e) {
      print(`[LlkSave] save_failed role_index=${index} err=${tostring(e)}`)
    }
  }
  print(`[LlkSave] saved reason=${reason} roles=${saved}/${roles.length} archive_id=${ArchiveKeys.PLAYER_SAVE_JSON} level=${payload.currentLevel} score=${payload.score} remaining=${payload.remainingSeconds} finished=${payload.gameFinished}`)
}

export function loadLlkProgressSnapshot(): LlkSaveRoot | null {
  const roles = getRuntimeRoles()
  for (let index = 0; index < roles.length; index += 1) {
    const role = roles[index] as any
    const loaded = loadLlkProgressFromRole(role, index)
    if (loaded !== null) {
      return loaded
    }
  }

  print(`[LlkSave] no_saved_progress archive_id=${ArchiveKeys.PLAYER_SAVE_JSON}`)
  return null
}

function loadLlkProgressFromRole(role: any, roleIndex: number): LlkSaveRoot | null {
  try {
    const text = role.get_archive_by_type(Enums.ArchiveType.Str, ArchiveKeys.PLAYER_SAVE_JSON)
    if (type(text) === "string" && (text as string).length > 0) {
      const parsed = json_parse(text as string) as Record<string, unknown>
      const version = toIntOrThrow(parsed.version, { ctx: "llk_save_version", logger: print })
      if (version !== LLK_SAVE_VERSION) {
        print(`[LlkSave] ignored_version role_index=${roleIndex} version=${version} expected=${LLK_SAVE_VERSION}`)
        return null
      }
      const saveRoot: LlkSaveRoot = {
        version,
        savedAt: toIntOrThrow(parsed.savedAt, { ctx: "llk_save_saved_at", logger: print }),
        currentLevel: toIntOrThrow(parsed.currentLevel, { ctx: "llk_save_current_level", logger: print }),
        score: toIntOrThrow(parsed.score, { ctx: "llk_save_score", logger: print }),
        remainingSeconds: clampRemainingSeconds(toIntOrThrow(parsed.remainingSeconds, { ctx: "llk_save_remaining_seconds", logger: print })),
        gridValues: normalizeGridValues(parsed.gridValues),
        gameFinished: parsed.gameFinished === true,
      }
      print(`[LlkSave] loaded role_index=${roleIndex} archive_id=${ArchiveKeys.PLAYER_SAVE_JSON} level=${saveRoot.currentLevel} score=${saveRoot.score} remaining=${saveRoot.remainingSeconds} finished=${saveRoot.gameFinished}`)
      return saveRoot
    }
  } catch (e) {
    print(`[LlkSave] load_failed role_index=${roleIndex} err=${tostring(e)}`)
  }
  return null
}

function getRuntimeRoles(): any[] {
  const validRoles = GameAPI.get_all_valid_roles()
  if (validRoles !== null && validRoles !== undefined && validRoles.length > 0) {
    return validRoles as any[]
  }
  return GameAPI.get_all_roles() as any[]
}

function clampRemainingSeconds(value: number): number {
  const seconds = math.floor(value)
  if (seconds < 0) {
    return 0
  }
  if (seconds > LLK_LEVEL_TIME_SECONDS) {
    return LLK_LEVEL_TIME_SECONDS
  }
  return seconds
}

function normalizeGridValues(value: unknown): number[][] {
  const source = value as number[][]
  const gridValues: number[][] = []
  for (let row = 0; row < GRID_ROWS; row += 1) {
    const rowValues: number[] = []
    const sourceRow = source !== null && source !== undefined ? source[row] : undefined
    for (let column = 0; column < GRID_COLUMNS; column += 1) {
      const rawValue = sourceRow !== undefined ? sourceRow[column] : 0
      const numericValue = type(rawValue) === "number" ? (rawValue as number) : 0
      rowValues.push(math.max(0, math.floor(numericValue)))
    }
    gridValues.push(rowValues)
  }
  return gridValues
}
