import { lockRuntimeCamera } from "./camera"
import { createLlkGameplay } from "./gameplay"
import { createInitialLlkGridData, drawTileGrid, printInitialLlkGridData } from "./grid"
import { createGridTileBlocks } from "./visuals"

declare const _G: any

print("ts Code")

const initialRoleCount = lockRuntimeCamera()
print(`[CameraLocked] initial_role_count=${initialRoleCount}`)

drawTileGrid()
const llkInitialGridData = createInitialLlkGridData()
_G.llkInitialGridData = llkInitialGridData
printInitialLlkGridData(llkInitialGridData)

const gameplay = createLlkGameplay(llkInitialGridData)
createGridTileBlocks(llkInitialGridData, gameplay.handleGridTileClickEvent)
