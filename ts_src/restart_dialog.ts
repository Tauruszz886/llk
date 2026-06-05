import { safeCall, safeCreateObstacle, safeDestroyUnit } from "@common/engine_safe"
import {
  GRID_TILE_CLICK_PROXY_UNIT_ID,
  GRID_TILE_UI_TOUCH_EVENT_TYPES,
  LLK_RESTART_BUTTON_NODE_ID,
  LLK_RESTART_BUTTON_NODE_NAME,
  LLK_RESTART_BUTTON_TEXT,
  LLK_RESTART_TIMEOUT_TEXT,
  LLK_RESTART_MODEL_PROXY_SCALE_X,
  LLK_RESTART_MODEL_PROXY_SCALE_Y,
  LLK_RESTART_MODEL_PROXY_SCALE_Z,
  LLK_RESTART_MODEL_PROXY_Y,
  TILE_CENTER_X,
  TILE_CENTER_Z,
} from "./config"
import { asFixed } from "./utils"
import { enableGridTileTouchTarget } from "./touch"

declare function tostring(value: unknown): string

type RestartDialogHandle = {
  node: any
  modelProxyUnit: any | null
  decided: boolean
}

let currentDialog: RestartDialogHandle | null = null
let currentRestartCallback: (() => void) | null = null
let restartButtonNode: any | null = null
let registeredRestartButtonNode: any | null = null
let restartButtonIdRegistered = false
let restartButtonCustomEventsRegistered = false

export function hideRestartDialog(): void {
  const node = currentDialog !== null ? currentDialog.node : getExistingRestartButtonNode()
  if (node !== null && node !== undefined) {
    setNodeVisibleForAll(node, false)
    setNodeVisibleGlobal(node, false)
  }
  const modelProxyUnit = currentDialog !== null ? currentDialog.modelProxyUnit : null
  if (modelProxyUnit !== null && modelProxyUnit !== undefined) {
    safeDestroyUnit(modelProxyUnit, { tag: "llk_restart_dialog_destroy_model_proxy", logger: print })
  }
  currentDialog = null
  currentRestartCallback = null
}

export function showRestartDialog(level: number, onRestart: () => void, message = LLK_RESTART_TIMEOUT_TEXT): void {
  hideRestartDialog()
  showFailText(message)

  const restartButton = getRestartButtonNode()
  const modelProxyUnit = createRestartModelProxy()
  currentDialog = { node: restartButton, modelProxyUnit, decided: false }
  currentRestartCallback = onRestart
  registerRestartButtonTargetOnce(restartButton, "node")
  registerRestartButtonTargetOnce(LLK_RESTART_BUTTON_NODE_ID as unknown as any, "id")
  registerRestartButtonCustomEventsOnce()
  setButtonTextForAll(restartButton, LLK_RESTART_BUTTON_TEXT)
  setRestartButtonVisible(true)
  print(`[LlkRestartDialog] shown level=${level} node=${LLK_RESTART_BUTTON_NODE_ID} name=${LLK_RESTART_BUTTON_NODE_NAME} model_proxy=${modelProxyUnit !== null} message=${message}`)
}

function getRestartButtonNode(): any {
  if (restartButtonNode !== null && restartButtonNode !== undefined) {
    return restartButtonNode
  }

  const existing = getExistingRestartButtonNode()
  if (existing !== null && existing !== undefined) {
    restartButtonNode = existing
    return existing
  }

  restartButtonNode = LLK_RESTART_BUTTON_NODE_ID
  return restartButtonNode
}

function getExistingRestartButtonNode(): any {
  const queriedByName = safeCall(
    () => {
      return (LuaAPI as any).query_ui_node(LLK_RESTART_BUTTON_NODE_NAME)
    },
    { tag: "llk_restart_dialog_query_button_by_name", fallback: null, logger: print },
  )
  if (queriedByName !== null && queriedByName !== undefined) {
    print(`[LlkRestartDialog] using_existing_button name=${LLK_RESTART_BUTTON_NODE_NAME} id=${LLK_RESTART_BUTTON_NODE_ID}`)
    return queriedByName
  }
  const idNode = LLK_RESTART_BUTTON_NODE_ID as unknown as any
  const canUseIdNode = setNodeVisibleGlobal(idNode, false) || setNodeVisibleForAll(idNode, false)
  if (canUseIdNode) {
    print(`[LlkRestartDialog] using_existing_button id=${LLK_RESTART_BUTTON_NODE_ID}`)
    return idNode
  }
  return null
}

