import { applyRuntimeInputLocks, raiseRuntimeCameraHeightOnce, startRuntimeRoleFreeze } from "./camera"
import { muteBackgroundAudioOnStart } from "./audio"
import {
  GAME_INIT_GENERATE_DELAY_FRAMES,
  LLK_GAME_FINISHED_TEXT,
  LLK_LEVEL_TIME_SECONDS,
  LLK_MAX_LEVEL,
  LLK_RESTART_TIMEOUT_TEXT,
  LLK_TIMER_UPDATE_FRAMES,
  NEXT_LEVEL_GENERATE_DELAY_FRAMES,
} from "./config"
import { createLlkGameplay, type LlkGameplay } from "./gameplay"
import { createInitialLlkGridData, drawTileGrid, printInitialLlkGridData } from "./grid"
import { initializeLlkHud, setTimerProgress, updateLlkHud, updateScoreLabel } from "./hud"
import { getLlkLevelConfig, normalizeLlkLevel } from "./levels"
import { hideRestartDialog, showRestartDialog } from "./restart_dialog"
import { scheduleRuntimeUnitProbe } from "./runtime_probe"
import { hideRuntimeGroundTile } from "./runtime_scene"
import { loadLlkProgressSnapshot, saveLlkProgressSnapshot, type LlkSaveRoot } from "./save"
import type { LlkGridCell } from "./types"
import { destroyCellVisuals, createGridTileBlocks } from "./visuals"

declare const _G: any

let currentLevel = 1
let currentScore = 0
let currentGrid: LlkGridCell[][] | null = null
let currentGameplay: LlkGameplay | null = null
let levelGenerating = false
let levelTimerToken = 0
let levelStartScore = 0
let currentRemainingSeconds = LLK_LEVEL_TIME_SECONDS

print("ts Code")
_G.llkCurrentLevel = currentLevel
_G.llkCurrentScore = currentScore
muteBackgroundAudioOnStart()

const initialRoleCount = applyRuntimeInputLocks()
print(`[RuntimeInputLocks] initial_role_count=${initialRoleCount}`)
startRuntimeRoleFreeze()
hideRuntimeGroundTile()
scheduleRuntimeUnitProbe("main_start")
showGenerationTips("地图生成中...")

;(LuaAPI as any).call_delay_frame(GAME_INIT_GENERATE_DELAY_FRAMES, () => {
  const settledRoleCount = applyRuntimeInputLocks()
  const cameraRaisedRoles = raiseRuntimeCameraHeightOnce()
  print(`[RuntimeInputLocks] settled_role_count=${settledRoleCount} init_delay_frames=${GAME_INIT_GENERATE_DELAY_FRAMES}`)
  print(`[RuntimeCamera] raised_roles=${cameraRaisedRoles}`)
  hideRuntimeGroundTile()
  scheduleRuntimeUnitProbe("after_init_delay")
  const restoredProgress = restoreProgressOnStart()
  initializeLlkHud()
  updateScoreLabel(currentScore)
  if (restoredProgress !== null && restoredProgress.gameFinished) {
    showGameFinishedRestart()
  } else {
    startLevel(currentLevel, restoredProgress !== null ? restoredProgress.gridValues : null, restoredProgress !== null ? restoredProgress.remainingSeconds : LLK_LEVEL_TIME_SECONDS)
  }
})

function restoreProgressOnStart(): LlkSaveRoot | null {
  const saveRoot = loadLlkProgressSnapshot()
  if (saveRoot === null) {
    print("[LlkSave] start_without_saved_progress level=1 score=0")
    return null
  }

  currentLevel = normalizeLevel(saveRoot.currentLevel)
  currentScore = math.max(0, saveRoot.score)
  currentRemainingSeconds = clampRemainingSeconds(saveRoot.remainingSeconds)
  _G.llkCurrentLevel = currentLevel
  _G.llkCurrentScore = currentScore
  print(`[LlkSave] restored_start level=${currentLevel} score=${currentScore} remaining=${currentRemainingSeconds} finished=${saveRoot.gameFinished}`)
  return saveRoot
}

