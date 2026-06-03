import { safeCall, safeCreateDecoration, safeCreateObstacle, safeDestroySceneUi, safeDestroyUnit } from "@common/engine_safe"
import {
  BLOCK_AXIS_SAMPLE_ONLY,
  EMPTY_GRID_VALUE,
  GRID_CELL_SIZE,
  GRID_COLUMNS,
  GRID_LINE_DURATION,
  GRID_ROWS,
  GRID_TILE_BLOCK_COLOR,
  GRID_TILE_BLOCK_SCALE_X,
  GRID_TILE_BLOCK_SCALE_Y,
  GRID_TILE_BLOCK_SCALE_Z,
  GRID_TILE_BLOCK_SELECTED_COLOR,
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
  GRID_TILE_CLICK_PROXY_SCALE_X,
  GRID_TILE_CLICK_PROXY_SCALE_Y,
  GRID_TILE_CLICK_PROXY_SCALE_Z,
  GRID_TILE_CLICK_PROXY_SELECTED_COLOR,
  GRID_TILE_CLICK_PROXY_UNIT_ID,
  GRID_TILE_STICKER_BACKWARD_PITCH,
  GRID_TILE_STICKER_RIGHT_YAW,
  GRID_TILE_STICKER_SCALE_Y,
  GRID_TILE_STICKER_SURFACE_OFFSET_Y,
  GRID_TILE_STICKER_TARGET_SIZE,
  GRID_TILE_STICKERS_PER_FRAME,
  STICKER_SOURCES,
  TILE_HEIGHT_MARK_DURATION,
  TILE_HEIGHT_MARKERS_VISIBLE,
} from "./config"
import { flattenGridCells, getGridBounds } from "./grid"
import { enableGridTileTouchTarget, registerGridTileButtonTouch, registerGridTileUnitTouch } from "./touch"
import type { GridCellClickHandler, LlkGridCell, StickerSource, TileHeightLevels } from "./types"
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
      cell.tileTouchRegistered = registerGridTileUnitTouch(cell, cell.tileUnit, "block", onClick)
    }
  }

  if (endIndex < cells.length) {
    ;(LuaAPI as any).call_delay_frame(1, () => {
      createGridTileBlocksBatch(cells, endIndex, created, onClick)
    })
  } else {
    print(`[GridTileBlocks] created=${created}/${GRID_ROWS * GRID_COLUMNS} unit_id=${GRID_TILE_BLOCK_UNIT_ID} scale=(${GRID_TILE_BLOCK_SCALE_X},${GRID_TILE_BLOCK_SCALE_Y},${GRID_TILE_BLOCK_SCALE_Z}) per_frame=${GRID_TILE_BLOCKS_PER_FRAME}`)
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

  const created = safeCreateObstacle(
    GRID_TILE_BLOCK_UNIT_ID,
    math.Vector3(asFixed(cell.x), asFixed(GRID_TILE_BLOCK_Y), asFixed(cell.z)),
    math.Vector3(asFixed(GRID_TILE_BLOCK_SCALE_X), asFixed(GRID_TILE_BLOCK_SCALE_Y), asFixed(GRID_TILE_BLOCK_SCALE_Z)),
    { tag: "llk_grid_tile_block", logger: print },
  )
  if (created !== null && created !== undefined) {
    setGridTileBlockColor(created)
    enableGridTileTouchTarget(created, "tile")
  }
  return created
}

export function setCellSelected(cell: LlkGridCell, selected: boolean): void {
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