function registerRestartButtonTargetOnce(button: any, source: string): void {
  if (source === "id") {
    if (restartButtonIdRegistered) {
      return
    }
    restartButtonIdRegistered = true
  } else if (registeredRestartButtonNode === button) {
    return
  } else {
    registeredRestartButtonNode = button
  }

  for (let index = 0; index < GRID_TILE_UI_TOUCH_EVENT_TYPES.length; index += 1) {
    const touchEventType = GRID_TILE_UI_TOUCH_EVENT_TYPES[index]
    safeCall(
      () => {
        ;(LuaAPI as any).global_register_trigger_event([EVENT.EUI_NODE_TOUCH_EVENT, button, touchEventType], (_eventName: string, _actor: unknown, eventData: any) => {
          const nodeText = eventData !== null && eventData !== undefined ? tostring(eventData.eui_node_id) : "nil"
          handleRestartButtonPressed(`${source}:touch_type${touchEventType}:node${nodeText}`)
        })
        return true
      },
      { tag: "llk_restart_dialog_register_button", fallback: false, logger: print },
    )
  }
}

function registerRestartButtonCustomEventsOnce(): void {
  if (restartButtonCustomEventsRegistered) {
    return
  }
  restartButtonCustomEventsRegistered = true
  const eventNames = [LLK_RESTART_BUTTON_NODE_ID, LLK_RESTART_BUTTON_NODE_NAME, LLK_RESTART_BUTTON_TEXT, "restart", "button_click"]
  for (let index = 0; index < eventNames.length; index += 1) {
    const eventName = eventNames[index]
    safeCall(
      () => {
        ;(LuaAPI as any).global_register_trigger_event([EVENT.UI_CUSTOM_EVENT, eventName], (_eventName: string, _actor: unknown, _eventData: unknown) => {
          handleRestartButtonPressed(`custom:${eventName}`)
        })
        return true
      },
      { tag: "llk_restart_dialog_register_custom_event", fallback: false, logger: print },
    )
  }
}

function handleRestartButtonPressed(source: string): void {
  print(`[LlkRestartDialog] pressed source=${source} active=${currentDialog !== null}`)
  if (currentDialog === null || currentDialog.decided) {
    return
  }
  currentDialog.decided = true
  const callback = currentRestartCallback
  hideRestartDialog()
  print(`[LlkRestartDialog] action=restart source=${source}`)
  if (callback !== null) {
    callback()
  }
}

function showFailText(message: string): void {
  const roles = getRuntimeRoles()
  for (let index = 0; index < roles.length; index += 1) {
    const role = roles[index] as any
    safeCall(
      () => {
        role.show_text(message, 2.0)
        role.show_tips(message)
        return true
      },
      { tag: "llk_restart_dialog_show_text", fallback: false, logger: print },
    )
  }
}

function setButtonTextForAll(button: any, text: string): void {
  safeCall(
    () => {
      ;(GameAPI as any).set_button_text(button, text)
      return true
    },
    { tag: "llk_restart_dialog_global_set_button_text", fallback: false, logger: print },
  )
  const roles = getRuntimeRoles()
  for (let index = 0; index < roles.length; index += 1) {
    const role = roles[index] as any
    safeCall(
      () => {
        role.set_button_text(button, text)
        role.set_node_touch_enabled(button, false)
        return true
      },
      { tag: "llk_restart_dialog_set_button_text", fallback: false, logger: print },
    )
  }
}