function startLevel(level: number, restoredGridValues: number[][] | null = null, initialRemainingSeconds = LLK_LEVEL_TIME_SECONDS): void {
  const normalizedLevel = normalizeLevel(level)
  if (levelGenerating) {
    print(`[LlkLevel] generate_ignored level=${normalizedLevel}`)
    return
  }
  levelGenerating = true
  levelTimerToken += 1
  currentLevel = normalizedLevel
  _G.llkCurrentLevel = normalizedLevel
  hideRestartDialog()
  destroyCurrentBoard()
  showGenerationTips(`第 ${normalizedLevel} 关生成中...`)
  currentRemainingSeconds = clampRemainingSeconds(initialRemainingSeconds)
  updateLlkHud(normalizedLevel, currentScore, currentRemainingSeconds)
  ;(LuaAPI as any).call_delay_frame(normalizedLevel === 1 ? 1 : NEXT_LEVEL_GENERATE_DELAY_FRAMES, () => {
    initializeLlkGame(normalizedLevel, restoredGridValues, currentRemainingSeconds)
    levelGenerating = false
  })
}

function initializeLlkGame(level: number, restoredGridValues: number[][] | null, initialRemainingSeconds: number): void {
  const normalizedLevel = normalizeLevel(level)
  const levelConfig = getLlkLevelConfig(normalizedLevel)
  levelStartScore = currentScore
  drawTileGrid()
  const llkInitialGridData = createInitialLlkGridData(
    restoredGridValues !== null
      ? {
          level: normalizedLevel,
          tileKindCount: levelConfig.tileKindCount,
          shufflePasses: levelConfig.shufflePasses,
          map: restoredGridValues,
        }
      : levelConfig,
  )
  currentGrid = llkInitialGridData
  _G.llkInitialGridData = llkInitialGridData
  currentLevel = normalizedLevel
  _G.llkCurrentLevel = normalizedLevel
  printInitialLlkGridData(llkInitialGridData)

  const gameplay = createLlkGameplay(llkInitialGridData, {
    onScore: (delta: number) => {
      currentScore += delta
      _G.llkCurrentScore = currentScore
      updateScoreLabel(currentScore)
      print(`[LlkScore] delta=${delta} total=${currentScore} level=${currentLevel}`)
      resetPairTimerAfterMatch()
      saveCurrentProgress("match")
    },
    onFail: () => {
      levelTimerToken += 1
      currentScore = levelStartScore
      _G.llkCurrentScore = currentScore
      setTimerProgress(0)
      updateScoreLabel(currentScore)
      showGenerationTips(LLK_RESTART_TIMEOUT_TEXT)
      showRestartDialog(currentLevel, () => {
        print(`[LlkLevel] restart_current level=${currentLevel} score=${currentScore}`)
        startLevel(currentLevel)
      })
      print(`[LlkLevel] failed level=${currentLevel} score=${currentScore} reason=timeout restart_dialog=true`)
    },
    onWin: () => {
      levelTimerToken += 1
      if (currentLevel >= LLK_MAX_LEVEL) {
        saveCurrentProgress("game_finished", true)
        showGenerationTips(`${LLK_GAME_FINISHED_TEXT}，积分 ${currentScore}`)
        showRestartDialog(currentLevel, () => {
          restartFromFirstLevel()
        }, LLK_GAME_FINISHED_TEXT)
        print(`[LlkLevel] all_completed max_level=${LLK_MAX_LEVEL} score=${currentScore}`)
        return
      }
      const completedLevel = currentLevel
      const nextLevel = currentLevel + 1
      showGenerationTips(`第 ${completedLevel} 关完成，进入第 ${nextLevel} 关`)
      print(`[LlkLevel] auto_next completed_level=${completedLevel} next_level=${nextLevel} score=${currentScore}`)
      currentLevel = nextLevel
      startLevel(currentLevel)
    },
  })
  currentGameplay = gameplay
  startLevelTimer(normalizedLevel, gameplay, "level_start", initialRemainingSeconds)
  saveCurrentProgress(restoredGridValues !== null ? "restore_start" : "level_start")
  print(`[LlkLevel] started level=${normalizedLevel} source=formal_map value_range=0..${levelConfig.tileKindCount} zero_empty=true time_limit=${LLK_LEVEL_TIME_SECONDS} remaining=${currentRemainingSeconds} score=${currentScore}`)
  createGridTileBlocks(llkInitialGridData, gameplay.handleGridTileClickEvent)
}

function destroyCurrentBoard(): void {
  currentGameplay = null
  if (currentGrid === null) {
    return
  }
  for (let row = 0; row < currentGrid.length; row += 1) {
    for (let column = 0; column < currentGrid[row].length; column += 1) {
      destroyCellVisuals(currentGrid[row][column])
    }
  }
  currentGrid = null
  _G.llkInitialGridData = null
  print("[LlkLevel] old_board_destroyed")
}

