import { applyRuntimeInputLocks, startRuntimeRoleFreeze } from "./camera"
import { createLlkGameplay } from "./gameplay"
import { createInitialLlkGridData, drawTileGrid, printInitialLlkGridData } from "./grid"
import { hideRuntimeGroundTile } from "./runtime_scene"
import { createGridTileBlocks } from "./visuals"

declare const _G: any

const GAME_INIT_AFTER_CAMERA_SETTLE_FRAMES = 60

print("ts Code")

const initialRoleCount = applyRuntimeInputLocks()
print(`[RuntimeInputLocks] initial_role_count=${initialRoleCount}`)
startRuntimeRoleFreeze()
hideRuntimeGroundTile()

;(LuaAPI as any).call_delay_frame(GAME_INIT_AFTER_CAMERA_SETTLE_FRAMES, () => {
  const settledRoleCount = applyRuntimeInputLocks()
  print(`[RuntimeInputLocks] settled_role_count=${settledRoleCount} init_delay_frames=${GAME_INIT_AFTER_CAMERA_SETTLE_FRAMES}`)
  hideRuntimeGroundTile()
  initializeLlkGame()
})

function initializeLlkGame(): void {
  drawTileGrid()
  const llkInitialGridData = createInitialLlkGridData()
  _G.llkInitialGridData = llkInitialGridData
  printInitialLlkGridData(llkInitialGridData)

  const gameplay = createLlkGameplay(llkInitialGridData)
  createGridTileBlocks(llkInitialGridData, gameplay.handleGridTileClickEvent)
}
