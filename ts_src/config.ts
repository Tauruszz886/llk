import { asFixed } from "./utils"
import type { PathDirection, StickerSource } from "./types"

export const TILE_CENTER = math.Vector3(asFixed(-23.2519999999), asFixed(1), asFixed(0.25))
export const CAMERA_BIND_MODE_BIND = 1
export const CAMERA_PROJECTION_ORTHOGRAPHIC = 1
export const CAMERA_PROP_BIND_MODE_OFFSET_X = 2
export const CAMERA_PROP_BIND_MODE_OFFSET_Y = 3
export const CAMERA_PROP_BIND_MODE_OFFSET_Z = 4
export const CAMERA_PROP_BIND_MODE_PITCH = 5
export const CAMERA_PROP_BIND_MODE_YAW = 6
export const CAMERA_PROP_DIST = 7
export const CAMERA_PROP_ORTHO_VIEW_HEIGHT = 21
export const ORTHO_VIEW_HEIGHT_FOR_CANVAS_FRAME = 34.1
export const CAMERA_HEIGHT_FOR_CANVAS_FRAME = 15

export const GRID_COLUMNS = 19
export const GRID_ROWS = 9
export const GRID_CELL_SIZE = 2.5
export const TILE_CENTER_X = -23.2519999999
export const TILE_CENTER_Z = 0.25
export const GRID_LINE_Y = 2.05
export const GRID_LINE_DURATION = 9999
export const GRID_LINES_VISIBLE = true

export const GRID_TILE_BLOCK_UNIT_ID = 105205
export const GRID_TILE_BLOCK_Y = 2.55
export const GRID_TILE_BLOCK_SCALE_X = 2.35
export const GRID_TILE_BLOCK_SCALE_Y = 0.35
export const GRID_TILE_BLOCK_SCALE_Z = 2.35
export const GRID_TILE_BLOCK_COLOR = "BFEFFF"
export const GRID_TILE_BLOCK_SELECTED_COLOR = "FFE066"
export const GRID_TILE_BLOCKS_PER_FRAME = 20

export const GRID_TILE_STICKER_SCALE_Y = 0.2
export const EMPTY_GRID_VALUE = 0
export const TILE_KIND_COUNT = 10
export const GRID_TILE_STICKER_TARGET_SIZE = 2.35
export const GRID_TILE_STICKER_SURFACE_OFFSET_Y = 0.22
export const GRID_TILE_STICKER_BACKWARD_PITCH = 0
export const GRID_TILE_STICKER_RIGHT_YAW = math.pi / 2
export const GRID_TILE_STICKERS_PER_FRAME = 20

export const GRID_TILE_BUTTON_BASE_LAYER_ID = 1328312114
export const GRID_TILE_BUTTON_CIRCLE_LAYER_ID = 1892680078
export const GRID_TILE_BUTTON_BASE_NODE_ID = "1328312114"
export const GRID_TILE_BUTTON_CIRCLE_NODE_ID = "1892680078"
export const GRID_TILE_BUTTON_OFFSET_Y = 0.1
export const GRID_TILE_BUTTONS_PER_FRAME = 20
export const GRID_TILE_UI_TOUCH_EVENT_TYPES = [0, 1, 2, 3]

export const GRID_TILE_CLICK_PROXY_UNIT_ID = 105205
export const GRID_TILE_CLICK_PROXY_SCALE_X = 2.35
export const GRID_TILE_CLICK_PROXY_SCALE_Y = 0.05
export const GRID_TILE_CLICK_PROXY_SCALE_Z = 2.35
export const GRID_TILE_CLICK_PROXY_COLOR = "66FFCC"
export const GRID_TILE_CLICK_PROXY_SELECTED_COLOR = "FFE066"
export const GRID_TILE_CLICK_PROXIES_PER_FRAME = 20

export const TILE_HEIGHT_MARK_DURATION = 9999
export const BLOCK_AXIS_SAMPLE_ONLY = false
export const LLK_MAX_TURNS = 2

export const STICKER_SOURCES: StickerSource[] = [
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

export const PATH_DIRECTIONS: PathDirection[] = [
  { rowDelta: -1, columnDelta: 0 },
  { rowDelta: 1, columnDelta: 0 },
  { rowDelta: 0, columnDelta: -1 },
  { rowDelta: 0, columnDelta: 1 },
]
