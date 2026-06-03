import { safeCall, safeCreateDecoration, safeCreateObstacle, safeDestroySceneUi, safeDestroyUnit } from "@common/engine_safe"

declare const _G: any

function asFixed(value: number): number {
  return value + 0.1 - 0.1
}

const TILE_CENTER = math.Vector3(asFixed(-23.2519999999), asFixed(1), asFixed(0.25))
const CAMERA_BIND_MODE_BIND = 1
const CAMERA_PROJECTION_ORTHOGRAPHIC = 1
const CAMERA_PROP_BIND_MODE_OFFSET_X = 2
const CAMERA_PROP_BIND_MODE_OFFSET_Y = 3
const CAMERA_PROP_BIND_MODE_OFFSET_Z = 4
const CAMERA_PROP_BIND_MODE_PITCH = 5
const CAMERA_PROP_BIND_MODE_YAW = 6
const CAMERA_PROP_DIST = 7
const CAMERA_PROP_ORTHO_VIEW_HEIGHT = 21
const ORTHO_VIEW_HEIGHT_FOR_CANVAS_FRAME = 34.1
const CAMERA_HEIGHT_FOR_CANVAS_FRAME = 15
const GRID_COLUMNS = 19
const GRID_ROWS = 9
const GRID_CELL_SIZE = 2.5
const TILE_CENTER_X = -23.2519999999
const TILE_CENTER_Z = 0.25
const GRID_LINE_Y = 2.05
const GRID_LINE_DURATION = 9999
const GRID_LINES_VISIBLE = true
const GRID_TILE_BLOCK_UNIT_ID = 105205
const GRID_TILE_BLOCK_Y = 2.55
const GRID_TILE_BLOCK_SCALE_X = 2.35
const GRID_TILE_BLOCK_SCALE_Y = 0.35
const GRID_TILE_BLOCK_SCALE_Z = 2.35
const GRID_TILE_BLOCK_COLOR = "BFEFFF"
const GRID_TILE_BLOCK_SELECTED_COLOR = "FFE066"
const GRID_TILE_BLOCKS_PER_FRAME = 20
const GRID_TILE_STICKER_SCALE_Y = 0.2
const EMPTY_GRID_VALUE = 0
const TILE_KIND_COUNT = 10
const GRID_TILE_STICKER_TARGET_SIZE = 2.35
const GRID_TILE_STICKER_SURFACE_OFFSET_Y = 0.22
const GRID_TILE_STICKER_BACKWARD_PITCH = 0
const GRID_TILE_STICKER_RIGHT_YAW = math.pi / 2
const GRID_TILE_STICKERS_PER_FRAME = 20
const GRID_TILE_BUTTON_BASE_LAYER_ID = 1328312114
const GRID_TILE_BUTTON_CIRCLE_LAYER_ID = 1892680078
const GRID_TILE_BUTTON_BASE_NODE_ID = "1328312114"
const GRID_TILE_BUTTON_CIRCLE_NODE_ID = "1892680078"
const GRID_TILE_BUTTON_OFFSET_Y = 0.1
const GRID_TILE_BUTTONS_PER_FRAME = 20
const GRID_TILE_CLICK_PROXY_UNIT_ID = 105205
const GRID_TILE_CLICK_PROXY_SCALE_X = 2.35
const GRID_TILE_CLICK_PROXY_SCALE_Y = 0.05
const GRID_TILE_CLICK_PROXY_SCALE_Z = 2.35
const GRID_TILE_CLICK_PROXY_COLOR = "66FFCC"
const GRID_TILE_CLICK_PROXY_SELECTED_COLOR = "FFE066"
const GRID_TILE_CLICK_PROXIES_PER_FRAME = 20
const TILE_HEIGHT_MARK_DURATION = 9999
const BLOCK_AXIS_SAMPLE_ONLY = false
const LLK_MAX_TURNS = 2

type StickerSource = {
  value: number
  prefabId: number
  name: string
  modelSizeX: number
  modelSizeZ: number
  pitch?: number
}

const STICKER_SOURCES: StickerSource[] = [
  { value: 1, prefabId: 2103040, name: "六角雪花", modelSizeX: 3.0, modelSizeZ: 3.0 },
  { value: 2, prefabId: 200138, name: "八角雪花", modelSizeX: 3.0, modelSizeZ: 3.0 },
  { value: 3, prefabId: 200139, name: "六角雪花2", modelSizeX: 3.0, modelSizeZ: 3.0 },
  { value: 4, prefabId: 2101723, name: "星际", modelSizeX: 2.5, modelSizeZ: 2.5 },
  { value: 5, prefabId: 200572, name: "月牙", modelSizeX: 9.26, modelSizeZ: 9.48 },
  { value: 6, prefabId: 200168, name: "幸运草堆", modelSizeX: 4.0, modelSizeZ: 4.0 },
  { value: 7, prefabId: 200053, name: "奇异果实", modelSizeX: 3.0, modelSizeZ: 3.0 },
  { value: 8, prefabId: 2101687, name: "甜甜圈", modelSizeX: 2.5, modelSizeZ: 2.5 },
  { value: 9, prefabId: 200357, name: "糖果", modelSizeX: 2.5, modelSizeZ: 2.5 },
  { value: 10, prefabId: 200358, name: "甜心蝴蝶结", modelSizeX: 2.5, modelSizeZ: 2.5 },
]

type GridBounds = {
  xMin: number
  xMax: number
  zMin: number
  zMax: number
}

