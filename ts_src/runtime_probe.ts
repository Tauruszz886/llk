import { safeCall } from "@common/engine_safe"
import { RUNTIME_UNIT_PROBE_DELAY_FRAMES, RUNTIME_UNIT_PROBE_ID } from "./config"

declare const _G: any

export function scheduleRuntimeUnitProbe(reason: string): void {
  probeRuntimeUnit(reason, 0)
  ;(LuaAPI as any).call_delay_frame(RUNTIME_UNIT_PROBE_DELAY_FRAMES, () => {
    probeRuntimeUnit(reason, RUNTIME_UNIT_PROBE_DELAY_FRAMES)
  })
}

function probeRuntimeUnit(reason: string, delayedFrames: number): void {
  const unit = safeCall(
    () => {
      return GameAPI.get_unit(RUNTIME_UNIT_PROBE_ID)
    },
    { tag: "llk_probe_runtime_unit_by_id", fallback: null, logger: print },
  )

  const exists = unit !== null && unit !== undefined
  _G.llkRuntimeUnitProbe2012635691Exists = exists
  if (!exists) {
    print(`[LlkRuntimeUnitProbe] unit_id=${RUNTIME_UNIT_PROBE_ID} exists=false reason=${reason} delay_frames=${delayedFrames}`)
    return
  }

  const runtimeUnitId = safeCall(
    () => {
      return (LuaAPI as any).get_unit_id(unit)
    },
    { tag: "llk_probe_runtime_unit_lua_id", fallback: 0, logger: print },
  )
  const name = safeCall(
    () => {
      return (unit as any).get_name()
    },
    { tag: "llk_probe_runtime_unit_name", fallback: "", logger: print },
  )
  const key = safeCall(
    () => {
      return (unit as any).get_key()
    },
    { tag: "llk_probe_runtime_unit_key", fallback: 0, logger: print },
  )
  const position = safeCall(
    () => {
      return (unit as any).get_position()
    },
    { tag: "llk_probe_runtime_unit_position", fallback: null, logger: print },
  )
  const scale = safeCall(
    () => {
      return (unit as any).get_scale()
    },
    { tag: "llk_probe_runtime_unit_scale", fallback: null, logger: print },
  )

  print(
    `[LlkRuntimeUnitProbe] unit_id=${RUNTIME_UNIT_PROBE_ID} exists=true reason=${reason} delay_frames=${delayedFrames}` +
      ` lua_unit_id=${tostring(runtimeUnitId)} key=${tostring(key)} name=${tostring(name)}` +
      ` pos=${formatVector(position)} scale=${formatVector(scale)}`,
  )
}

function formatVector(value: Vector3 | null | undefined): string {
  if (value === null || value === undefined) {
    return "nil"
  }
  return `${tostring(value.x)},${tostring(value.y)},${tostring(value.z)}`
}