function resetPairTimerAfterMatch(): void {
  if (currentGameplay === null || currentGameplay.isCompleted()) {
    return
  }
  startLevelTimer(currentLevel, currentGameplay, "match_reset")
}

function startLevelTimer(level: number, gameplay: LlkGameplay, reason: string, initialRemainingSeconds = LLK_LEVEL_TIME_SECONDS): void {
  const token = levelTimerToken + 1
  levelTimerToken = token
  const remainingSeconds = clampRemainingSeconds(initialRemainingSeconds)
  const startedAt = getRuntimeTimestamp() - (LLK_LEVEL_TIME_SECONDS - remainingSeconds)
  currentRemainingSeconds = remainingSeconds
  updateLlkHud(level, currentScore, remainingSeconds)
  _G.llkLevelStartedAt = startedAt
  _G.llkLevelTimerToken = token
  print(`[LlkTimer] started level=${level} seconds=${LLK_LEVEL_TIME_SECONDS} remaining=${remainingSeconds} token=${token} reason=${reason}`)
  scheduleLevelTimerTick(level, gameplay, token, startedAt)
}

function scheduleLevelTimerTick(level: number, gameplay: LlkGameplay, token: number, startedAt: number): void {
  ;(LuaAPI as any).call_delay_frame(LLK_TIMER_UPDATE_FRAMES, () => {
    tickLevelTimer(level, gameplay, token, startedAt)
  })
}

function tickLevelTimer(level: number, gameplay: LlkGameplay, token: number, startedAt: number): void {
  if (token !== levelTimerToken || currentGameplay !== gameplay || currentLevel !== level) {
    return
  }
  if (gameplay.isCompleted()) {
    return
  }

  const elapsed = getRuntimeTimestamp() - startedAt
  const remainingSeconds = LLK_LEVEL_TIME_SECONDS - elapsed
  currentRemainingSeconds = clampRemainingSeconds(remainingSeconds)
  updateLlkHud(level, currentScore, remainingSeconds)

  if (remainingSeconds <= 0) {
    gameplay.failGame()
    return
  }

  scheduleLevelTimerTick(level, gameplay, token, startedAt)
}

function showGenerationTips(text: string): void {
  const roles = GameAPI.get_all_roles()
  for (let index = 0; index < roles.length; index += 1) {
    const role = roles[index] as any
    try {
      if (role.show_text !== undefined) {
        role.show_text(text, 1.5)
      } else if (role.show_tips !== undefined) {
        role.show_tips(text)
      }
    } catch (e) {
      print(`[LlkLevel] show_generation_tip_failed index=${index} err=${tostring(e)}`)
    }
  }
}

function normalizeLevel(level: number | null | undefined): number {
  return normalizeLlkLevel(level, currentLevel > 0 ? currentLevel : 1)
}

function getRuntimeTimestamp(): number {
  return (GameAPI as any).get_timestamp() as number
}

function saveCurrentProgress(reason: string, gameFinished = false): void {
  if (currentGrid === null) {
    return
  }
  saveLlkProgressSnapshot({
    currentLevel,
    score: currentScore,
    remainingSeconds: currentRemainingSeconds,
    gridValues: exportGridValues(currentGrid),
    gameFinished,
  }, reason)
}

function exportGridValues(grid: LlkGridCell[][]): number[][] {
  const values: number[][] = []
  for (let row = 0; row < grid.length; row += 1) {
    const rowValues: number[] = []
    for (let column = 0; column < grid[row].length; column += 1) {
      rowValues.push(grid[row][column].value)
    }
    values.push(rowValues)
  }
  return values
}

function showGameFinishedRestart(): void {
  showGenerationTips(`${LLK_GAME_FINISHED_TEXT}，积分 ${currentScore}`)
  showRestartDialog(currentLevel, () => {
    restartFromFirstLevel()
  }, LLK_GAME_FINISHED_TEXT)
}

function restartFromFirstLevel(): void {
  currentLevel = 1
  currentScore = 0
  currentRemainingSeconds = LLK_LEVEL_TIME_SECONDS
  _G.llkCurrentLevel = currentLevel
  _G.llkCurrentScore = currentScore
  updateScoreLabel(currentScore)
  print("[LlkLevel] restart_from_first level=1 score=0")
  startLevel(currentLevel)
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