type LlkGridCell = {
  row: number
  column: number
  x: number
  z: number
  value: number
  matched: boolean
  tileUnit: any
  stickerUnit: any
  buttonLayer: any
  buttonCircleLayer: any
  buttonNode: any
  buttonPosition: Vector3 | null
  stickerPitch: number
  clickProxyUnit: any
  tileTouchRegistered: boolean
  clickProxyTouchRegistered: boolean
  buttonTouchBindingCount: number
}

type TileHeightLevels = {
  bottomY: number
  middleY: number
  topY: number
}

type PathDirection = {
  rowDelta: number
  columnDelta: number
}

type PathSearchState = {
  row: number
  column: number
  direction: number
  turns: number
}

const PATH_DIRECTIONS: PathDirection[] = [
  { rowDelta: -1, columnDelta: 0 },
  { rowDelta: 1, columnDelta: 0 },
  { rowDelta: 0, columnDelta: -1 },
  { rowDelta: 0, columnDelta: 1 },
]

let selectedCell: LlkGridCell | null = null
let matchedTileCount = 0
let gridClickLocked = false

function getGridBounds(): GridBounds {
  return {
    xMin: TILE_CENTER_X - (GRID_COLUMNS * GRID_CELL_SIZE) / 2,
    xMax: TILE_CENTER_X + (GRID_COLUMNS * GRID_CELL_SIZE) / 2,
    zMin: TILE_CENTER_Z - (GRID_ROWS * GRID_CELL_SIZE) / 2,
    zMax: TILE_CENTER_Z + (GRID_ROWS * GRID_CELL_SIZE) / 2,
  }
}

print("ts Code")

function applyCanvasFramingCamera(role: any): void {
  safeCall(
    () => {
      role.set_camera_draggable(false)
      return true
    },
    { tag: "disable_camera_draggable", fallback: false, logger: print },
  )

  safeCall(
    () => {
      role.set_camera_rotation_sync_enabled(false)
      return true
    },
    { tag: "disable_camera_rotation_sync", fallback: false, logger: print },
  )

  safeCall(
    () => {
      role.set_camera_gyroscope_control_enabled(false)
      return true
    },
    { tag: "disable_camera_gyroscope", fallback: false, logger: print },
  )

  safeCall(
    () => {
      role.pause_camera_motor()
      return true
    },
    { tag: "pause_camera_motor", fallback: false, logger: print },
  )

  safeCall(
    () => {
      role.stop_camera_motor()
      return true
    },
    { tag: "stop_camera_motor", fallback: false, logger: print },
  )

  safeCall(
    () => {
      role.set_camera_bind_mode(CAMERA_BIND_MODE_BIND)
      return true
    },
    { tag: "set_camera_bind_mode_bind", fallback: false, logger: print },
  )

  safeCall(
    () => {
      role.set_camera_projection_type(CAMERA_PROJECTION_ORTHOGRAPHIC)
      return true
    },
    { tag: "set_camera_projection_orthographic", fallback: false, logger: print },
  )

  safeCall(
    () => {
      role.set_camera_lock_position(TILE_CENTER)
      return true
    },
    { tag: "set_camera_lock_position_tile_center", fallback: false, logger: print },
  )

  safeCall(
    () => {
      role.set_camera_property(CAMERA_PROP_BIND_MODE_OFFSET_X, asFixed(0))
      role.set_camera_property(CAMERA_PROP_BIND_MODE_OFFSET_Y, asFixed(CAMERA_HEIGHT_FOR_CANVAS_FRAME))
      role.set_camera_property(CAMERA_PROP_BIND_MODE_OFFSET_Z, asFixed(0))
      role.set_camera_property(CAMERA_PROP_BIND_MODE_PITCH, asFixed(90))
      role.set_camera_property(CAMERA_PROP_BIND_MODE_YAW, asFixed(0))
      role.set_camera_property(CAMERA_PROP_DIST, asFixed(CAMERA_HEIGHT_FOR_CANVAS_FRAME))
      role.set_camera_property(CAMERA_PROP_ORTHO_VIEW_HEIGHT, asFixed(ORTHO_VIEW_HEIGHT_FOR_CANVAS_FRAME))
      return true
    },
    { tag: "set_locked_canvas_camera_properties", fallback: false, logger: print },
  )
}

function disableJoystickControl(role: any): void {
  safeCall(
    () => {
      role.set_role_ctrl_enabled(false)
      return true
    },
    { tag: "disable_role_ctrl_enabled", fallback: false, logger: print },
  )

  safeCall(
    () => {
      role.set_role_ctrl(false)
      return true
    },
    { tag: "disable_role_ctrl", fallback: false, logger: print },
  )

  safeCall(
    () => {
      const ctrlUnit = role.get_ctrl_unit()
      if (ctrlUnit !== null && ctrlUnit !== undefined) {
        ctrlUnit.set_aim_move_enabled(false)
        ctrlUnit.set_aim_move_mode(false)
      }
      return true
    },
    { tag: "disable_character_aim_move", fallback: false, logger: print },
  )

}

const roles = GameAPI.get_all_roles()
for (let index = 0; index < roles.length; index += 1) {
  applyCanvasFramingCamera(roles[index] as any)
  disableJoystickControl(roles[index] as any)
}

function refreshCanvasLock(attempt: number): void {
  const currentRoles = GameAPI.get_all_roles()
  for (let index = 0; index < currentRoles.length; index += 1) {
    applyCanvasFramingCamera(currentRoles[index] as any)
    disableJoystickControl(currentRoles[index] as any)
  }
  print(`[CameraLocked] attempt=${attempt} role_count=${currentRoles.length}`)

  if (attempt < 5) {
    ;(LuaAPI as any).call_delay_frame(30, () => {
      refreshCanvasLock(attempt + 1)
    })
  }
}

