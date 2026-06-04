import { safeCall, safeCreateDecoration, safeCreateObstacle, safeDestroySceneUi, safeDestroyUnit } from "@common/engine_safe"
import {
  BLOCK_AXIS_SAMPLE_ONLY,
  EMPTY_GRID_VALUE,
  GRID_CELL_SIZE,
  GRID_COLUMNS,
  GRID_LINE_DURATION,
  GRID_ROWS,
  GRID_TILE_BLOCK_COLOR,
  GRID_TILE_BLOCK_DECORATION_SCALE_X,
  GRID_TILE_BLOCK_DECORATION_SCALE_Y,
  GRID_TILE_BLOCK_DECORATION_SCALE_Z,
  GRID_TILE_BLOCK_SCALE_X,
  GRID_TILE_BLOCK_SCALE_Y,
  GRID_TILE_BLOCK_SCALE_Z,
  GRID_TILE_BLOCK_USE_DECORATION,
  GRID_TILE_BLOCK_UNIT_ID,
  GRID_TILE_BLOCK_Y,
  GRID_TILE_BLOCKS_PER_FRAME,
  GRID_TILE_BUTTON_BASE_LAYER_ID,
  GRID_TILE_BUTTON_BASE_NODE_ID,
  GRID_TILE_BUTTON_CIRCLE_LAYER_ID,
  GRID_TILE_BUTTON_CIRCLE_NODE_ID,
  GRID_TILE_BUTTON_OFFSET_Y,
  GRID_TILE_BUTTONS_PER_FRAME,
  GRID_TILE_BUTTONS_VISIBLE,
  GRID_TILE_CLICK_PROXIES_PER_FRAME,
  GRID_TILE_CLICK_PROXY_COLOR,
  GRID_TILE_CLICK_PROXY_EFFECT_ALT_COLOR,
  GRID_TILE_CLICK_PROXY_EFFECT_COLOR,
  GRID_TILE_CLICK_PROXY_EFFECT_PULSE_FRAMES,
  GRID_TILE_CLICK_PROXY_SCALE_X,
  GRID_TILE_CLICK_PROXY_SCALE_Y,
  GRID_TILE_CLICK_PROXY_SCALE_Z,
  GRID_TILE_CLICK_PROXY_UNIT_ID,
  GRID_TILE_SELECTION_RANGE_EDGE_THICKNESS,
  GRID_TILE_SELECTION_RANGE_HEIGHT,
  GRID_TILE_SELECTION_RANGE_OFFSET_Y,
  GRID_TILE_SELECTION_RANGE_UNIT_ID,
  GRID_TILE_SELECTION_EFFECT_DECORATION_ID,
  GRID_TILE_SELECTION_EFFECT_EDGE_HALF_SIZE,
  GRID_TILE_SELECTION_EFFECT_EDGE_STEP_FRAMES,
  GRID_TILE_SELECTION_EFFECT_EDGE_STEPS,
  GRID_TILE_SELECTION_EFFECT_OFFSET_Y,
  GRID_TILE_SELECTION_EFFECT_SCALE_X,
  GRID_TILE_SELECTION_EFFECT_SCALE_Y,
  GRID_TILE_SELECTION_EFFECT_SCALE_Z,
  GRID_TILE_STICKER_BACKWARD_PITCH,
  GRID_TILE_STICKER_RIGHT_YAW,
  GRID_TILE_STICKER_SCALE_Y,
  GRID_TILE_STICKER_SURFACE_OFFSET_Y,
  GRID_TILE_STICKER_TARGET_SIZE,
  GRID_TILE_STICKERS_PER_FRAME,
  LLK_LINK_ANCHOR_SCALE,
  LLK_LINK_ANCHOR_UNIT_ID,
  LLK_LINK_FALLBACK_LINE_COLOR,
  LLK_LINK_LIGHTNING_CORE_OFFSET_Y,
  LLK_LINK_LIGHTNING_CORE_THICKNESS,
  LLK_LINK_LIGHTNING_CORE_COLOR,
  LLK_LINK_LIGHTNING_HEIGHT,
  LLK_LINK_LIGHTNING_JITTER,
  LLK_LINK_LIGHTNING_MAX_STEPS_PER_SEGMENT,
  LLK_LINK_LIGHTNING_NODE_HEIGHT,
  LLK_LINK_LIGHTNING_NODE_SIZE,
  LLK_LINK_LIGHTNING_OUTER_THICKNESS,
  LLK_LINK_LIGHTNING_PULSE_FRAMES,
  LLK_LINK_LIGHTNING_STEP,
  LLK_LINK_LIGHTNING_UNIT_ID,
  LLK_LINK_MOVING_EFFECT_DECORATION_ID,
  LLK_LINK_MOVING_EFFECT_SCALE_X,
  LLK_LINK_MOVING_EFFECT_SCALE_Y,
  LLK_LINK_MOVING_EFFECT_SCALE_Z,
  LLK_LINK_MOVING_EFFECT_STEP_FRAMES,
  LLK_LINK_SFX_DURATION,
  LLK_LINK_SFX_ID,
  LLK_LINK_SFX_OFFSET_Y,
  LLK_MATCH_CLEAR_DELAY_FRAMES,
  STICKER_SOURCES,
  TILE_HEIGHT_MARK_DURATION,
  TILE_HEIGHT_MARKERS_VISIBLE,
} from "./config"
import { flattenGridCells, getGridBounds } from "./grid"
import { enableGridTileTouchTarget, registerGridTileButtonTouch, registerGridTileUnitTouch } from "./touch"
import type { GridCellClickHandler, LinkPathResult, LinkVisualHandle, LlkGridCell, StickerSource, TileHeightLevels } from "./types"
import { asFixed } from "./utils"

