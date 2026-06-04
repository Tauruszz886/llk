import { safeCall } from "@common/engine_safe"
import { RUNTIME_GROUND_TILE_NAME, RUNTIME_GROUND_TILE_UNIT_ID } from "./config"

export function hideRuntimeGroundTile(): void {
  let hiddenCount = 0
  hiddenCount += hideGroundTileById()
  hiddenCount += hideGroundTileByName()
  print(`[RuntimeGroundTile] hidden_attempts=${hiddenCount} unit_id=${RUNTIME_GROUND_TILE_UNIT_ID} name=${RUNTIME_GROUND_TILE_NAME}`)
}

function hideGroundTileById(): number {
  const unit = safeCall(
    () => {
      return GameAPI.get_unit(RUNTIME_GROUND_TILE_UNIT_ID)
    },
    { tag: "llk_get_ground_tile_by_id", fallback: null, logger: print },
  )
  return hideGroundTileUnit(unit, "id")
}

function hideGroundTileByName(): number {
  const byRuntimeName = safeCall(
    () => {
      return (LuaAPI as any).query_unit(RUNTIME_GROUND_TILE_NAME)
    },
    { tag: "llk_query_ground_tile_by_name", fallback: null, logger: print },
  )
  const hiddenByRuntimeName = hideGroundTileUnit(byRuntimeName, "runtime_name")

  const unitId = safeCall(
    () => {
      return GameAPI.get_unit_id_by_name(RUNTIME_GROUND_TILE_NAME)
    },
    { tag: "llk_get_ground_tile_id_by_name", fallback: 0, logger: print },
  )
  if (unitId === 0 || unitId === null || unitId === undefined) {
    return hiddenByRuntimeName
  }

  const byGameName = safeCall(
    () => {
      return GameAPI.get_unit(unitId)
    },
    { tag: "llk_get_ground_tile_by_named_id", fallback: null, logger: print },
  )
  return hiddenByRuntimeName + hideGroundTileUnit(byGameName, "game_name")
}

function hideGroundTileUnit(unit: any, source: string): number {
  if (unit === null || unit === undefined) {
    return 0
  }

  safeCall(
    () => {
      unit.set_model_visible(false)
      return true
    },
    { tag: `llk_hide_ground_tile_model_${source}`, fallback: false, logger: print },
  )

  const roles = safeCall(
    () => {
      return GameAPI.get_all_roles()
    },
    { tag: `llk_get_roles_for_ground_tile_hide_${source}`, fallback: [], logger: print },
  )
  const roleList = roles !== null && roles !== undefined ? (roles as any[]) : []
  for (let index = 0; index < roleList.length; index += 1) {
    const role = roleList[index] as any
    safeCall(
      () => {
        role.set_unit_visible(unit, false, true)
        return true
      },
      { tag: `llk_hide_ground_tile_for_role_${source}`, fallback: false, logger: print },
    )
  }

  return 1
}
