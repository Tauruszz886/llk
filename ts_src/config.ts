import type { PathDirection, StickerSource } from "./types"

export const GRID_COLUMNS = 19
export const GRID_ROWS = 9
export const GRID_CELL_SIZE = 2.3
export const GAME_INIT_GENERATE_DELAY_FRAMES = 60
export const NEXT_LEVEL_GENERATE_DELAY_FRAMES = 30
export const LLK_MAX_LEVEL = 100
export const LLK_LEVEL_TIME_SECONDS = 60
export const LLK_TIMER_UPDATE_FRAMES = 20
export const LLK_SCORE_PER_MATCH = 2
export const LLK_SAVE_ARCHIVE_ID = 1010
export const ArchiveKeys = {
  PLAYER_SAVE_JSON: LLK_SAVE_ARCHIVE_ID,
}
export const LLK_GAME_FINISHED_TEXT = "游戏结束，点击重新开始"
export const LLK_TIMER_PROGRESS_NODE_ID = "1440194425"
export const LLK_LEVEL_LABEL_NODE_ID = "1697942210"
export const LLK_SCORE_LABEL_NODE_ID = "1332720425"
export const LLK_TIMER_PROGRESS_NODE_NAME = "进度条"
export const LLK_LEVEL_LABEL_NODE_NAME = "关卡"
export const LLK_SCORE_LABEL_NODE_NAME = "积分"
export const LLK_RESTART_BUTTON_NODE_ID = "1822328515"
export const LLK_RESTART_BUTTON_NODE_NAME = "蓝色按钮"
export const LLK_RESTART_BUTTON_TEXT = "重新开始"
export const LLK_RESTART_TIMEOUT_TEXT = "时间到请重新开始"
export const LLK_RESTART_BUTTON_SCREEN_X = 77
export const LLK_RESTART_BUTTON_SCREEN_Y = 19
export const LLK_RESTART_BUTTON_WIDTH = 352
export const LLK_RESTART_BUTTON_HEIGHT = 169
export const LLK_RESTART_MODEL_PROXY_Y = 5.0
export const LLK_RESTART_MODEL_PROXY_SCALE_X = 70.0
export const LLK_RESTART_MODEL_PROXY_SCALE_Y = 0.08
export const LLK_RESTART_MODEL_PROXY_SCALE_Z = 36.0
export const LLK_RUNTIME_CAMERA_HEIGHT_RAISE = 1.5
export const LLK_RUNTIME_CAMERA_HEIGHT_FALLBACK = 16.5
export const LLK_SELECT_SOUND_KEY = 1726649328
export const LLK_MATCH_SOUND_KEY = 1816187819
export const LLK_SELECT_SOUND_ASSET_PATH = "project/audio/水滴点击.mp3"
export const LLK_MATCH_SOUND_ASSET_PATH = "project/audio/配对成功.mp3"
export const LLK_SELECT_SOUND_DURATION = 1.0
export const LLK_MATCH_SOUND_MIN_DURATION = 0.28
export const LLK_MATCH_SOUND_MAX_DURATION = 1.1
export const LLK_MATCH_SOUND_DURATION_PER_GRID = 0.055
export const LLK_SELECT_SOUND_VOLUME = 100.0
export const LLK_MATCH_SOUND_BASE_VOLUME = 55.0
export const LLK_MATCH_SOUND_COMBO_VOLUME_STEP = 3.0
export const LLK_MATCH_SOUND_MAX_VOLUME = 100.0
export const LLK_MATCH_SOUND_COMBO_RESET_FRAMES = 90
export const LLK_SOUND_SPEED = 1.0
export const LLK_MUTE_BACKGROUND_AUDIO_ON_START = true
export const LLK_BACKGROUND_AUDIO_STOP_MAX_ID = 3000
export const LLK_BACKGROUND_AUDIO_STOP_BATCH_SIZE = 120
export const LLK_BACKGROUND_AUDIO_STOP_BATCH_FRAMES = 1
export const TILE_CENTER_X = -20.93
export const TILE_CENTER_Z = 0.4
export const GRID_LINE_Y = 2.05
export const GRID_LINE_DURATION = 9999
export const GRID_LINES_VISIBLE = false