export function createGridTileBlocks(grid: LlkGridCell[][], onClick: GridCellClickHandler): void {
  const cells = flattenGridCells(grid)
  createGridTileBlocksBatch(cells, 0, 0, onClick)
}

function createGridTileBlocksBatch(cells: LlkGridCell[], startIndex: number, createdCount: number, onClick: GridCellClickHandler): void {
  let created = createdCount
  const endIndex = startIndex + GRID_TILE_BLOCKS_PER_FRAME
  for (let index = startIndex; index < cells.length && index < endIndex; index += 1) {
    const cell = cells[index]
    cell.tileUnit = createGridTileBlock(cell)
    if (cell.tileUnit !== null && cell.tileUnit !== undefined) {
      created += 1
      if (!GRID_TILE_BLOCK_USE_DECORATION) {
        cell.tileTouchRegistered = registerGridTileUnitTouch(cell, cell.tileUnit, "block", onClick)
      }
    }
  }

  if (endIndex < cells.length) {
    ;(LuaAPI as any).call_delay_frame(1, () => {
      createGridTileBlocksBatch(cells, endIndex, created, onClick)
    })
  } else {
    print(`[GridTileBlocks] created=${created}/${GRID_ROWS * GRID_COLUMNS} unit_id=${GRID_TILE_BLOCK_UNIT_ID} logical_size=(${GRID_TILE_BLOCK_SCALE_X},${GRID_TILE_BLOCK_SCALE_Y},${GRID_TILE_BLOCK_SCALE_Z}) decoration_scale=(${GRID_TILE_BLOCK_DECORATION_SCALE_X},${GRID_TILE_BLOCK_DECORATION_SCALE_Y},${GRID_TILE_BLOCK_DECORATION_SCALE_Z}) use_decoration=${GRID_TILE_BLOCK_USE_DECORATION} per_frame=${GRID_TILE_BLOCKS_PER_FRAME}`)
    if (TILE_HEIGHT_MARKERS_VISIBLE) {
      drawTileHeightMarkers(cells)
    }
    createGridTileSurfaceStickers(cells, onClick)
  }
}

function createGridTileBlock(cell: LlkGridCell): any {
  if (cell.value === EMPTY_GRID_VALUE) {
    return null
  }

  const position = math.Vector3(asFixed(cell.x), asFixed(GRID_TILE_BLOCK_Y), asFixed(cell.z))
  const obstacleScale = math.Vector3(asFixed(GRID_TILE_BLOCK_SCALE_X), asFixed(GRID_TILE_BLOCK_SCALE_Y), asFixed(GRID_TILE_BLOCK_SCALE_Z))
  const decorationScale = math.Vector3(
    asFixed(GRID_TILE_BLOCK_DECORATION_SCALE_X),
    asFixed(GRID_TILE_BLOCK_DECORATION_SCALE_Y),
    asFixed(GRID_TILE_BLOCK_DECORATION_SCALE_Z),
  )
  const created = GRID_TILE_BLOCK_USE_DECORATION
    ? safeCreateDecoration(
        GRID_TILE_BLOCK_UNIT_ID,
        position,
        math.Quaternion(0, 0, 0),
        decorationScale,
        undefined,
        { tag: "llk_grid_tile_block_decoration", logger: print },
      )
    : safeCreateObstacle(
        GRID_TILE_BLOCK_UNIT_ID,
        position,
        obstacleScale,
        { tag: "llk_grid_tile_block", logger: print },
      )
  if (created !== null && created !== undefined) {
    if (!GRID_TILE_BLOCK_USE_DECORATION) {
      setGridTileBlockColor(created)
    }
    if (!GRID_TILE_BLOCK_USE_DECORATION) {
      enableGridTileTouchTarget(created, "tile")
    }
  }
  return created
}

