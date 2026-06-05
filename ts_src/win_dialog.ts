import { safeCall } from "@common/engine_safe"
import { GRID_TILE_UI_TOUCH_EVENT_TYPES, LLK_WIN_DIALOG_BUTTON_STYLE_ID, LLK_WIN_DIALOG_LABEL_STYLE_ID } from "./config"
import { asFixed } from "./utils"

type WinDialogHandle = {
  nodes: any[]
  decided: boolean
}

let currentDialog: WinDialogHandle | null = null

function getRuntimeRoles(): any[] {
  const roles = safeCall(
    () => GameAPI.get_all_valid_roles(),
    { tag: "llk_win_dialog_get_valid_roles", fallback: [], logger: print },
  )
  if (roles !== null && roles !== undefined && roles.length > 0) {
    return roles as any[]
  }
  const fallbackRoles = safeCall(
    () => GameAPI.get_all_roles(),
    { tag: "llk_win_dialog_get_roles", fallback: [], logger: print },
  )
  return fallbackRoles !== null && fallbackRoles !== undefined ? (fallbackRoles as any[]) : []
}

function setNodeVisibleForAll(node: any, visible: boolean): void {
  const roles = getRuntimeRoles()
  for (let index = 0; index < roles.length; index += 1) {
    const role = roles[index] as any
    safeCall(
      () => {
        role.set_node_visible(node, visible)
        role.set_node_touch_enabled(node, visible)
        return true
      },
      { tag: "llk_win_dialog_set_node_visible", fallback: false, logger: print },
    )
  }
}

function setButtonTextForAll(button: any, text: string): void {
  const roles = getRuntimeRoles()
  for (let index = 0; index < roles.length; index += 1) {
    const role = roles[index] as any
    safeCall(
      () => {
        role.set_button_text(button, text)
        role.set_node_touch_enabled(button, true)
        return true
      },
      { tag: "llk_win_dialog_set_button_text", fallback: false, logger: print },
    )
  }
}

function showWinText(level: number): void {
  const roles = getRuntimeRoles()
  for (let index = 0; index < roles.length; index += 1) {
    const role = roles[index] as any
    safeCall(
      () => {
        role.show_text(`第 ${level} 关完成`, 2.0)
        role.show_tips("请选择是否继续下一关")
        return true
      },
      { tag: "llk_win_dialog_show_text", fallback: false, logger: print },
    )
  }
}

function registerButton(button: any, actionName: string, callback: () => void): void {
  for (let index = 0; index < GRID_TILE_UI_TOUCH_EVENT_TYPES.length; index += 1) {
    const touchEventType = GRID_TILE_UI_TOUCH_EVENT_TYPES[index]
    safeCall(
      () => {
        ;(LuaAPI as any).global_register_trigger_event([EVENT.EUI_NODE_TOUCH_EVENT, button, touchEventType], () => {
          if (currentDialog === null || currentDialog.decided) {
            return
          }
          currentDialog.decided = true
          hideWinDialog()
          print(`[LlkWinDialog] action=${actionName}`)
          callback()
        })
        return true
      },
      { tag: `llk_win_dialog_register_${actionName}`, fallback: false, logger: print },
    )
  }
}

export function hideWinDialog(): void {
  if (currentDialog === null) {
    return
  }
  for (let index = 0; index < currentDialog.nodes.length; index += 1) {
    setNodeVisibleForAll(currentDialog.nodes[index], false)
  }
  currentDialog = null
}

export function showWinDialog(level: number, onContinue: () => void): void {
  hideWinDialog()
  showWinText(level)

  const parent = undefined as any
  const title = safeCall(
    () => {
      return (GameAPI as any).create_eui_label_at_position(
        LLK_WIN_DIALOG_LABEL_STYLE_ID,
        parent,
        asFixed(880),
        asFixed(360),
        asFixed(520),
        asFixed(110),
        "LLK_WIN_DIALOG_TITLE",
        `第 ${level} 关完成`,
      )
    },
    { tag: "llk_create_win_dialog_title", fallback: null, logger: print },
  )
  const continueButton = safeCall(
    () => {
      return (GameAPI as any).create_eui_button_at_position(
        LLK_WIN_DIALOG_BUTTON_STYLE_ID,
        parent,
        asFixed(860),
        asFixed(500),
        asFixed(240),
        asFixed(86),
        "LLK_WIN_DIALOG_CONTINUE",
      )
    },
    { tag: "llk_create_win_dialog_continue", fallback: null, logger: print },
  )
  const nodes: any[] = []
  if (title !== null && title !== undefined) {
    nodes.push(title)
  }
  if (continueButton !== null && continueButton !== undefined) {
    nodes.push(continueButton)
    setButtonTextForAll(continueButton, "继续下一关")
    registerButton(continueButton, "continue", onContinue)
  }
  if (nodes.length === 0) {
    print(`[LlkWinDialog] eui_unavailable level=${level}`)
    return
  }

  currentDialog = { nodes, decided: false }
  for (let index = 0; index < nodes.length; index += 1) {
    setNodeVisibleForAll(nodes[index], true)
  }
  print(`[LlkWinDialog] shown level=${level} nodes=${nodes.length}`)
}