function setRestartButtonVisible(visible: boolean): void {
  const node = currentDialog !== null ? currentDialog.node : getRestartButtonNode()
  setNodeVisibleGlobal(node, visible)
  setNodeVisibleForAll(node, visible)
}

function setNodeVisibleGlobal(node: any, visible: boolean): boolean {
  return safeCall(
    () => {
      ;(GameAPI as any).set_node_visible(node, visible)
      return true
    },
    { tag: "llk_restart_dialog_global_set_node_visible", fallback: false, logger: print },
  ) === true
}

function setNodeVisibleForAll(node: any, visible: boolean): boolean {
  const roles = getRuntimeRoles()
  let updated = false
  for (let index = 0; index < roles.length; index += 1) {
    const role = roles[index] as any
    const ok = safeCall(
      () => {
        role.set_node_visible(node, visible)
        role.set_node_touch_enabled(node, false)
        role.set_ui_opacity(node, asFixed(visible ? 255 : 0))
        return true
      },
      { tag: "llk_restart_dialog_set_node_visible", fallback: false, logger: print },
    ) === true
    updated = updated || ok
  }
  return updated
}

function createRestartModelProxy(): any | null {
  const created = safeCreateObstacle(
    GRID_TILE_CLICK_PROXY_UNIT_ID,
    math.Vector3(asFixed(TILE_CENTER_X), asFixed(LLK_RESTART_MODEL_PROXY_Y), asFixed(TILE_CENTER_Z)),
    math.Vector3(asFixed(LLK_RESTART_MODEL_PROXY_SCALE_X), asFixed(LLK_RESTART_MODEL_PROXY_SCALE_Y), asFixed(LLK_RESTART_MODEL_PROXY_SCALE_Z)),
    { tag: "llk_restart_dialog_create_model_proxy", logger: print },
  )
  if (created === null || created === undefined) {
    print("[LlkRestartDialog] create_model_proxy_failed")
    return null
  }
  enableGridTileTouchTarget(created, "restart_model_proxy")
  safeCall(
    () => {
      created.set_model_visible(false)
      return true
    },
    { tag: "llk_restart_dialog_hide_model_proxy", fallback: false, logger: print },
  )
  registerRestartModelProxy(created)
  print(`[LlkRestartDialog] created_model_proxy unit_id=${GRID_TILE_CLICK_PROXY_UNIT_ID} pos=(${TILE_CENTER_X},${LLK_RESTART_MODEL_PROXY_Y},${TILE_CENTER_Z}) scale=(${LLK_RESTART_MODEL_PROXY_SCALE_X},${LLK_RESTART_MODEL_PROXY_SCALE_Y},${LLK_RESTART_MODEL_PROXY_SCALE_Z})`)
  return created
}

function registerRestartModelProxy(unit: any): void {
  safeCall(
    () => {
      ;(LuaAPI as any).unit_register_trigger_event(unit, [EVENT.SPEC_OBSTACLE_TOUCH_BEGIN], () => {
        handleRestartButtonPressed("model-proxy-touch")
      })
      return true
    },
    { tag: "llk_restart_dialog_register_model_proxy_touch", fallback: false, logger: print },
  )
  safeCall(
    () => {
      ;(LuaAPI as any).unit_register_trigger_event(unit, [EVENT.SPEC_OBSTACLE_INTERACTED], () => {
        handleRestartButtonPressed("model-proxy-interacted")
      })
      return true
    },
    { tag: "llk_restart_dialog_register_model_proxy_interacted", fallback: false, logger: print },
  )
}

function getRuntimeRoles(): any[] {
  const roles = safeCall(
    () => GameAPI.get_all_valid_roles(),
    { tag: "llk_restart_dialog_get_valid_roles", fallback: [], logger: print },
  )
  if (roles !== null && roles !== undefined && roles.length > 0) {
    return roles as any[]
  }
  const fallbackRoles = safeCall(
    () => GameAPI.get_all_roles(),
    { tag: "llk_restart_dialog_get_roles", fallback: [], logger: print },
  )
  return fallbackRoles !== null && fallbackRoles !== undefined ? (fallbackRoles as any[]) : []
}
