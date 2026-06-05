import { safeCall } from "@common/engine_safe"
import { toIntOrThrow } from "@common/num"
import {
  LLK_LEVEL_LABEL_NODE_ID,
  LLK_LEVEL_LABEL_NODE_NAME,
  LLK_LEVEL_TIME_SECONDS,
  LLK_SCORE_LABEL_NODE_ID,
  LLK_SCORE_LABEL_NODE_NAME,
  LLK_TIMER_PROGRESS_NODE_ID,
  LLK_TIMER_PROGRESS_NODE_NAME,
} from "./config"

let timerHudDisabled = false
let levelHudDisabled = false
let scoreHudDisabled = false
let timerNode: any | null = null
let levelNode: any | null = null
let scoreNode: any | null = null

function silentHudLogger(_msg: string): void {
}

export function initializeLlkHud(): void {
  timerNode = queryHudNode(LLK_TIMER_PROGRESS_NODE_NAME, "timer")
  levelNode = queryHudNode(LLK_LEVEL_LABEL_NODE_NAME, "level")
  scoreNode = queryHudNode(LLK_SCORE_LABEL_NODE_NAME, "score")
  setTimerProgress(LLK_LEVEL_TIME_SECONDS)
  updateLevelLabel(1)
  updateScoreLabel(0)
}

export function updateLlkHud(level: number, score: number, remainingSeconds: number): void {
  updateLevelLabel(level)
  updateScoreLabel(score)
  setTimerProgress(remainingSeconds)
}

export function updateLevelLabel(level: number): void {
  if (levelHudDisabled) {
    return
  }
  const text = `关卡 ${level}`
  if (levelNode === null) {
    levelHudDisabled = true
    print(`[LlkHud] disabled kind=level node_id=${LLK_LEVEL_LABEL_NODE_ID} name=${LLK_LEVEL_LABEL_NODE_NAME} reason=query_nil`)
    return
  }
  const ok = safeCall(
    () => {
      applyToRoles((role: any) => {
        role.set_label_text(levelNode, text)
      })
      return true
    },
    { tag: "llk_hud_set_level_label", fallback: false, logger: silentHudLogger },
  )
  if (ok !== true) {
    levelHudDisabled = true
    print(`[LlkHud] disabled kind=level node_id=${LLK_LEVEL_LABEL_NODE_ID} reason=set_failed`)
  }
}

export function updateScoreLabel(score: number): void {
  if (scoreHudDisabled) {
    return
  }
  const text = `积分 ${score}`
  if (scoreNode === null) {
    scoreHudDisabled = true
    print(`[LlkHud] disabled kind=score node_id=${LLK_SCORE_LABEL_NODE_ID} name=${LLK_SCORE_LABEL_NODE_NAME} reason=query_nil`)
    return
  }
  const ok = safeCall(
    () => {
      applyToRoles((role: any) => {
        role.set_label_text(scoreNode, text)
      })
      return true
    },
    { tag: "llk_hud_set_score_label", fallback: false, logger: silentHudLogger },
  )
  if (ok !== true) {
    scoreHudDisabled = true
    print(`[LlkHud] disabled kind=score node_id=${LLK_SCORE_LABEL_NODE_ID} reason=set_failed`)
  }
}

export function setTimerProgress(remainingSeconds: number): void {
  if (timerHudDisabled) {
    return
  }
  const current = clampTimerSeconds(remainingSeconds)
  if (timerNode === null) {
    timerHudDisabled = true
    print(`[LlkHud] disabled kind=timer node_id=${LLK_TIMER_PROGRESS_NODE_ID} name=${LLK_TIMER_PROGRESS_NODE_NAME} reason=query_nil`)
    return
  }
  const ok = safeCall(
    () => {
      applyToRoles((role: any) => {
        role.set_progressbar_min(timerNode, 0)
        role.set_progressbar_max(timerNode, LLK_LEVEL_TIME_SECONDS)
        role.set_progressbar_current(timerNode, current)
      })
      return true
    },
    { tag: "llk_hud_set_timer_progress", fallback: false, logger: silentHudLogger },
  )
  if (ok !== true) {
    timerHudDisabled = true
    print(`[LlkHud] disabled kind=timer node_id=${LLK_TIMER_PROGRESS_NODE_ID} reason=set_failed`)
  }
}

function clampTimerSeconds(remainingSeconds: number): number {
  const seconds = toIntOrThrow(remainingSeconds, { ctx: "llk_timer_seconds", logger: print })
  if (seconds < 0) {
    return 0
  }
  if (seconds > LLK_LEVEL_TIME_SECONDS) {
    return LLK_LEVEL_TIME_SECONDS
  }
  return seconds
}

function queryHudNode(nodeName: string, kind: string): any | null {
  const node = safeCall(
    () => {
      return (LuaAPI as any).query_ui_node(nodeName)
    },
    { tag: `llk_hud_query_${kind}`, fallback: null, logger: silentHudLogger },
  )
  return node === undefined ? null : node
}

function applyToRoles(callback: (role: any) => void): void {
  const roles = GameAPI.get_all_roles()
  for (let index = 0; index < roles.length; index += 1) {
    callback(roles[index] as any)
  }
}