export const GRID_TILE_BLOCK_UNIT_ID = 1073815661
export const GRID_TILE_BLOCK_USE_DECORATION = true
export const GRID_TILE_BLOCK_Y = 2.55
export const GRID_TILE_BLOCK_SCALE_X = 1.75
export const GRID_TILE_BLOCK_SCALE_Y = 0.35
export const GRID_TILE_BLOCK_SCALE_Z = 1.75
export const GRID_TILE_BLOCK_DECORATION_SCALE_X = 0.175
export const GRID_TILE_BLOCK_DECORATION_SCALE_Y = 0.235
export const GRID_TILE_BLOCK_DECORATION_SCALE_Z = 0.175
export const GRID_TILE_BLOCK_COLOR = "BFEFFF"
export const GRID_TILE_BLOCK_SELECTED_COLOR = "FFE066"
export const GRID_TILE_BLOCKS_PER_FRAME = 20

export const GRID_TILE_STICKER_SCALE_Y = 0.2
export const EMPTY_GRID_VALUE = 0
export const TILE_KIND_COUNT = 10
export const GRID_TILE_STICKER_TARGET_SIZE = 1.4
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
export const GRID_TILE_BOUND_UI_ENABLED = true
export const GRID_TILE_BOUND_UI_LAYER_ID = 1073823823
export const GRID_TILE_BOUND_UI_NODE_ID = "1073823823"
export const GRID_TILE_BOUND_UI_SOCKET = "socket_body"
export const GRID_TILE_BOUND_UI_OFFSET_Y = GRID_TILE_BLOCK_SCALE_Y * 0.5 + GRID_TILE_STICKER_SURFACE_OFFSET_Y + GRID_TILE_BUTTON_OFFSET_Y
export const GRID_TILE_BOUND_UI_PER_FRAME = 20

export const GRID_TILE_CLICK_PROXY_UNIT_ID = 105205
export const GRID_TILE_CLICK_PROXY_SCALE_X = 2.3
export const GRID_TILE_CLICK_PROXY_SCALE_Y = 0.08
export const GRID_TILE_CLICK_PROXY_SCALE_Z = 2.3
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
export const GRID_TILE_SELECTION_EFFECT_EDGE_HALF_SIZE = 1.02
export const GRID_TILE_SELECTION_EFFECT_EDGE_STEPS = 32
export const GRID_TILE_SELECTION_EFFECT_EDGE_STEP_FRAMES = 1
export const GRID_TILE_SELECTION_DROP_EFFECT_DECORATION_ID = 1073836116
export const GRID_TILE_SELECTION_DROP_EFFECT_START_OFFSET_Y = 4.8
export const GRID_TILE_SELECTION_DROP_EFFECT_END_OFFSET_Y = 0.85
export const GRID_TILE_SELECTION_DROP_EFFECT_FRAMES = 12
export const GRID_TILE_SELECTION_DROP_EFFECT_RADIUS_RATIO = 0.75
export const GRID_TILE_SELECTION_DROP_EFFECT_SCALE_Y = 1.0
export const LLK_LINK_MOVING_EFFECT_DECORATION_ID = 1073819753
export const LLK_LINK_MOVING_EFFECT_OFFSET_Y = 0.35
export const LLK_LINK_MOVING_EFFECT_SCALE_X = 0.5
export const LLK_LINK_MOVING_EFFECT_SCALE_Y = 0.5
export const LLK_LINK_MOVING_EFFECT_SCALE_Z = 0.5
export const LLK_LINK_MOVING_EFFECT_STEP_FRAMES = 1
export const LLK_MATCH_CLEAR_DELAY_FRAMES = 15
export const LLK_SHUFFLE_MAX_ATTEMPTS = 20
export const LLK_WIN_DIALOG_LABEL_STYLE_ID = 0
export const LLK_WIN_DIALOG_BUTTON_STYLE_ID = 0

export const TILE_HEIGHT_MARK_DURATION = 9999
export const TILE_HEIGHT_MARKERS_VISIBLE = false
export const BLOCK_AXIS_SAMPLE_ONLY = false
export const LLK_MAX_TURNS = 6
export const RUNTIME_GROUND_TILE_UNIT_ID = 1681499584
export const RUNTIME_GROUND_TILE_NAME = "地砖0"
export const RUNTIME_UNIT_PROBE_ID = 2012635691
export const RUNTIME_UNIT_PROBE_DELAY_FRAMES = 30

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
