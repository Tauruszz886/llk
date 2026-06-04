import type { PathDirection, StickerSource } from "./types"

export const GRID_COLUMNS = 19
export const GRID_ROWS = 9
export const GRID_CELL_SIZE = 2.5
export const TILE_CENTER_X = -20.93
export const TILE_CENTER_Z = 0.4
export const GRID_LINE_Y = 2.05
export const GRID_LINE_DURATION = 9999
export const GRID_LINES_VISIBLE = false

export const GRID_TILE_BLOCK_UNIT_ID = 1073815661
export const GRID_TILE_BLOCK_USE_DECORATION = true
export const GRID_TILE_BLOCK_Y = 2.55
export const GRID_TILE_BLOCK_SCALE_X = 2.35
export const GRID_TILE_BLOCK_SCALE_Y = 0.35
export const GRID_TILE_BLOCK_SCALE_Z = 2.35
export const GRID_TILE_BLOCK_DECORATION_SCALE_X = 0.235
export const GRID_TILE_BLOCK_DECORATION_SCALE_Y = 0.235
export const GRID_TILE_BLOCK_DECORATION_SCALE_Z = 0.235
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
export const GRID_TILE_BUTTONS_VISIBLE = false
export const GRID_TILE_UI_TOUCH_EVENT_TYPES = [0, 1, 2, 3]

export const GRID_TILE_CLICK_PROXY_UNIT_ID = 105205
export const GRID_TILE_CLICK_PROXY_SCALE_X = 2.5
export const GRID_TILE_CLICK_PROXY_SCALE_Y = 0.08
export const GRID_TILE_CLICK_PROXY_SCALE_Z = 2.5
export const GRID_TILE_CLICK_PROXY_COLOR = "66FFCC"
export const GRID_TILE_CLICK_PROXY_SELECTED_COLOR = "FFE066"
export const GRID_TILE_CLICK_PROXY_EFFECT_COLOR = "00E5FF"
export const GRID_TILE_CLICK_PROXY_EFFECT_ALT_COLOR = "00E5FF"
export const GRID_TILE_CLICK_PROXY_EFFECT_PULSE_FRAMES = 5
export const GRID_TILE_CLICK_PROXIES_PER_FRAME = 20
export const GRID_TILE_SELECTION_RANGE_UNIT_ID = 105205
export const GRID_TILE_SELECTION_RANGE_EDGE_THICKNESS = 0.12
export const GRID_TILE_SELECTION_RANGE_HEIGHT = 0.12
export const GRID_TILE_SELECTION_RANGE_OFFSET_Y = 0.12
export const GRID_TILE_SELECTION_EFFECT_DECORATION_ID = 1073786991
export const GRID_TILE_SELECTION_EFFECT_OFFSET_Y = 0.36
export const GRID_TILE_SELECTION_EFFECT_SCALE_X = 0.25
export const GRID_TILE_SELECTION_EFFECT_SCALE_Y = 0.2
export const GRID_TILE_SELECTION_EFFECT_SCALE_Z = 0.25
export const GRID_TILE_SELECTION_EFFECT_EDGE_HALF_SIZE = 1.12
export const GRID_TILE_SELECTION_EFFECT_EDGE_STEPS = 32
export const GRID_TILE_SELECTION_EFFECT_EDGE_STEP_FRAMES = 1
export const LLK_LINK_SFX_ID = 400036
export const LLK_LINK_SFX_DURATION = 0.5
export const LLK_LINK_SFX_OFFSET_Y = 0.35
export const LLK_LINK_MOVING_EFFECT_DECORATION_ID = 1073819753
export const LLK_LINK_MOVING_EFFECT_SCALE_X = 0.5
export const LLK_LINK_MOVING_EFFECT_SCALE_Y = 0.5
export const LLK_LINK_MOVING_EFFECT_SCALE_Z = 0.5
export const LLK_LINK_MOVING_EFFECT_STEP_FRAMES = 1
export const LLK_LINK_ANCHOR_UNIT_ID = 105205
export const LLK_LINK_ANCHOR_SCALE = 0.08
export const LLK_LINK_LIGHTNING_UNIT_ID = 105205
export const LLK_LINK_FALLBACK_LINE_COLOR = "00FFFF"
export const LLK_LINK_LIGHTNING_CORE_COLOR = "FFFFFF"
export const LLK_LINK_LIGHTNING_STEP = 0.7
export const LLK_LINK_LIGHTNING_JITTER = 0.28
export const LLK_LINK_LIGHTNING_MAX_STEPS_PER_SEGMENT = 24
export const LLK_LINK_LIGHTNING_OUTER_THICKNESS = 0.32
export const LLK_LINK_LIGHTNING_CORE_THICKNESS = 0.12
export const LLK_LINK_LIGHTNING_HEIGHT = 0.12
export const LLK_LINK_LIGHTNING_CORE_OFFSET_Y = 0.06
export const LLK_LINK_LIGHTNING_NODE_SIZE = 0.46
export const LLK_LINK_LIGHTNING_NODE_HEIGHT = 0.14
export const LLK_LINK_LIGHTNING_PULSE_FRAMES = 2
export const LLK_MATCH_CLEAR_DELAY_FRAMES = 15

export const TILE_HEIGHT_MARK_DURATION = 9999
export const TILE_HEIGHT_MARKERS_VISIBLE = false
export const BLOCK_AXIS_SAMPLE_ONLY = false
export const LLK_MAX_TURNS = 2
export const RUNTIME_GROUND_TILE_UNIT_ID = 1681499584
export const RUNTIME_GROUND_TILE_NAME = "地砖0"

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