refreshCanvasLock(1)

function drawGridLine(startX: number, startZ: number, endX: number, endZ: number, color: any): void {
  ;(GameAPI as any).draw_line(
    math.Vector3(asFixed(startX), asFixed(GRID_LINE_Y), asFixed(startZ)),
    math.Vector3(asFixed(endX), asFixed(GRID_LINE_Y), asFixed(endZ)),
    color,
    asFixed(GRID_LINE_DURATION),
  )
}

function drawTileGrid(): void {
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

function shuffleValues(values: number[]): void {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = (GameAPI as any).random_int(0, index) as number
    const value = values[index]
    values[index] = values[swapIndex]
    values[swapIndex] = value
  }
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

function createInitialLlkGridData(): LlkGridCell[][] {
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

function printGridValueCounts(grid: LlkGridCell[][]): void {
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

function printInitialLlkGridData(grid: LlkGridCell[][]): void {
  for (let row = 0; row < grid.length; row += 1) {
    let rowValues = ""
    for (let column = 0; column < grid[row].length; column += 1) {
      const value = grid[row][column].value
      rowValues = `${rowValues}${column === 0 ? "" : ","}${value}`
    }
    print(`[LlkGridData] row_${row}=${rowValues}`)
  }
}

function createGridTileBlock(cell: LlkGridCell): any {
  if (cell.value === EMPTY_GRID_VALUE) {
    return null
  }

  const created = safeCreateObstacle(
    GRID_TILE_BLOCK_UNIT_ID,
    math.Vector3(asFixed(cell.x), asFixed(GRID_TILE_BLOCK_Y), asFixed(cell.z)),
    math.Vector3(asFixed(GRID_TILE_BLOCK_SCALE_X), asFixed(GRID_TILE_BLOCK_SCALE_Y), asFixed(GRID_TILE_BLOCK_SCALE_Z)),
    { tag: "llk_grid_tile_block", logger: print },
  )
  if (created !== null && created !== undefined) {
    setGridTileBlockColor(created)
  }
  return created
}

function setGridTileBlockColor(unit: any): void {
  setGridTileBlockPaintColor(unit, GRID_TILE_BLOCK_COLOR)
}

function setGridTileBlockPaintColor(unit: any, colorText: string): void {
  const color = GlobalAPI.str_to_color(colorText)
  for (let area = 1; area <= 4; area += 1) {
    safeCall(
      () => {
        unit.set_paint_area_color(area, color)
        return true
      },
      { tag: `llk_grid_tile_block_color_area_${area}`, fallback: false, logger: print },
    )
  }
}

function flattenGridCells(grid: LlkGridCell[][]): LlkGridCell[] {
  const cells: LlkGridCell[] = []
  for (let row = 0; row < grid.length; row += 1) {
    for (let column = 0; column < grid[row].length; column += 1) {
      cells.push(grid[row][column])
    }
  }
  return cells
}

function createGridTileBlocksBatch(cells: LlkGridCell[], startIndex: number, createdCount: number): void {
  let created = createdCount
  const endIndex = startIndex + GRID_TILE_BLOCKS_PER_FRAME
  for (let index = startIndex; index < cells.length && index < endIndex; index += 1) {
    const cell = cells[index]
    cell.tileUnit = createGridTileBlock(cell)
    if (cell.tileUnit !== null && cell.tileUnit !== undefined) {
      created += 1
      cell.tileTouchRegistered = registerGridTileUnitTouch(cell, cell.tileUnit, "block")
    }
  }

  if (endIndex < cells.length) {
    ;(LuaAPI as any).call_delay_frame(1, () => {
      createGridTileBlocksBatch(cells, endIndex, created)
    })
  } else {
    print(`[GridTileBlocks] created=${created}/${GRID_ROWS * GRID_COLUMNS} unit_id=${GRID_TILE_BLOCK_UNIT_ID} scale=(${GRID_TILE_BLOCK_SCALE_X},${GRID_TILE_BLOCK_SCALE_Y},${GRID_TILE_BLOCK_SCALE_Z}) per_frame=${GRID_TILE_BLOCKS_PER_FRAME}`)
    drawTileHeightMarkers(cells)
    createGridTileSurfaceStickers(cells)
  }
}

function createGridTileBlocks(grid: LlkGridCell[][]): void {
  const cells = flattenGridCells(grid)
  createGridTileBlocksBatch(cells, 0, 0)
}

function getStickerSourceByValue(value: number): StickerSource {
  const index = value - 1
  const source = STICKER_SOURCES[index]
  if (source !== undefined) {
    return source
  }
  return STICKER_SOURCES[0]
}

function getStickerScale(source: StickerSource): number {
  const maxSize = math.max(source.modelSizeX, source.modelSizeZ)
  if (maxSize <= 0) {
    return 1
  }
  return GRID_TILE_STICKER_TARGET_SIZE / maxSize
}

function getTileHeightLevels(cell: LlkGridCell): TileHeightLevels {
  const position = safeCall(
    () => {
      return cell.tileUnit.get_position()
    },
    { tag: "llk_get_tile_position", fallback: null, logger: print },
  )
  const scale = safeCall(
    () => {
      return cell.tileUnit.get_scale()
    },
    { tag: "llk_get_tile_scale", fallback: null, logger: print },
  )
  const tileX = position !== null && position !== undefined ? position.x : cell.x
  const tileY = position !== null && position !== undefined ? position.y : GRID_TILE_BLOCK_Y
  const tileZ = position !== null && position !== undefined ? position.z : cell.z
  const tileScaleY = scale !== null && scale !== undefined ? scale.y : GRID_TILE_BLOCK_SCALE_Y
  return {
    bottomY: tileY - tileScaleY * 0.5,
    middleY: tileY,
    topY: tileY + tileScaleY * 0.5,
  }
}

function getTileSurfacePosition(cell: LlkGridCell): Vector3 {
  const position = safeCall(
    () => {
      return cell.tileUnit.get_position()
    },
    { tag: "llk_get_tile_surface_position", fallback: null, logger: print },
  )
  const levels = getTileHeightLevels(cell)
  const tileX = position !== null && position !== undefined ? position.x : cell.x
  const tileZ = position !== null && position !== undefined ? position.z : cell.z
  const topY = levels.topY + GRID_TILE_STICKER_SURFACE_OFFSET_Y
  return math.Vector3(asFixed(tileX), asFixed(topY), asFixed(tileZ))
}

function getTileButtonPosition(cell: LlkGridCell): Vector3 {
  const stickerPosition = safeCall(
    () => {
      return cell.stickerUnit.get_position()
    },
    { tag: "llk_get_tile_button_sticker_position", fallback: null, logger: print },
  )
  const basePosition = stickerPosition !== null && stickerPosition !== undefined ? stickerPosition : getTileSurfacePosition(cell)
  return math.Vector3(asFixed(basePosition.x), asFixed(basePosition.y + GRID_TILE_BUTTON_OFFSET_Y), asFixed(basePosition.z))
}

function drawHorizontalAxes(bounds: GridBounds, y: number, color: any): void {
  const centerX = (bounds.xMin + bounds.xMax) * 0.5
  const centerZ = (bounds.zMin + bounds.zMax) * 0.5
  ;(GameAPI as any).draw_line(math.Vector3(asFixed(bounds.xMin), asFixed(y), asFixed(centerZ)), math.Vector3(asFixed(bounds.xMax), asFixed(y), asFixed(centerZ)), color, asFixed(TILE_HEIGHT_MARK_DURATION))
  ;(GameAPI as any).draw_line(math.Vector3(asFixed(centerX), asFixed(y), asFixed(bounds.zMin)), math.Vector3(asFixed(centerX), asFixed(y), asFixed(bounds.zMax)), color, asFixed(TILE_HEIGHT_MARK_DURATION))
}

function isBlockAxisSampleCell(cell: LlkGridCell): boolean {
  if (!BLOCK_AXIS_SAMPLE_ONLY) {
    return true
  }
  return (
    (cell.row === 0 && cell.column === 0) ||
    (cell.row === 0 && cell.column === GRID_COLUMNS - 1) ||
    (cell.row === GRID_ROWS - 1 && cell.column === 0) ||
    (cell.row === GRID_ROWS - 1 && cell.column === GRID_COLUMNS - 1) ||
    (cell.row === math.floor(GRID_ROWS * 0.5) && cell.column === math.floor(GRID_COLUMNS * 0.5))
  )
}

function drawBlockAxes(cell: LlkGridCell, levels: TileHeightLevels, colorBottom: any, colorMiddle: any, colorTop: any): void {
  if (!isBlockAxisSampleCell(cell)) {
    return
  }

  const position = safeCall(
    () => {
      return cell.tileUnit.get_position()
    },
    { tag: "llk_get_block_axis_position", fallback: null, logger: print },
  )
  const scale = safeCall(
    () => {
      return cell.tileUnit.get_scale()
    },
    { tag: "llk_get_block_axis_scale", fallback: null, logger: print },
  )
  const centerX = position !== null && position !== undefined ? position.x : cell.x
  const centerZ = position !== null && position !== undefined ? position.z : cell.z
  const halfX = (scale !== null && scale !== undefined ? scale.x : GRID_TILE_BLOCK_SCALE_X) * 0.5
  const halfZ = (scale !== null && scale !== undefined ? scale.z : GRID_TILE_BLOCK_SCALE_Z) * 0.5

  drawBlockAxesAtY(centerX, centerZ, halfX, halfZ, levels.bottomY, colorBottom)
  drawBlockAxesAtY(centerX, centerZ, halfX, halfZ, levels.middleY, colorMiddle)
  drawBlockAxesAtY(centerX, centerZ, halfX, halfZ, levels.topY, colorTop)
}

function drawBlockAxesAtY(centerX: number, centerZ: number, halfX: number, halfZ: number, y: number, color: any): void {
  ;(GameAPI as any).draw_line(math.Vector3(asFixed(centerX - halfX), asFixed(y), asFixed(centerZ)), math.Vector3(asFixed(centerX + halfX), asFixed(y), asFixed(centerZ)), color, asFixed(TILE_HEIGHT_MARK_DURATION))
  ;(GameAPI as any).draw_line(math.Vector3(asFixed(centerX), asFixed(y), asFixed(centerZ - halfZ)), math.Vector3(asFixed(centerX), asFixed(y), asFixed(centerZ + halfZ)), color, asFixed(TILE_HEIGHT_MARK_DURATION))
}

function drawTileHeightMarkers(cells: LlkGridCell[]): void {
  const first = cells[0]
  if (first === undefined || first.tileUnit === null || first.tileUnit === undefined) {
    return
  }

  const levels = getTileHeightLevels(first)
  const bounds = getGridBounds()
  const bottomColor = GlobalAPI.str_to_color("FF3333")
  const middleColor = GlobalAPI.str_to_color("33FF33")
  const topColor = GlobalAPI.str_to_color("3399FF")
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index]
    if (cell.tileUnit !== null && cell.tileUnit !== undefined) {
      drawBlockAxes(cell, getTileHeightLevels(cell), bottomColor, middleColor, topColor)
    }
  }
  ;(GameAPI as any).draw_text(math.Vector3(asFixed(bounds.xMin), asFixed(levels.bottomY), asFixed(bounds.zMin)), `bottomY=${levels.bottomY}`)
  ;(GameAPI as any).draw_text(math.Vector3(asFixed(bounds.xMin), asFixed(levels.middleY), asFixed(bounds.zMin)), `middleY=${levels.middleY}`)
  ;(GameAPI as any).draw_text(math.Vector3(asFixed(bounds.xMin), asFixed(levels.topY), asFixed(bounds.zMin)), `topY=${levels.topY}`)
  print(`[TileHeightMarkers] bottomY=${levels.bottomY} middleY=${levels.middleY} topY=${levels.topY} stickerY=${levels.topY + GRID_TILE_STICKER_SURFACE_OFFSET_Y}`)
}

function createGridTileSurfaceSticker(cell: LlkGridCell): boolean {
  if (cell.value === EMPTY_GRID_VALUE || cell.tileUnit === null || cell.tileUnit === undefined) {
    return false
  }

  const source = getStickerSourceByValue(cell.value)
  const position = getTileSurfacePosition(cell)
  const stickerScale = getStickerScale(source)
  const stickerPitch = source.pitch !== undefined ? source.pitch : GRID_TILE_STICKER_BACKWARD_PITCH
  const created = safeCreateDecoration(
    source.prefabId,
    position,
    math.Quaternion(asFixed(stickerPitch), asFixed(GRID_TILE_STICKER_RIGHT_YAW), asFixed(0)),
    math.Vector3(asFixed(stickerScale), asFixed(GRID_TILE_STICKER_SCALE_Y), asFixed(stickerScale)),
    undefined,
    { tag: "llk_create_tile_surface_sticker", logger: print },
  )

  if (created === null || created === undefined) {
    return false
  }

  cell.stickerUnit = created
  cell.stickerPitch = stickerPitch
  return true
}

function createGridTileSurfaceStickersBatch(cells: LlkGridCell[], startIndex: number, createdCount: number): void {
  let created = createdCount
  const endIndex = startIndex + GRID_TILE_STICKERS_PER_FRAME
  for (let index = startIndex; index < cells.length && index < endIndex; index += 1) {
    if (createGridTileSurfaceSticker(cells[index])) {
      created += 1
    }
  }

  if (endIndex < cells.length) {
    ;(LuaAPI as any).call_delay_frame(1, () => {
      createGridTileSurfaceStickersBatch(cells, endIndex, created)
    })
  } else {
    print(`[GridTileSurfaceStickers] created=${created}/${GRID_ROWS * GRID_COLUMNS} target_size=${GRID_TILE_STICKER_TARGET_SIZE} surface_offset_y=${GRID_TILE_STICKER_SURFACE_OFFSET_Y} rotation_pitch=${GRID_TILE_STICKER_BACKWARD_PITCH} rotation_yaw=${GRID_TILE_STICKER_RIGHT_YAW} per_frame=${GRID_TILE_STICKERS_PER_FRAME}`)
    createGridTileClickProxies(cells)
  }
}

function printStickerSources(): void {
  for (let index = 0; index < STICKER_SOURCES.length; index += 1) {
    const source = STICKER_SOURCES[index]
    const stickerPitch = source.pitch !== undefined ? source.pitch : GRID_TILE_STICKER_BACKWARD_PITCH
    print(`[GridTileStickerSource] value=${source.value} prefab_id=${source.prefabId} name=${source.name} model_size_xz=(${source.modelSizeX},${source.modelSizeZ}) scale=${getStickerScale(source)} pitch=${stickerPitch}`)
  }
}

function createGridTileSurfaceStickers(cells: LlkGridCell[]): void {
  printStickerSources()
  createGridTileSurfaceStickersBatch(cells, 0, 0)
}

function isSameGridCell(first: LlkGridCell, second: LlkGridCell): boolean {
  return first.row === second.row && first.column === second.column
}

function isPlayableCell(cell: LlkGridCell): boolean {
  return cell.value !== EMPTY_GRID_VALUE && !cell.matched
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

function canLinkCells(grid: LlkGridCell[][], first: LlkGridCell, second: LlkGridCell): boolean {
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

function setCellSelected(cell: LlkGridCell, selected: boolean): void {
  if (cell.matched) {
    return
  }
  if (cell.tileUnit !== null && cell.tileUnit !== undefined) {
    setGridTileBlockPaintColor(cell.tileUnit, selected ? GRID_TILE_BLOCK_SELECTED_COLOR : GRID_TILE_BLOCK_COLOR)
  }
  if (cell.clickProxyUnit !== null && cell.clickProxyUnit !== undefined) {
    setGridTileBlockPaintColor(cell.clickProxyUnit, selected ? GRID_TILE_CLICK_PROXY_SELECTED_COLOR : GRID_TILE_CLICK_PROXY_COLOR)
  }
}

function destroyCellVisuals(cell: LlkGridCell): void {
  if (cell.clickProxyUnit !== null && cell.clickProxyUnit !== undefined) {
    safeDestroyUnit(cell.clickProxyUnit, { tag: "llk_destroy_matched_click_proxy", logger: print })
    cell.clickProxyUnit = null
  }
  if (cell.tileUnit !== null && cell.tileUnit !== undefined) {
    safeDestroyUnit(cell.tileUnit, { tag: "llk_destroy_matched_tile", logger: print })
    cell.tileUnit = null
  }
  if (cell.stickerUnit !== null && cell.stickerUnit !== undefined) {
    safeDestroyUnit(cell.stickerUnit, { tag: "llk_destroy_matched_sticker", logger: print })
    cell.stickerUnit = null
  }
  if (cell.buttonLayer !== null && cell.buttonLayer !== undefined) {
    safeDestroySceneUi(cell.buttonLayer, { tag: "llk_destroy_matched_button_base", logger: print })
    cell.buttonLayer = null
  }
  if (cell.buttonCircleLayer !== null && cell.buttonCircleLayer !== undefined) {
    safeDestroySceneUi(cell.buttonCircleLayer, { tag: "llk_destroy_matched_button_circle", logger: print })
    cell.buttonCircleLayer = null
  }
  cell.buttonNode = null
  cell.buttonPosition = null
  cell.clickProxyTouchRegistered = false
}

function matchCells(first: LlkGridCell, second: LlkGridCell): void {
  const matchedValue = first.value
  first.matched = true
  second.matched = true
  first.value = EMPTY_GRID_VALUE
  second.value = EMPTY_GRID_VALUE
  destroyCellVisuals(first)
  destroyCellVisuals(second)
  selectedCell = null
  matchedTileCount += 2
  print(`[LlkMatch] removed first=(${first.row},${first.column}) second=(${second.row},${second.column}) value=${matchedValue} matched=${matchedTileCount}/${GRID_ROWS * GRID_COLUMNS - 1}`)
}

function handleGridTileClick(cell: LlkGridCell, touchSource: string): void {
  print(`[GridTileButtonTouch] source=${touchSource} row=${cell.row} column=${cell.column} value=${cell.value} matched=${cell.matched}`)

  if (!isPlayableCell(cell)) {
    return
  }

  if (selectedCell === null) {
    selectedCell = cell
    setCellSelected(cell, true)
    print(`[LlkSelect] first row=${cell.row} column=${cell.column} value=${cell.value}`)
    return
  }

  if (isSameGridCell(selectedCell, cell)) {
    setCellSelected(selectedCell, false)
    print(`[LlkSelect] cancel row=${cell.row} column=${cell.column}`)
    selectedCell = null
    return
  }

  const first = selectedCell
  if (first.value !== cell.value) {
    setCellSelected(first, false)
    selectedCell = cell
    setCellSelected(cell, true)
    print(`[LlkSelect] switch row=${cell.row} column=${cell.column} value=${cell.value}`)
    return
  }

  if (canLinkCells(llkInitialGridData, first, cell)) {
    matchCells(first, cell)
    return
  }

  setCellSelected(first, false)
  selectedCell = cell
  setCellSelected(cell, true)
  print(`[LlkSelect] path_failed_switch row=${cell.row} column=${cell.column} value=${cell.value}`)
}

function handleGridTileClickEvent(cell: LlkGridCell, touchSource: string): void {
  if (gridClickLocked) {
    print(`[GridTileButtonTouch] duplicate_ignored source=${touchSource} row=${cell.row} column=${cell.column}`)
    return
  }

  gridClickLocked = true
  ;(LuaAPI as any).call_delay_frame(1, () => {
    gridClickLocked = false
  })
  handleGridTileClick(cell, touchSource)
}

function registerGridTileButtonTouch(cell: LlkGridCell, touchTarget: any, touchSource: string): boolean {
  if (touchTarget === null || touchTarget === undefined) {
    return false
  }

  return safeCall(
    () => {
      ;(LuaAPI as any).global_register_trigger_event([EVENT.EUI_NODE_TOUCH_EVENT, touchTarget, 1], (_eventName: string, _actor: unknown, _eventData: unknown) => {
        handleGridTileClickEvent(cell, touchSource)
      })
      return true
    },
    { tag: "llk_register_grid_tile_button_touch", fallback: false, logger: print },
  ) === true
}

function registerGridTileUnitTouch(cell: LlkGridCell, touchTarget: any, touchSource: string): boolean {
  if (touchTarget === null || touchTarget === undefined) {
    return false
  }

  return safeCall(
    () => {
      ;(LuaAPI as any).unit_register_trigger_event(touchTarget, [EVENT.SPEC_OBSTACLE_TOUCH_BEGIN], (_eventName: string, _actor: unknown, _eventData: unknown) => {
        handleGridTileClickEvent(cell, touchSource)
      })
      return true
    },
    { tag: `llk_register_grid_tile_unit_touch_${touchSource}`, fallback: false, logger: print },
  ) === true
}

function auditGridTileBindings(cells: LlkGridCell[]): void {
  let playable = 0
  let missingTile = 0
  let missingSticker = 0
  let missingButton = 0
  let missingClickProxy = 0
  let badTileXZ = 0
  let badStickerXZ = 0
  let badButtonXZ = 0
  let badClickProxyXZ = 0
  let missingTileTouch = 0
  let missingClickProxyTouch = 0
  let missingButtonTouch = 0
  let fullButtonTouch = 0
  const bounds = getGridBounds()

  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index]
    if (cell.value === EMPTY_GRID_VALUE || cell.matched) {
      continue
    }

    playable += 1
    const expectedX = bounds.xMin + GRID_CELL_SIZE * (cell.column + 0.5)
    const expectedZ = bounds.zMin + GRID_CELL_SIZE * (cell.row + 0.5)
    if (cell.tileUnit === null || cell.tileUnit === undefined) {
      missingTile += 1
    } else {
      const tilePosition = safeCall(
        () => {
          return cell.tileUnit.get_position()
        },
        { tag: "llk_audit_tile_position", fallback: null, logger: print },
      )
      if (tilePosition !== null && tilePosition !== undefined && (math.abs(tilePosition.x - expectedX) > 0.01 || math.abs(tilePosition.z - expectedZ) > 0.01)) {
        badTileXZ += 1
      }
    }

    if (cell.stickerUnit === null || cell.stickerUnit === undefined) {
      missingSticker += 1
    } else {
      const stickerPosition = safeCall(
        () => {
          return cell.stickerUnit.get_position()
        },
        { tag: "llk_audit_sticker_position", fallback: null, logger: print },
      )
      if (stickerPosition !== null && stickerPosition !== undefined && (math.abs(stickerPosition.x - expectedX) > 0.01 || math.abs(stickerPosition.z - expectedZ) > 0.01)) {
        badStickerXZ += 1
      }
    }

    if (cell.buttonLayer === null || cell.buttonLayer === undefined || cell.buttonNode === null || cell.buttonNode === undefined || cell.buttonPosition === null) {
      missingButton += 1
    } else if (math.abs(cell.buttonPosition.x - expectedX) > 0.01 || math.abs(cell.buttonPosition.z - expectedZ) > 0.01) {
      badButtonXZ += 1
    }

    if (cell.clickProxyUnit === null || cell.clickProxyUnit === undefined) {
      missingClickProxy += 1
    } else {
      const clickProxyPosition = safeCall(
        () => {
          return cell.clickProxyUnit.get_position()
        },
        { tag: "llk_audit_click_proxy_position", fallback: null, logger: print },
      )
      if (clickProxyPosition !== null && clickProxyPosition !== undefined && (math.abs(clickProxyPosition.x - expectedX) > 0.01 || math.abs(clickProxyPosition.z - expectedZ) > 0.01)) {
        badClickProxyXZ += 1
      }
    }

    if (!cell.tileTouchRegistered) {
      missingTileTouch += 1
    }
    if (!cell.clickProxyTouchRegistered) {
      missingClickProxyTouch += 1
    }
    if (cell.buttonTouchBindingCount <= 0) {
      missingButtonTouch += 1
    }
    if (cell.buttonTouchBindingCount >= 3) {
      fullButtonTouch += 1
    }
  }

  print(`[GridTileBindingAudit] playable=${playable} missingTile=${missingTile} missingSticker=${missingSticker} missingButton=${missingButton} missingClickProxy=${missingClickProxy} badTileXZ=${badTileXZ} badStickerXZ=${badStickerXZ} badButtonXZ=${badButtonXZ} badClickProxyXZ=${badClickProxyXZ} missingTileTouch=${missingTileTouch} missingClickProxyTouch=${missingClickProxyTouch} missingButtonTouch=${missingButtonTouch} fullButtonTouch=${fullButtonTouch}`)
}

function getRuntimeRoles(): any[] {
  const currentRoles = safeCall(
    () => {
      return GameAPI.get_all_roles()
    },
    { tag: "llk_get_runtime_roles", fallback: [], logger: print },
  )
  return currentRoles !== null && currentRoles !== undefined ? (currentRoles as any[]) : []
}

function showGridTileButtonLayer(layer: any): void {
  if (layer === null || layer === undefined) {
    return
  }

  const currentRoles = getRuntimeRoles()
  for (let index = 0; index < currentRoles.length; index += 1) {
    const role = currentRoles[index] as any
    safeCall(
      () => {
        ;(GameAPI as any).set_scene_ui_visible(layer, role, true)
        return true
      },
      { tag: "llk_show_grid_tile_button_layer", fallback: false, logger: print },
    )
  }
}

function getGridTileButtonNode(layer: any, nodeId: string): any {
  if (layer === null || layer === undefined) {
    return null
  }

  return safeCall(
    () => {
      return (GameAPI as any).get_eui_node_at_scene_ui(layer, nodeId)
    },
    { tag: "llk_get_grid_tile_button_node", fallback: null, logger: print },
  )
}

function showGridTileButtonNode(node: any): void {
  if (node === null || node === undefined) {
    return
  }

  const currentRoles = getRuntimeRoles()
  for (let index = 0; index < currentRoles.length; index += 1) {
    const role = currentRoles[index] as any
    safeCall(
      () => {
        role.set_node_visible(node, true)
        role.set_ui_opacity(node, asFixed(255))
        role.set_node_touch_enabled(node, true)
        return true
      },
      { tag: "llk_show_grid_tile_button_node", fallback: false, logger: print },
    )
  }
}

function refreshGridTileButtonVisibility(cells: LlkGridCell[], attempt: number): void {
  const currentRoles = getRuntimeRoles()
  let refreshed = 0
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index]
    if (cell.buttonLayer !== null && cell.buttonLayer !== undefined) {
      showGridTileButtonLayer(cell.buttonLayer)
      showGridTileButtonNode(cell.buttonNode)
      refreshed += 1
    }
  }
  print(`[GridTileButtonVisibility] attempt=${attempt} roles=${currentRoles.length} refreshed=${refreshed}`)

  if (attempt < 3) {
    ;(LuaAPI as any).call_delay_frame(30, () => {
      refreshGridTileButtonVisibility(cells, attempt + 1)
    })
  }
}

