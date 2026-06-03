import { safeCall } from "@common/engine_safe"
import { GRID_TILE_UI_TOUCH_EVENT_TYPES } from "./config"
import type { GridCellClickHandler, LlkGridCell } from "./types"

declare function tostring(value: unknown): string

export function enableGridTileTouchTarget(unit: any, source: string): void {
  if (unit === null || unit === undefined) {
    return
  }

  safeCall(
    () => {
      ;(unit as any).set_touchable(true)
      return true
    },
    { tag: `llk_set_touchable_${source}`, fallback: false, logger: print },
  )

  safeCall(
    () => {
      ;(unit as any).set_touch_enable(true)
      return true
    },
    { tag: `llk_set_touch_enable_${source}`, fallback: false, logger: print },
  )

  safeCall(
    () => {
      unit.enable_interact()
      return true
    },
    { tag: `llk_enable_interact_${source}`, fallback: false, logger: print },
  )

  safeCall(
    () => {
      ;(unit as any).set_interact_enabled(true)
      return true
    },
    { tag: `llk_set_interact_enabled_${source}`, fallback: false, logger: print },
  )

  safeCall(
    () => {
      ;(unit as any).set_interact_enable(true)
      return true
    },
    { tag: `llk_set_interact_enable_${source}`, fallback: false, logger: print },
  )
}

export function registerGridTileButtonTouch(cell: LlkGridCell, touchTarget: any, touchSource: string, onClick: GridCellClickHandler): boolean {
  if (touchTarget === null || touchTarget === undefined) {
    return false
  }

  let registered = false
  for (let index = 0; index < GRID_TILE_UI_TOUCH_EVENT_TYPES.length; index += 1) {
    const touchEventType = GRID_TILE_UI_TOUCH_EVENT_TYPES[index]
    const ok = safeCall(
      () => {
        ;(LuaAPI as any).global_register_trigger_event([EVENT.EUI_NODE_TOUCH_EVENT, touchTarget, touchEventType], (_eventName: string, _actor: unknown, eventData: any) => {
          const nodeText = eventData !== null && eventData !== undefined ? tostring(eventData.eui_node_id) : "nil"
          onClick(cell, `${touchSource}:type${touchEventType}:node${nodeText}`)
        })
        return true
      },
      { tag: "llk_register_grid_tile_button_touch", fallback: false, logger: print },
    ) === true
    if (ok) {
      registered = true
    }
  }
  return registered
}

export function registerGridTileUnitTouch(cell: LlkGridCell, touchTarget: any, touchSource: string, onClick: GridCellClickHandler): boolean {
  if (touchTarget === null || touchTarget === undefined) {
    return false
  }

  const beginRegistered = safeCall(
    () => {
      ;(LuaAPI as any).unit_register_trigger_event(touchTarget, [EVENT.SPEC_OBSTACLE_TOUCH_BEGIN], (_eventName: string, _actor: unknown, _eventData: unknown) => {
        onClick(cell, touchSource)
      })
      return true
    },
    { tag: `llk_register_grid_tile_unit_touch_${touchSource}`, fallback: false, logger: print },
  ) === true
  const interactedRegistered = safeCall(
    () => {
      ;(LuaAPI as any).unit_register_trigger_event(touchTarget, [EVENT.SPEC_OBSTACLE_INTERACTED], (_eventName: string, _actor: unknown, _eventData: unknown) => {
        onClick(cell, `${touchSource}-interacted`)
      })
      return true
    },
    { tag: `llk_register_grid_tile_unit_interacted_${touchSource}`, fallback: false, logger: print },
  ) === true

  return beginRegistered || interactedRegistered
}
