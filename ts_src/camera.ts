import { safeCall } from "@common/engine_safe"
import {
  CAMERA_BIND_MODE_BIND,
  CAMERA_HEIGHT_FOR_CANVAS_FRAME,
  CAMERA_PROJECTION_ORTHOGRAPHIC,
  CAMERA_PROP_BIND_MODE_OFFSET_X,
  CAMERA_PROP_BIND_MODE_OFFSET_Y,
  CAMERA_PROP_BIND_MODE_OFFSET_Z,
  CAMERA_PROP_BIND_MODE_PITCH,
  CAMERA_PROP_BIND_MODE_YAW,
  CAMERA_PROP_DIST,
  CAMERA_PROP_ORTHO_VIEW_HEIGHT,
  ORTHO_VIEW_HEIGHT_FOR_CANVAS_FRAME,
  TILE_CENTER,
} from "./config"
import { asFixed } from "./utils"

const CAMERA_STABILIZE_FRAME_DELAYS = [1, 30, 90, 180, 300]

export function applyCanvasFramingCamera(role: any): void {
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

export function disableJoystickControl(role: any): void {
  safeCall(
    () => {
      role.set_role_ctrl_enabled(true)
      return true
    },
    { tag: "keep_role_input_enabled_for_tile_touch", fallback: false, logger: print },
  )

  safeCall(
    () => {
      role.set_role_ctrl(true)
      return true
    },
    { tag: "keep_role_ctrl_enabled_for_tile_touch", fallback: false, logger: print },
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

export function lockRuntimeCamera(): number {
  const roles = GameAPI.get_all_roles()
  for (let index = 0; index < roles.length; index += 1) {
    applyCanvasFramingCamera(roles[index] as any)
    disableJoystickControl(roles[index] as any)
  }
  stabilizeCanvasCamera(0)
  return roles.length
}

function stabilizeCanvasCamera(attemptIndex: number): void {
  if (attemptIndex >= CAMERA_STABILIZE_FRAME_DELAYS.length) {
    return
  }

  const delayFrames = CAMERA_STABILIZE_FRAME_DELAYS[attemptIndex]
  ;(LuaAPI as any).call_delay_frame(delayFrames, () => {
    applyCanvasCameraToCurrentRoles(attemptIndex + 1)
    stabilizeCanvasCamera(attemptIndex + 1)
  })
}

function applyCanvasCameraToCurrentRoles(attempt: number): void {
  const currentRoles = GameAPI.get_all_roles()
  for (let index = 0; index < currentRoles.length; index += 1) {
    applyCanvasFramingCamera(currentRoles[index] as any)
    disableJoystickControl(currentRoles[index] as any)
  }
  print(`[CameraStabilized] attempt=${attempt} role_count=${currentRoles.length}`)
}