export function setCellSelected(cell: LlkGridCell, selected: boolean): void {
  if (cell.matched) {
    return
  }
  setClickProxySelectionVisual(cell, selected)
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

function setClickProxySelectionVisual(cell: LlkGridCell, selected: boolean): void {
  if (cell.clickProxyUnit === null || cell.clickProxyUnit === undefined) {
    return
  }

  cell.selectionVisualToken += 1
  if (selected) {
    createSelectionEffectVisual(cell)
  } else {
    destroySelectionEffectVisual(cell)
    destroySelectionRangeVisual(cell)
    setGridTileBlockPaintColor(cell.clickProxyUnit, GRID_TILE_CLICK_PROXY_COLOR)
  }

  safeCall(
    () => {
      cell.clickProxyUnit.set_model_visible(false)
      return true
    },
    { tag: "llk_set_click_proxy_selection_visible", fallback: false, logger: print },
  )
  print(`[LlkSelectVisual] row=${cell.row} column=${cell.column} visible=${selected} layer=selection_decoration id=${GRID_TILE_SELECTION_EFFECT_DECORATION_ID} size=${GRID_TILE_SELECTION_EFFECT_SCALE_X}x${GRID_TILE_SELECTION_EFFECT_SCALE_Z}`)
}

export function createLinkPathVisual(path: LinkPathResult, first: LlkGridCell): LinkVisualHandle {
  const handle: LinkVisualHandle = {
    anchorUnits: [],
    sfxIds: [],
    effectUnits: [],
    effectOuterUnits: [],
    effectCoreUnits: [],
    effectNodeUnits: [],
    fallbackModelCreated: false,
  }
  if (path.points.length < 2) {
    return handle
  }

  const y = getLinkLineY(first)
  createMovingLinkPathEffect(handle, path, y)
  handle.fallbackModelCreated = handle.effectUnits.length > 0
  print(`[LlkLinkMoveEffect] created effect_units=${handle.effectUnits.length} id=${LLK_LINK_MOVING_EFFECT_DECORATION_ID} path_points=${path.points.length} turns=${path.turns} duration_frames=${LLK_MATCH_CLEAR_DELAY_FRAMES}`)
  return handle
}

function createMovingLinkPathEffect(handle: LinkVisualHandle, path: LinkPathResult, y: number): void {
  const start = getLinkPathWorldPosition(path.points[0].row, path.points[0].column, y)
  const created = safeCreateDecoration(
    LLK_LINK_MOVING_EFFECT_DECORATION_ID,
    start,
    math.Quaternion(asFixed(0), asFixed(0), asFixed(0)),
    math.Vector3(
      asFixed(LLK_LINK_MOVING_EFFECT_SCALE_X),
      asFixed(LLK_LINK_MOVING_EFFECT_SCALE_Y),
      asFixed(LLK_LINK_MOVING_EFFECT_SCALE_Z),
    ),
    undefined,
    { tag: "llk_create_link_moving_effect_decoration", logger: print },
  )
  if (created === null || created === undefined) {
    print(`[LlkLinkMoveEffect] failed id=${LLK_LINK_MOVING_EFFECT_DECORATION_ID}`)
    return
  }

  handle.effectUnits.push(created)
  animateMovingLinkPathEffect(handle, path, y, created, 1)
}

function animateMovingLinkPathEffect(handle: LinkVisualHandle, path: LinkPathResult, y: number, unit: any, frame: number): void {
  if (frame > LLK_MATCH_CLEAR_DELAY_FRAMES || handle.effectUnits.length === 0) {
    return
  }

  const position = getMovingLinkPathPosition(path, y, frame / LLK_MATCH_CLEAR_DELAY_FRAMES)
  safeCall(
    () => {
      unit.set_position(position)
      return true
    },
    { tag: "llk_move_link_moving_effect_decoration", fallback: false, logger: print },
  )

  ;(LuaAPI as any).call_delay_frame(LLK_LINK_MOVING_EFFECT_STEP_FRAMES, () => {
    animateMovingLinkPathEffect(handle, path, y, unit, frame + LLK_LINK_MOVING_EFFECT_STEP_FRAMES)
  })
}

function getMovingLinkPathPosition(path: LinkPathResult, y: number, progress: number): Vector3 {
  const clampedProgress = math.max(0, math.min(1, progress))
  let totalLength = 0
  for (let index = 0; index < path.points.length - 1; index += 1) {
    const start = path.points[index]
    const finish = path.points[index + 1]
    totalLength += math.abs(finish.column - start.column) + math.abs(finish.row - start.row)
  }
  if (totalLength <= 0) {
    const point = path.points[0]
    return getLinkPathWorldPosition(point.row, point.column, y)
  }

  let remaining = totalLength * clampedProgress
  for (let index = 0; index < path.points.length - 1; index += 1) {
    const start = path.points[index]
    const finish = path.points[index + 1]
    const segmentLength = math.abs(finish.column - start.column) + math.abs(finish.row - start.row)
    if (segmentLength <= 0) {
      continue
    }
    if (remaining <= segmentLength) {
      const t = remaining / segmentLength
      const startWorld = getLinkPathWorldPosition(start.row, start.column, y)
      const finishWorld = getLinkPathWorldPosition(finish.row, finish.column, y)
      return math.Vector3(
        asFixed(startWorld.x + (finishWorld.x - startWorld.x) * t),
        asFixed(y),
        asFixed(startWorld.z + (finishWorld.z - startWorld.z) * t),
      )
    }
    remaining -= segmentLength
  }

  const last = path.points[path.points.length - 1]
  return getLinkPathWorldPosition(last.row, last.column, y)
}

function createFallbackLinkPathLightning(handle: LinkVisualHandle, path: LinkPathResult, y: number): void {
  let createdPieces = 0
  for (let index = 0; index < path.points.length; index += 1) {
    const point = getLinkPathWorldPosition(path.points[index].row, path.points[index].column, y + LLK_LINK_LIGHTNING_CORE_OFFSET_Y)
    createdPieces += createLightningNode(handle, point)
  }
  for (let index = 0; index < path.points.length - 1; index += 1) {
    const start = getLinkPathWorldPosition(path.points[index].row, path.points[index].column, y)
    const finish = getLinkPathWorldPosition(path.points[index + 1].row, path.points[index + 1].column, y)
    createdPieces += createLightningSegmentModels(handle, start, finish)
  }
  print(`[LlkLinkLightning] created model_pieces=${createdPieces} path_segments=${path.points.length - 1} duration=${LLK_LINK_SFX_DURATION}`)
}

function createLightningSegmentModels(handle: LinkVisualHandle, start: Vector3, finish: Vector3): number {
  const dx = finish.x - start.x
  const dz = finish.z - start.z
  const length = math.max(math.abs(dx), math.abs(dz))
  const rawSegmentCount = math.max(1, math.floor(length / LLK_LINK_LIGHTNING_STEP))
  const segmentCount = math.min(rawSegmentCount, LLK_LINK_LIGHTNING_MAX_STEPS_PER_SEGMENT)
  const points: Vector3[] = []

  for (let index = 0; index <= segmentCount; index += 1) {
    const t = index / segmentCount
    let x = start.x + dx * t
    let z = start.z + dz * t
    if (index > 0 && index < segmentCount) {
      const offset = (index % 2 === 0 ? 1 : -1) * LLK_LINK_LIGHTNING_JITTER
      if (math.abs(dx) >= math.abs(dz)) {
        z += offset
      } else {
        x += offset
      }
    }
    points.push(math.Vector3(asFixed(x), asFixed(start.y), asFixed(z)))
  }

  let createdPieces = 0
  for (let index = 0; index < points.length - 1; index += 1) {
    createdPieces += createAxisAlignedLightningLeg(handle, points[index], points[index + 1])
  }
  return createdPieces
}

function createAxisAlignedLightningLeg(handle: LinkVisualHandle, start: Vector3, finish: Vector3): number {
  let createdPieces = 0
  const corner = math.Vector3(asFixed(finish.x), asFixed(start.y), asFixed(start.z))
  createdPieces += createLightningBarPair(handle, start, corner)
  createdPieces += createLightningBarPair(handle, corner, finish)
  return createdPieces
}

function createLightningBarPair(handle: LinkVisualHandle, start: Vector3, finish: Vector3): number {
  const dx = finish.x - start.x
  const dz = finish.z - start.z
  const length = math.max(math.abs(dx), math.abs(dz))
  if (length <= 0.01) {
    return 0
  }

  const centerX = (start.x + finish.x) * 0.5
  const centerZ = (start.z + finish.z) * 0.5
  const scaleX = math.abs(dx) >= math.abs(dz) ? length + LLK_LINK_LIGHTNING_CORE_THICKNESS : LLK_LINK_LIGHTNING_OUTER_THICKNESS
  const scaleZ = math.abs(dx) >= math.abs(dz) ? LLK_LINK_LIGHTNING_OUTER_THICKNESS : length + LLK_LINK_LIGHTNING_CORE_THICKNESS
  const coreScaleX = math.abs(dx) >= math.abs(dz) ? length + LLK_LINK_LIGHTNING_CORE_THICKNESS : LLK_LINK_LIGHTNING_CORE_THICKNESS
  const coreScaleZ = math.abs(dx) >= math.abs(dz) ? LLK_LINK_LIGHTNING_CORE_THICKNESS : length + LLK_LINK_LIGHTNING_CORE_THICKNESS

  let createdPieces = 0
  const outer = createLightningBar(centerX, start.y, centerZ, scaleX, scaleZ, LLK_LINK_FALLBACK_LINE_COLOR)
  if (outer !== null && outer !== undefined) {
    handle.effectUnits.push(outer)
    handle.effectOuterUnits.push(outer)
    createdPieces += 1
  }
  const core = createLightningBar(centerX, start.y + LLK_LINK_LIGHTNING_CORE_OFFSET_Y, centerZ, coreScaleX, coreScaleZ, LLK_LINK_LIGHTNING_CORE_COLOR)
  if (core !== null && core !== undefined) {
    handle.effectUnits.push(core)
    handle.effectCoreUnits.push(core)
    createdPieces += 1
  }
  return createdPieces
}

function createLightningBar(centerX: number, centerY: number, centerZ: number, scaleX: number, scaleZ: number, colorText: string): any {
  const unit = safeCreateObstacle(
    LLK_LINK_LIGHTNING_UNIT_ID,
    math.Vector3(asFixed(centerX), asFixed(centerY), asFixed(centerZ)),
    math.Vector3(asFixed(scaleX), asFixed(LLK_LINK_LIGHTNING_HEIGHT), asFixed(scaleZ)),
    { tag: "llk_create_link_lightning_bar", logger: print },
  )
  if (unit !== null && unit !== undefined) {
    setGridTileBlockPaintColor(unit, colorText)
  }
  return unit
}

function createLightningNode(handle: LinkVisualHandle, position: Vector3): number {
  const outer = createLightningNodeUnit(position.x, position.y, position.z, LLK_LINK_LIGHTNING_NODE_SIZE, LLK_LINK_FALLBACK_LINE_COLOR)
  let createdPieces = 0
  if (outer !== null && outer !== undefined) {
    handle.effectUnits.push(outer)
    handle.effectOuterUnits.push(outer)
    handle.effectNodeUnits.push(outer)
    createdPieces += 1
  }

  const core = createLightningNodeUnit(position.x, position.y + LLK_LINK_LIGHTNING_CORE_OFFSET_Y, position.z, LLK_LINK_LIGHTNING_NODE_SIZE * 0.45, LLK_LINK_LIGHTNING_CORE_COLOR)
  if (core !== null && core !== undefined) {
    handle.effectUnits.push(core)
    handle.effectCoreUnits.push(core)
    handle.effectNodeUnits.push(core)
    createdPieces += 1
  }
  return createdPieces
}

function createLightningNodeUnit(centerX: number, centerY: number, centerZ: number, size: number, colorText: string): any {
  const unit = safeCreateObstacle(
    LLK_LINK_LIGHTNING_UNIT_ID,
    math.Vector3(asFixed(centerX), asFixed(centerY), asFixed(centerZ)),
    math.Vector3(asFixed(size), asFixed(LLK_LINK_LIGHTNING_NODE_HEIGHT), asFixed(size)),
    { tag: "llk_create_link_lightning_node", logger: print },
  )
  if (unit !== null && unit !== undefined) {
    setGridTileBlockPaintColor(unit, colorText)
  }
  return unit
}

function pulseLinkPathLightning(handle: LinkVisualHandle, elapsedFrames: number): void {
  if (elapsedFrames >= LLK_MATCH_CLEAR_DELAY_FRAMES || handle.effectUnits.length === 0) {
    return
  }

  const evenPulse = math.floor(elapsedFrames / LLK_LINK_LIGHTNING_PULSE_FRAMES) % 2 === 0
  const outerColor = evenPulse ? LLK_LINK_FALLBACK_LINE_COLOR : "009DFF"
  const coreColor = evenPulse ? LLK_LINK_LIGHTNING_CORE_COLOR : "BFFFFF"
  paintUnits(handle.effectOuterUnits, outerColor)
  paintUnits(handle.effectCoreUnits, coreColor)

  ;(LuaAPI as any).call_delay_frame(LLK_LINK_LIGHTNING_PULSE_FRAMES, () => {
    pulseLinkPathLightning(handle, elapsedFrames + LLK_LINK_LIGHTNING_PULSE_FRAMES)
  })
}

function paintUnits(units: any[], colorText: string): void {
  for (let index = 0; index < units.length; index += 1) {
    const unit = units[index]
    if (unit !== null && unit !== undefined) {
      setGridTileBlockPaintColor(unit, colorText)
    }
  }
}

export function destroyLinkPathVisual(handle: LinkVisualHandle): void {
  for (let index = 0; index < handle.sfxIds.length; index += 1) {
    const sfxId = handle.sfxIds[index]
    if (sfxId !== null && sfxId !== undefined && sfxId !== -1) {
      safeCall(
        () => {
          ;(GlobalAPI as any).destroy_sfx(sfxId, false)
          return true
        },
        { tag: "llk_destroy_link_sfx", fallback: false, logger: print },
      )
    }
  }

  for (let index = 0; index < handle.effectUnits.length; index += 1) {
    const unit = handle.effectUnits[index]
    if (unit !== null && unit !== undefined) {
      safeDestroyUnit(unit, { tag: "llk_destroy_link_lightning_bar", logger: print })
    }
  }

  for (let index = 0; index < handle.anchorUnits.length; index += 1) {
    const anchor = handle.anchorUnits[index]
    if (anchor !== null && anchor !== undefined) {
      safeDestroyUnit(anchor, { tag: "llk_destroy_link_anchor", logger: print })
    }
  }
  handle.sfxIds = []
  handle.effectUnits = []
  handle.effectOuterUnits = []
  handle.effectCoreUnits = []
  handle.effectNodeUnits = []
  handle.anchorUnits = []
}

function createLinkAnchor(position: Vector3): any {
  const anchor = safeCreateObstacle(
    LLK_LINK_ANCHOR_UNIT_ID,
    position,
    math.Vector3(asFixed(LLK_LINK_ANCHOR_SCALE), asFixed(LLK_LINK_ANCHOR_SCALE), asFixed(LLK_LINK_ANCHOR_SCALE)),
    { tag: "llk_create_link_anchor", logger: print },
  )
  if (anchor !== null && anchor !== undefined) {
    safeCall(
      () => {
        anchor.set_model_visible(false)
        return true
      },
      { tag: "llk_hide_link_anchor", fallback: false, logger: print },
    )
  }
  return anchor
}

function pulseClickProxySelectionVisual(cell: LlkGridCell, token: number, frame: number): void {
  if (cell.selectionVisualToken !== token || cell.clickProxyUnit === null || cell.clickProxyUnit === undefined || cell.matched) {
    return
  }

  const color = frame % 2 === 0 ? GRID_TILE_CLICK_PROXY_EFFECT_COLOR : GRID_TILE_CLICK_PROXY_EFFECT_ALT_COLOR
  setGridTileBlockPaintColor(cell.clickProxyUnit, color)
  ;(LuaAPI as any).call_delay_frame(GRID_TILE_CLICK_PROXY_EFFECT_PULSE_FRAMES, () => {
    pulseClickProxySelectionVisual(cell, token, frame + 1)
  })
}

function refreshClickProxyEffectModel(cell: LlkGridCell): void {
  const unit = cell.clickProxyUnit
  if (unit === null || unit === undefined) {
    return
  }

  setGridTileBlockPaintColor(unit, GRID_TILE_CLICK_PROXY_EFFECT_COLOR)
  safeCall(
    () => {
      unit.set_model_visible(true)
      return true
    },
    { tag: "llk_show_click_proxy_effect_model", fallback: false, logger: print },
  )
}

function createSelectionEffectVisual(cell: LlkGridCell): void {
  destroySelectionEffectVisual(cell)
  const token = cell.selectionVisualToken
  const position = getSelectionEffectEdgePosition(cell, 0)
  const created = safeCreateDecoration(
    GRID_TILE_SELECTION_EFFECT_DECORATION_ID,
    position,
    math.Quaternion(asFixed(0), asFixed(0), asFixed(0)),
    math.Vector3(
      asFixed(GRID_TILE_SELECTION_EFFECT_SCALE_X),
      asFixed(GRID_TILE_SELECTION_EFFECT_SCALE_Y),
      asFixed(GRID_TILE_SELECTION_EFFECT_SCALE_Z),
    ),
    undefined,
    { tag: "llk_create_selection_effect_decoration", logger: print },
  )
  if (created === null || created === undefined) {
    print(`[LlkSelectEffect] failed row=${cell.row} column=${cell.column} id=${GRID_TILE_SELECTION_EFFECT_DECORATION_ID}`)
    return
  }

  cell.selectionEffectUnit = created
  animateSelectionEffectAroundEdge(cell, token, 1)
  print(`[LlkSelectEffect] created row=${cell.row} column=${cell.column} id=${GRID_TILE_SELECTION_EFFECT_DECORATION_ID} mode=edge_loop pos=(${position.x},${position.y},${position.z}) scale=(${GRID_TILE_SELECTION_EFFECT_SCALE_X},${GRID_TILE_SELECTION_EFFECT_SCALE_Y},${GRID_TILE_SELECTION_EFFECT_SCALE_Z}) half=${GRID_TILE_SELECTION_EFFECT_EDGE_HALF_SIZE} steps=${GRID_TILE_SELECTION_EFFECT_EDGE_STEPS}`)
}

function destroySelectionEffectVisual(cell: LlkGridCell): void {
  if (cell.selectionEffectUnit !== null && cell.selectionEffectUnit !== undefined) {
    safeDestroyUnit(cell.selectionEffectUnit, { tag: "llk_destroy_selection_effect_decoration", logger: print })
    cell.selectionEffectUnit = null
  }
}

function animateSelectionEffectAroundEdge(cell: LlkGridCell, token: number, step: number): void {
  if (cell.selectionVisualToken !== token || cell.selectionEffectUnit === null || cell.selectionEffectUnit === undefined || cell.matched) {
    return
  }

  const position = getSelectionEffectEdgePosition(cell, step)
  safeCall(
    () => {
      cell.selectionEffectUnit.set_position(position)
      return true
    },
    { tag: "llk_move_selection_effect_edge_loop", fallback: false, logger: print },
  )
  ;(LuaAPI as any).call_delay_frame(GRID_TILE_SELECTION_EFFECT_EDGE_STEP_FRAMES, () => {
    animateSelectionEffectAroundEdge(cell, token, step + 1)
  })
}

function getSelectionEffectEdgePosition(cell: LlkGridCell, step: number): Vector3 {
  const center = getTileSurfacePosition(cell)
  const totalSteps = math.max(4, GRID_TILE_SELECTION_EFFECT_EDGE_STEPS)
  const normalized = step % totalSteps
  const sideStepCount = totalSteps / 4
  const side = math.floor(normalized / sideStepCount)
  const sideT = (normalized - side * sideStepCount) / sideStepCount
  const half = GRID_TILE_SELECTION_EFFECT_EDGE_HALF_SIZE
  let x = center.x - half
  let z = center.z - half

  if (side === 0) {
    x = center.x - half + half * 2 * sideT
    z = center.z - half
  } else if (side === 1) {
    x = center.x + half
    z = center.z - half + half * 2 * sideT
  } else if (side === 2) {
    x = center.x + half - half * 2 * sideT
    z = center.z + half
  } else {
    x = center.x - half
    z = center.z + half - half * 2 * sideT
  }

  return math.Vector3(
    asFixed(x),
    asFixed(center.y + GRID_TILE_SELECTION_EFFECT_OFFSET_Y),
    asFixed(z),
  )
}

function createSelectionRangeVisual(cell: LlkGridCell): void {
  destroySelectionRangeVisual(cell)
  const center = getSelectionRangeCenter(cell)
  if (center === null) {
    print(`[LlkSelectRange] skipped row=${cell.row} column=${cell.column} reason=no_click_proxy_position`)
    return
  }

  const halfSize = GRID_TILE_CLICK_PROXY_SCALE_X * 0.5
  const halfThickness = GRID_TILE_SELECTION_RANGE_EDGE_THICKNESS * 0.5
  const y = center.y + GRID_TILE_SELECTION_RANGE_OFFSET_Y
  const edgeSpecs = [
    { x: center.x, z: center.z - halfSize + halfThickness, scaleX: GRID_TILE_CLICK_PROXY_SCALE_X, scaleZ: GRID_TILE_SELECTION_RANGE_EDGE_THICKNESS },
    { x: center.x, z: center.z + halfSize - halfThickness, scaleX: GRID_TILE_CLICK_PROXY_SCALE_X, scaleZ: GRID_TILE_SELECTION_RANGE_EDGE_THICKNESS },
    { x: center.x - halfSize + halfThickness, z: center.z, scaleX: GRID_TILE_SELECTION_RANGE_EDGE_THICKNESS, scaleZ: GRID_TILE_CLICK_PROXY_SCALE_Z },
    { x: center.x + halfSize - halfThickness, z: center.z, scaleX: GRID_TILE_SELECTION_RANGE_EDGE_THICKNESS, scaleZ: GRID_TILE_CLICK_PROXY_SCALE_Z },
  ]

  for (let index = 0; index < edgeSpecs.length; index += 1) {
    const spec = edgeSpecs[index]
    const edge = safeCreateObstacle(
      GRID_TILE_SELECTION_RANGE_UNIT_ID,
      math.Vector3(asFixed(spec.x), asFixed(y), asFixed(spec.z)),
      math.Vector3(asFixed(spec.scaleX), asFixed(GRID_TILE_SELECTION_RANGE_HEIGHT), asFixed(spec.scaleZ)),
      { tag: "llk_create_selection_range_edge", logger: print },
    )
    if (edge !== null && edge !== undefined) {
      setGridTileBlockPaintColor(edge, GRID_TILE_CLICK_PROXY_EFFECT_COLOR)
      cell.selectionRangeUnits.push(edge)
    }
  }

  print(`[LlkSelectRange] created row=${cell.row} column=${cell.column} edges=${cell.selectionRangeUnits.length} size=${GRID_TILE_CLICK_PROXY_SCALE_X}x${GRID_TILE_CLICK_PROXY_SCALE_Z}`)
}

function destroySelectionRangeVisual(cell: LlkGridCell): void {
  for (let index = 0; index < cell.selectionRangeUnits.length; index += 1) {
    const unit = cell.selectionRangeUnits[index]
    if (unit !== null && unit !== undefined) {
      safeDestroyUnit(unit, { tag: "llk_destroy_selection_range_edge", logger: print })
    }
  }
  cell.selectionRangeUnits = []
}

function pulseSelectionRangeVisual(cell: LlkGridCell, token: number, frame: number): void {
  if (cell.selectionVisualToken !== token || cell.selectionRangeUnits.length === 0 || cell.matched) {
    return
  }

  const color = frame % 2 === 0 ? GRID_TILE_CLICK_PROXY_EFFECT_COLOR : GRID_TILE_CLICK_PROXY_EFFECT_ALT_COLOR
  for (let index = 0; index < cell.selectionRangeUnits.length; index += 1) {
    const unit = cell.selectionRangeUnits[index]
    if (unit !== null && unit !== undefined) {
      setGridTileBlockPaintColor(unit, color)
    }
  }
  ;(LuaAPI as any).call_delay_frame(GRID_TILE_CLICK_PROXY_EFFECT_PULSE_FRAMES, () => {
    pulseSelectionRangeVisual(cell, token, frame + 1)
  })
}

function getSelectionRangeCenter(cell: LlkGridCell): Vector3 | null {
  if (cell.clickProxyUnit === null || cell.clickProxyUnit === undefined) {
    return null
  }

  const position = safeCall(
    () => {
      return cell.clickProxyUnit.get_position()
    },
    { tag: "llk_get_selection_range_center", fallback: null, logger: print },
  )
  return position !== null && position !== undefined ? position : null
}

function getLinkLineY(cell: LlkGridCell): number {
  const center = getSelectionRangeCenter(cell)
  if (center !== null) {
    return center.y + LLK_LINK_SFX_OFFSET_Y
  }
  return GRID_TILE_BLOCK_Y + GRID_TILE_BLOCK_SCALE_Y * 0.5 + LLK_LINK_SFX_OFFSET_Y
}

function getLinkPathWorldPosition(row: number, column: number, y: number): Vector3 {
  const bounds = getGridBounds()
  return math.Vector3(
    asFixed(bounds.xMin + GRID_CELL_SIZE * (column - 0.5)),
    asFixed(y),
    asFixed(bounds.zMin + GRID_CELL_SIZE * (row - 0.5)),
  )
}

function createGridTileSurfaceStickers(cells: LlkGridCell[], onClick: GridCellClickHandler): void {
  printStickerSources()
  createGridTileSurfaceStickersBatch(cells, 0, 0, onClick)
}

function createGridTileSurfaceStickersBatch(cells: LlkGridCell[], startIndex: number, createdCount: number, onClick: GridCellClickHandler): void {
  let created = createdCount
  const endIndex = startIndex + GRID_TILE_STICKERS_PER_FRAME
  for (let index = startIndex; index < cells.length && index < endIndex; index += 1) {
    if (createGridTileSurfaceSticker(cells[index])) {
      created += 1
    }
  }

  if (endIndex < cells.length) {
    ;(LuaAPI as any).call_delay_frame(1, () => {
      createGridTileSurfaceStickersBatch(cells, endIndex, created, onClick)
    })
  } else {
    print(`[GridTileSurfaceStickers] created=${created}/${GRID_ROWS * GRID_COLUMNS} target_size=${GRID_TILE_STICKER_TARGET_SIZE} surface_offset_y=${GRID_TILE_STICKER_SURFACE_OFFSET_Y} rotation_pitch=${GRID_TILE_STICKER_BACKWARD_PITCH} rotation_yaw=${GRID_TILE_STICKER_RIGHT_YAW} per_frame=${GRID_TILE_STICKERS_PER_FRAME}`)
    createGridTileClickProxies(cells, onClick)
  }
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

function printStickerSources(): void {
  for (let index = 0; index < STICKER_SOURCES.length; index += 1) {
    const source = STICKER_SOURCES[index]
    const stickerPitch = source.pitch !== undefined ? source.pitch : GRID_TILE_STICKER_BACKWARD_PITCH
    print(`[GridTileStickerSource] value=${source.value} prefab_id=${source.prefabId} name=${source.name} model_size_xz=(${source.modelSizeX},${source.modelSizeZ}) scale=${getStickerScale(source)} pitch=${stickerPitch}`)
  }
}

function createGridTileClickProxies(cells: LlkGridCell[], onClick: GridCellClickHandler): void {
  createGridTileClickProxiesBatch(cells, 0, 0, onClick)
}

function createGridTileClickProxiesBatch(cells: LlkGridCell[], startIndex: number, createdCount: number, onClick: GridCellClickHandler): void {
  let created = createdCount
  const endIndex = startIndex + GRID_TILE_CLICK_PROXIES_PER_FRAME
  for (let index = startIndex; index < cells.length && index < endIndex; index += 1) {
    if (createGridTileClickProxy(cells[index], onClick)) {
      created += 1
    }
  }

  if (endIndex < cells.length) {
    ;(LuaAPI as any).call_delay_frame(1, () => {
      createGridTileClickProxiesBatch(cells, endIndex, created, onClick)
    })
  } else {
    print(`[GridTileClickProxies] created=${created}/${GRID_ROWS * GRID_COLUMNS} unit_id=${GRID_TILE_CLICK_PROXY_UNIT_ID} scale=(${GRID_TILE_CLICK_PROXY_SCALE_X},${GRID_TILE_CLICK_PROXY_SCALE_Y},${GRID_TILE_CLICK_PROXY_SCALE_Z}) button_offset_y=${GRID_TILE_BUTTON_OFFSET_Y} per_frame=${GRID_TILE_CLICK_PROXIES_PER_FRAME}`)
    if (GRID_TILE_BUTTONS_VISIBLE) {
      createGridTileButtons(cells, onClick)
    } else {
      print("[GridTileButtons] skipped visible=false click_proxy_touch=true")
      auditGridTileBindings(cells, false)
    }
  }
}

function createGridTileClickProxy(cell: LlkGridCell, onClick: GridCellClickHandler): boolean {
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
  enableGridTileTouchTarget(created, "click_proxy")
  hideClickProxyModel(created)
  cell.clickProxyTouchRegistered = registerGridTileUnitTouch(cell, created, "click-proxy", onClick)
  return true
}

function hideClickProxyModel(unit: any): void {
  safeCall(
    () => {
      unit.set_model_visible(false)
      return true
    },
    { tag: "llk_hide_click_proxy_model", fallback: false, logger: print },
  )
}

function createGridTileButtons(cells: LlkGridCell[], onClick: GridCellClickHandler): void {
  createGridTileButtonsBatch(cells, 0, 0, 0, onClick)
}

function createGridTileButtonsBatch(cells: LlkGridCell[], startIndex: number, createdCount: number, boundCount: number, onClick: GridCellClickHandler): void {
  let created = createdCount
  let bound = boundCount
  const endIndex = startIndex + GRID_TILE_BUTTONS_PER_FRAME
  for (let index = startIndex; index < cells.length && index < endIndex; index += 1) {
    const cell = cells[index]
    if (createGridTileButton(cell, onClick)) {
      created += 1
      if (cell.buttonNode !== null && cell.buttonNode !== undefined) {
        bound += 1
      }
    }
  }

  if (endIndex < cells.length) {
    ;(LuaAPI as any).call_delay_frame(1, () => {
      createGridTileButtonsBatch(cells, endIndex, created, bound, onClick)
    })
  } else {
    print(`[GridTileButtons] created=${created}/${GRID_ROWS * GRID_COLUMNS} bound_nodes=${bound}/${GRID_ROWS * GRID_COLUMNS} base_layer_id=${GRID_TILE_BUTTON_BASE_LAYER_ID} circle_layer_id=${GRID_TILE_BUTTON_CIRCLE_LAYER_ID} offset_y=${GRID_TILE_BUTTON_OFFSET_Y} per_frame=${GRID_TILE_BUTTONS_PER_FRAME}`)
    auditGridTileBindings(cells, true)
    refreshGridTileButtonVisibility(cells, 1)
  }
}

function createGridTileButton(cell: LlkGridCell, onClick: GridCellClickHandler): boolean {
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
  if (registerGridTileButtonTouch(cell, baseLayer, "ui-layer", onClick)) {
    cell.buttonTouchBindingCount += 1
  }
  if (registerGridTileButtonTouch(cell, baseNode, "ui-base", onClick)) {
    cell.buttonTouchBindingCount += 1
  }
  if (registerGridTileButtonTouch(cell, circleNode, "ui-circle", onClick)) {
    cell.buttonTouchBindingCount += 1
  }
  return true
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

export function getTileHeightLevels(cell: LlkGridCell): TileHeightLevels {
  if (GRID_TILE_BLOCK_USE_DECORATION) {
    return {
      bottomY: GRID_TILE_BLOCK_Y - GRID_TILE_BLOCK_SCALE_Y * 0.5,
      middleY: GRID_TILE_BLOCK_Y,
      topY: GRID_TILE_BLOCK_Y + GRID_TILE_BLOCK_SCALE_Y * 0.5,
    }
  }

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
  const tileY = position !== null && position !== undefined ? position.y : GRID_TILE_BLOCK_Y
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

function drawBlockAxesAtY(centerX: number, centerZ: number, halfX: number, halfZ: number, y: number, color: any): void {
  ;(GameAPI as any).draw_line(math.Vector3(asFixed(centerX - halfX), asFixed(y), asFixed(centerZ)), math.Vector3(asFixed(centerX + halfX), asFixed(y), asFixed(centerZ)), color, asFixed(TILE_HEIGHT_MARK_DURATION))
  ;(GameAPI as any).draw_line(math.Vector3(asFixed(centerX), asFixed(y), asFixed(centerZ - halfZ)), math.Vector3(asFixed(centerX), asFixed(y), asFixed(centerZ + halfZ)), color, asFixed(TILE_HEIGHT_MARK_DURATION))
}

function auditGridTileBindings(cells: LlkGridCell[], requireButton: boolean): void {
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

    if (requireButton && (cell.buttonLayer === null || cell.buttonLayer === undefined || cell.buttonNode === null || cell.buttonNode === undefined || cell.buttonPosition === null)) {
      missingButton += 1
    } else if (requireButton && cell.buttonPosition !== null && (math.abs(cell.buttonPosition.x - expectedX) > 0.01 || math.abs(cell.buttonPosition.z - expectedZ) > 0.01)) {
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
    if (requireButton && cell.buttonTouchBindingCount <= 0) {
      missingButtonTouch += 1
    }
    if (requireButton && cell.buttonTouchBindingCount >= 3) {
      fullButtonTouch += 1
    }
  }

  print(`[GridTileBindingAudit] playable=${playable} requireButton=${requireButton} missingTile=${missingTile} missingSticker=${missingSticker} missingButton=${missingButton} missingClickProxy=${missingClickProxy} badTileXZ=${badTileXZ} badStickerXZ=${badStickerXZ} badButtonXZ=${badButtonXZ} badClickProxyXZ=${badClickProxyXZ} missingTileTouch=${missingTileTouch} missingClickProxyTouch=${missingClickProxyTouch} missingButtonTouch=${missingButtonTouch} fullButtonTouch=${fullButtonTouch}`)
}

export function destroyCellVisuals(cell: LlkGridCell): void {
  cell.selectionVisualToken += 1
  destroySelectionEffectVisual(cell)
  destroySelectionRangeVisual(cell)
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