function createGridTileButton(cell: LlkGridCell): boolean {
  if (cell.value === EMPTY_GRID_VALUE || cell.tileUnit === null || cell.tileUnit === undefined) {
    return false
  }

  const position = getTileButtonPosition(cell)
  cell.buttonPosition = position
  const baseLayer = safeCall(
    () => {
      return (GameAPI as any).create_scene_ui_at_point(GRID_TILE_BUTTON_BASE_LAYER_ID, position, asFixed(GRID_LINE_DURATION))
    },
    { tag: "llk_create_grid_tile_button_base_layer", fallback: null, logger: print },
  )

  if (baseLayer === null || baseLayer === undefined) {
    return false
  }

  const baseNode = getGridTileButtonNode(baseLayer, GRID_TILE_BUTTON_BASE_NODE_ID)
  const circleNode = getGridTileButtonNode(baseLayer, GRID_TILE_BUTTON_CIRCLE_NODE_ID)
  const buttonNode = circleNode !== null && circleNode !== undefined ? circleNode : baseNode
  cell.buttonLayer = baseLayer
  cell.buttonCircleLayer = null
  cell.buttonNode = buttonNode
  showGridTileButtonLayer(baseLayer)
  showGridTileButtonNode(baseNode)
  showGridTileButtonNode(circleNode)
  cell.buttonTouchBindingCount = 0
  if (registerGridTileButtonTouch(cell, baseLayer, "ui-layer")) {
    cell.buttonTouchBindingCount += 1
  }
  if (registerGridTileButtonTouch(cell, baseNode, "ui-base")) {
    cell.buttonTouchBindingCount += 1
  }
  if (registerGridTileButtonTouch(cell, circleNode, "ui-circle")) {
    cell.buttonTouchBindingCount += 1
  }
  return true
}

