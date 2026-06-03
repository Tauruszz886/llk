import { lockRuntimeCamera } from "./camera"
import { createLlkGameplay } from "./gameplay"
import { createInitialLlkGridData, drawTileGrid, printInitialLlkGridData } from "./grid"
import { createGridTileBlocks } from "./visuals"

declare const _G: any

const GAME_INIT_AFTER_CAMERA_SETTLE_FRAMES = 60

print("ts Code")

const initialRoleCount = lockRuntimeCamera()
print(`[CameraLocked] initial_role_count=${initialRoleCount}`)

;(LuaAPI as any).call_delay_frame(GAME_INIT_AFTER_CAMERA_SETTLE_FRAMES, () => {
  const settledRoleCount = lockRuntimeCamera()
  print(`[CameraLocked] settled_role_count=${settledRoleCount} init_delay_frames=${GAME_INIT_AFTER_CAMERA_SETTLE_FRAMES}`)
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
