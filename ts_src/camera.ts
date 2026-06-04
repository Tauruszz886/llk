import { safeCall } from "@common/engine_safe"
import { asFixed } from "./utils"

type FrozenRoleState = {
  ctrlUnit: any
  position: Vector3
  physicsDisabled: boolean
}

const ROLE_FREEZE_ENFORCE_INTERVAL_FRAMES = 5
const ZERO_VECTOR = math.Vector3(asFixed(0), asFixed(0), asFixed(0))

let frozenRoleStates: FrozenRoleState[] = []
let roleFreezeLoopStarted = false

export function disableJoystickControl(role: any): void {
  safeCall(
    () => {
      role.set_role_ctrl_enabled(false)
      return true
    },
    { tag: "llk_disable_role_ctrl_enabled", fallback: false, logger: print },
  )

  safeCall(
    () => {
      role.set_role_ctrl(false)
      return true
    },
    { tag: "llk_disable_role_ctrl", fallback: false, logger: print },
  )

  safeCall(
    () => {
      const ctrlUnit = role.get_ctrl_unit()
      if (ctrlUnit !== null && ctrlUnit !== undefined) {
        ctrlUnit.set_aim_move_enabled(false)
        ctrlUnit.set_aim_move_mode(false)
        hideRoleControlUnit(role, ctrlUnit)
      }
      return true
    },
    { tag: "llk_disable_character_aim_move", fallback: false, logger: print },
  )
}

export function applyRuntimeInputLocks(): number {
  const roles = GameAPI.get_all_roles()
  for (let index = 0; index < roles.length; index += 1) {
    disableJoystickControl(roles[index] as any)
  }
  return roles.length
}

export function startRuntimeRoleFreeze(): void {
  if (roleFreezeLoopStarted) {
    return
  }

  roleFreezeLoopStarted = true
  enforceRuntimeRoleFreeze()
}

function enforceRuntimeRoleFreeze(): void {
  const roles = GameAPI.get_all_roles()
  for (let index = 0; index < roles.length; index += 1) {
    const role = roles[index] as any
    disableJoystickControl(role)
    freezeRoleControlUnit(role, index)
  }

  ;(LuaAPI as any).call_delay_frame(ROLE_FREEZE_ENFORCE_INTERVAL_FRAMES, () => {
    enforceRuntimeRoleFreeze()
  })
}

function freezeRoleControlUnit(role: any, roleIndex: number): void {
  const ctrlUnit = safeCall(
    () => {
      return role.get_ctrl_unit()
    },
    { tag: "llk_get_ctrl_unit_for_freeze", fallback: null, logger: print },
  )
  if (ctrlUnit === null || ctrlUnit === undefined) {
    return
  }

  const state = getFrozenRoleState(roleIndex, ctrlUnit)
  if (!state.physicsDisabled) {
    disableCharacterPhysics(ctrlUnit)
    state.physicsDisabled = true
  }
  keepCharacterAtFrozenPosition(ctrlUnit, state.position)
}

function getFrozenRoleState(roleIndex: number, ctrlUnit: any): FrozenRoleState {
  const current = frozenRoleStates[roleIndex]
  if (current !== undefined && current.ctrlUnit === ctrlUnit) {
    return current
  }

  const position = safeCall(
    () => {
      return ctrlUnit.get_position()
    },
    { tag: "llk_get_initial_frozen_role_position", fallback: ZERO_VECTOR, logger: print },
  )
  const state = {
    ctrlUnit,
    position: position !== null && position !== undefined ? position : ZERO_VECTOR,
    physicsDisabled: false,
  }
  frozenRoleStates[roleIndex] = state
  print(`[RoleFreeze] captured role_index=${roleIndex} position=(${state.position.x},${state.position.y},${state.position.z})`)
  return state
}

function disableCharacterPhysics(ctrlUnit: any): void {
  hideRoleControlUnit(null, ctrlUnit)

  safeCall(
    () => {
      ctrlUnit.set_linear_velocity(ZERO_VECTOR)
      return true
    },
    { tag: "llk_zero_character_linear_velocity_once", fallback: false, logger: print },
  )

  safeCall(
    () => {
      ctrlUnit.set_angular_velocity(ZERO_VECTOR)
      return true
    },
    { tag: "llk_zero_character_angular_velocity_once", fallback: false, logger: print },
  )

  safeCall(
    () => {
      ctrlUnit.disable_gravity()
      return true
    },
    { tag: "llk_disable_character_gravity", fallback: false, logger: print },
  )

  safeCall(
    () => {
      ctrlUnit.set_physics_active(false)
      return true
    },
    { tag: "llk_disable_character_physics", fallback: false, logger: print },
  )

  safeCall(
    () => {
      ctrlUnit.set_max_linear_velocity(asFixed(0))
      return true
    },
    { tag: "llk_set_character_max_velocity_zero", fallback: false, logger: print },
  )

  safeCall(
    () => {
      ctrlUnit.stop_forced_move()
      return true
    },
    { tag: "llk_stop_character_forced_move", fallback: false, logger: print },
  )

  safeCall(
    () => {
      ctrlUnit.set_character_creature_jump_speed_ratio(asFixed(0))
      return true
    },
    { tag: "llk_zero_character_jump_speed", fallback: false, logger: print },
  )

  safeCall(
    () => {
      ctrlUnit.set_climb_enabled(false)
      return true
    },
    { tag: "llk_disable_character_climb", fallback: false, logger: print },
  )
}

function hideRoleControlUnit(role: any, ctrlUnit: any): void {
  safeCall(
    () => {
      ctrlUnit.set_model_visible(false)
      return true
    },
    { tag: "llk_hide_character_model", fallback: false, logger: print },
  )

  if (role !== null && role !== undefined) {
    safeCall(
      () => {
        role.set_unit_visible(ctrlUnit, false, true)
        return true
      },
      { tag: "llk_hide_character_for_role", fallback: false, logger: print },
    )
  }
}

function keepCharacterAtFrozenPosition(ctrlUnit: any, position: Vector3): void {
  safeCall(
    () => {
      ctrlUnit.set_position(position)
      return true
    },
    { tag: "llk_keep_character_position", fallback: false, logger: print },
  )
}