function createGridTileClickProxy(cell: LlkGridCell): boolean {
  if (cell.value === EMPTY_GRID_VALUE || cell.stickerUnit === null || cell.stickerUnit === undefined) {
    return false
  }

  const position = getTileButtonPosition(cell)
  const created = safeCreateObstacle(
    GRID_TILE_CLICK_PROXY_UNIT_ID,
    position,
    math.Vector3(asFixed(GRID_TILE_CLICK_PROXY_SCALE_X), asFixed(GRID_TILE_CLICK_PROXY_SCALE_Y), asFixed(GRID_TILE_CLICK_PROXY_SCALE_Z)),
    { tag: "llk_grid_tile_click_proxy", logger: print },
  )
  if (created === null || created === undefined) {
    return false
  }

  cell.clickProxyUnit = created
  setGridTileBlockPaintColor(created, GRID_TILE_CLICK_PROXY_COLOR)
  cell.clickProxyTouchRegistered = registerGridTileUnitTouch(cell, created, "click-proxy")
  return true
}

function createGridTileClickProxiesBatch(cells: LlkGridCell[], startIndex: number, createdCount: number): void {
  let created = createdCount
  const endIndex = startIndex + GRID_TILE_CLICK_PROXIES_PER_FRAME
  for (let index = startIndex; index < cells.length && index < endIndex; index += 1) {
    if (createGridTileClickProxy(cells[index])) {
      created += 1
    }
  }

  if (endIndex < cells.length) {
    ;(LuaAPI as any).call_delay_frame(1, () => {
      createGridTileClickProxiesBatch(cells, endIndex, created)
    })
  } else {
    print(`[GridTileClickProxies] created=${created}/${GRID_ROWS * GRID_COLUMNS} unit_id=${GRID_TILE_CLICK_PROXY_UNIT_ID} scale=(${GRID_TILE_CLICK_PROXY_SCALE_X},${GRID_TILE_CLICK_PROXY_SCALE_Y},${GRID_TILE_CLICK_PROXY_SCALE_Z}) button_offset_y=${GRID_TILE_BUTTON_OFFSET_Y} per_frame=${GRID_TILE_CLICK_PROXIES_PER_FRAME}`)
    createGridTileButtons(cells)
  }
}

