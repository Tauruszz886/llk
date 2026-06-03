import { safeCall } from "@common/engine_safe"

export function applyCameraInteractionLocks(role: any): void {
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
    applyCameraInteractionLocks(roles[index] as any)
    disableJoystickControl(roles[index] as any)
  }
  return roles.length
}