function createGridTileClickProxies(cells: LlkGridCell[]): void {
  createGridTileClickProxiesBatch(cells, 0, 0)
}

function createGridTileButtonsBatch(cells: LlkGridCell[], startIndex: number, createdCount: number, boundCount: number): void {
  let created = createdCount
  let bound = boundCount
  const endIndex = startIndex + GRID_TILE_BUTTONS_PER_FRAME
  for (let index = startIndex; index < cells.length && index < endIndex; index += 1) {
    const cell = cells[index]
    if (createGridTileButton(cell)) {
      created += 1
      if (cell.buttonNode !== null && cell.buttonNode !== undefined) {
        bound += 1
      }
    }
  }

  if (endIndex < cells.length) {
    ;(LuaAPI as any).call_delay_frame(1, () => {
      createGridTileButtonsBatch(cells, endIndex, created, bound)
    })
  } else {
    print(`[GridTileButtons] created=${created}/${GRID_ROWS * GRID_COLUMNS} bound_nodes=${bound}/${GRID_ROWS * GRID_COLUMNS} base_layer_id=${GRID_TILE_BUTTON_BASE_LAYER_ID} circle_layer_id=${GRID_TILE_BUTTON_CIRCLE_LAYER_ID} offset_y=${GRID_TILE_BUTTON_OFFSET_Y} per_frame=${GRID_TILE_BUTTONS_PER_FRAME}`)
    auditGridTileBindings(cells)
    refreshGridTileButtonVisibility(cells, 1)
  }
}

function createGridTileButtons(cells: LlkGridCell[]): void {
  createGridTileButtonsBatch(cells, 0, 0, 0)
}

drawTileGrid()
const llkInitialGridData = createInitialLlkGridData()
_G.llkInitialGridData = llkInitialGridData
printInitialLlkGridData(llkInitialGridData)
createGridTileBlocks(llkInitialGridData)

print(`[CameraLocked] initial_role_count=${roles.length}`)
