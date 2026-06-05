import { safeCall } from "@common/engine_safe"
import {
  LLK_MATCH_SOUND_ASSET_PATH,
  LLK_MATCH_SOUND_BASE_VOLUME,
  LLK_MATCH_SOUND_COMBO_RESET_FRAMES,
  LLK_MATCH_SOUND_COMBO_VOLUME_STEP,
  LLK_MATCH_SOUND_DURATION_PER_GRID,
  LLK_MATCH_SOUND_KEY,
  LLK_MATCH_SOUND_MAX_DURATION,
  LLK_MATCH_SOUND_MAX_VOLUME,
  LLK_MATCH_SOUND_MIN_DURATION,
  LLK_BACKGROUND_AUDIO_STOP_BATCH_FRAMES,
  LLK_BACKGROUND_AUDIO_STOP_BATCH_SIZE,
  LLK_BACKGROUND_AUDIO_STOP_MAX_ID,
  LLK_MUTE_BACKGROUND_AUDIO_ON_START,
  LLK_SELECT_SOUND_ASSET_PATH,
  LLK_SELECT_SOUND_DURATION,
  LLK_SELECT_SOUND_KEY,
  LLK_SELECT_SOUND_VOLUME,
  LLK_SOUND_SPEED,
} from "./config"
import type { LinkPathResult, LlkGridCell } from "./types"
import { asFixed } from "./utils"

declare const _G: any

type AudioGameApi = {
  play_2d_sound?: (this: void, soundKey: SoundKey, loop?: boolean, volume?: Fixed) => SoundID
  play_3d_sound?: (this: void, position: Vector3, soundKey: SoundKey, duration?: Fixed, volume?: Fixed) => SoundID
  get_all_valid_roles?: (this: void) => Role[]
  get_all_roles?: (this: void) => Role[]
}

export type LlkSoundHandle = {
  tag: string
  soundIds: SoundID[]
}

let matchSoundComboCount = 0
let matchSoundComboToken = 0

export function muteBackgroundAudioOnStart(): void {
  if (!LLK_MUTE_BACKGROUND_AUDIO_ON_START) {
    return
  }
  print(`[LlkAudio] background_mute_start max_sound_id=${LLK_BACKGROUND_AUDIO_STOP_MAX_ID}`)
  stopBackgroundAudioBatch(1)
}

export function playLlkSelectSound(cell: LlkGridCell): void {
  playLlkSound({
    tag: "select",
    soundKey: resolveRuntimeSoundKey("llkSelectSoundKey", LLK_SELECT_SOUND_KEY),
    assetPath: LLK_SELECT_SOUND_ASSET_PATH,
    duration: LLK_SELECT_SOUND_DURATION,
    volume: LLK_SELECT_SOUND_VOLUME,
    position: getCellSoundPosition(cell),
    preferRole2d: true,
  })
}

export function playLlkMatchSound(cell: LlkGridCell, linkPath: LinkPathResult): LlkSoundHandle | null {
  const distance = getLinkPathGridDistance(linkPath)
  const duration = getMatchSoundDuration(distance)
  const volume = getNextMatchSoundVolume()
  print(`[LlkAudio] match_params distance=${distance} duration=${duration} volume=${volume} combo=${matchSoundComboCount}`)
  return playLlkSound({
    tag: "match",
    soundKey: resolveRuntimeSoundKey("llkMatchSoundKey", LLK_MATCH_SOUND_KEY),
    assetPath: LLK_MATCH_SOUND_ASSET_PATH,
    duration,
    volume,
    position: getCellSoundPosition(cell),
    preferRole2d: true,
  })
}

function getLinkPathGridDistance(linkPath: LinkPathResult): number {
  let distance = 0
  for (let index = 0; index < linkPath.points.length - 1; index += 1) {
    const start = linkPath.points[index]
    const finish = linkPath.points[index + 1]
    distance += math.abs(finish.column - start.column) + math.abs(finish.row - start.row)
  }
  return math.max(1, distance)
}

function getMatchSoundDuration(distance: number): number {
  return math.max(
    LLK_MATCH_SOUND_MIN_DURATION,
    math.min(LLK_MATCH_SOUND_MAX_DURATION, distance * LLK_MATCH_SOUND_DURATION_PER_GRID),
  )
}

function getNextMatchSoundVolume(): number {
  matchSoundComboCount += 1
  matchSoundComboToken += 1
  const token = matchSoundComboToken
  ;(LuaAPI as any).call_delay_frame(LLK_MATCH_SOUND_COMBO_RESET_FRAMES, () => {
    if (matchSoundComboToken === token) {
      matchSoundComboCount = 0
    }
  })
  return math.min(LLK_MATCH_SOUND_MAX_VOLUME, LLK_MATCH_SOUND_BASE_VOLUME + (matchSoundComboCount - 1) * LLK_MATCH_SOUND_COMBO_VOLUME_STEP)
}

export function stopLlkSound(handle: LlkSoundHandle | null): void {
  if (handle === null) {
    return
  }

  const roles = getRuntimeRoles()
  for (let index = 0; index < handle.soundIds.length; index += 1) {
    const soundId = handle.soundIds[index]
    stopGlobalSound(soundId)
    for (let roleIndex = 0; roleIndex < roles.length; roleIndex += 1) {
      stopRoleSound(roles[roleIndex], soundId)
    }
  }
  print(`[LlkAudio] stopped tag=${handle.tag} sound_count=${handle.soundIds.length}`)
}

function stopBackgroundAudioBatch(startSoundId: number): void {
  const endSoundId = math.min(LLK_BACKGROUND_AUDIO_STOP_MAX_ID, startSoundId + LLK_BACKGROUND_AUDIO_STOP_BATCH_SIZE - 1)
  const roles = getRuntimeRoles()
  for (let soundId = startSoundId; soundId <= endSoundId; soundId += 1) {
    stopGlobalSound(soundId)
    for (let index = 0; index < roles.length; index += 1) {
      stopRoleSound(roles[index], soundId)
    }
  }

  if (endSoundId >= LLK_BACKGROUND_AUDIO_STOP_MAX_ID) {
    print(`[LlkAudio] background_mute_done max_sound_id=${LLK_BACKGROUND_AUDIO_STOP_MAX_ID}`)
    return
  }

  ;(LuaAPI as any).call_delay_frame(LLK_BACKGROUND_AUDIO_STOP_BATCH_FRAMES, () => {
    stopBackgroundAudioBatch(endSoundId + 1)
  })
}

function stopGlobalSound(soundId: number): void {
  safeCall(
    () => {
      GameAPI.stop_sound(soundId as SoundID)
      return true
    },
    { tag: "llk_stop_background_global_sound", fallback: false, logger: silentAudioLogger },
  )
}

function stopRoleSound(role: Role, soundId: number): void {
  safeCall(
    () => {
      role.stop_2d_sound(soundId as SoundID)
      return true
    },
    { tag: "llk_stop_background_role_sound", fallback: false, logger: silentAudioLogger },
  )
}

function resolveRuntimeSoundKey(globalKey: string, configuredKey: number): number {
  const runtimeKey = _G[globalKey]
  if (type(runtimeKey) === "number" && runtimeKey > 0) {
    return runtimeKey as number
  }
  return configuredKey
}

function silentAudioLogger(_msg: string): void {}

function playLlkSound(opts: { tag: string; soundKey: number; assetPath: string; duration: number; volume: number; position: Vector3; preferRole2d: boolean }): LlkSoundHandle | null {
  if (opts.soundKey <= 0) {
    print(`[LlkAudio] skipped tag=${opts.tag} reason=missing_sound_key asset=${opts.assetPath}`)
    return null
  }

  if (opts.preferRole2d) {
    const roleHandle = playRole2dSound(opts)
    if (roleHandle !== null) {
      return roleHandle
    }
  }
  const globalHandle = playGlobal2dSound(opts)
  if (globalHandle !== null) {
    return globalHandle
  }
  if (!opts.preferRole2d) {
    const roleHandle = playRole2dSound(opts)
    if (roleHandle !== null) {
      return roleHandle
    }
  }
  return play3dSound(opts)
}

function playGlobal2dSound(opts: { tag: string; soundKey: number; volume: number }): LlkSoundHandle | null {
  const api = GameAPI as unknown as AudioGameApi
  if (api.play_2d_sound === undefined) {
    return null
  }

  const soundId = safeCall(
    () => {
      return api.play_2d_sound!(opts.soundKey as SoundKey, false, asFixed(opts.volume))
    },
    { tag: `llk_audio_${opts.tag}_global_2d`, fallback: undefined, logger: print },
  )
  if (soundId === undefined || soundId === -1) {
    return null
  }

  print(`[LlkAudio] played tag=${opts.tag} sound_key=${opts.soundKey} sound_id=${soundId} mode=global_2d`)
  return { tag: opts.tag, soundIds: [soundId] }
}

function playRole2dSound(opts: { tag: string; soundKey: number; duration: number; volume: number }): LlkSoundHandle | null {
  const roles = getRuntimeRoles()
  let played = 0
  let firstSoundId: SoundID | undefined = undefined
  const soundIds: SoundID[] = []
  for (let index = 0; index < roles.length; index += 1) {
    const role = roles[index]
    const soundId = safeCall(
      () => {
        return role.play_2d_sound_with_params(
          opts.soundKey as SoundID,
          asFixed(opts.duration),
          asFixed(opts.volume),
          asFixed(LLK_SOUND_SPEED),
        )
      },
      { tag: `llk_audio_${opts.tag}_role_2d`, fallback: undefined, logger: print },
    )
    if (soundId !== undefined && soundId !== -1) {
      played += 1
      soundIds.push(soundId)
      if (firstSoundId === undefined) {
        firstSoundId = soundId
      }
    }
  }

  if (played <= 0 || firstSoundId === undefined) {
    return null
  }

  print(`[LlkAudio] played tag=${opts.tag} sound_key=${opts.soundKey} sound_id=${firstSoundId} roles=${played} mode=role_2d`)
  return { tag: opts.tag, soundIds }
}

function play3dSound(opts: { tag: string; soundKey: number; duration: number; volume: number; position: Vector3 }): LlkSoundHandle | null {
  const soundId = safeCall(
    () => {
      return GameAPI.play_3d_sound(opts.position, opts.soundKey as SoundKey, asFixed(opts.duration), asFixed(opts.volume))
    },
    { tag: `llk_audio_${opts.tag}_3d`, fallback: undefined, logger: print },
  )
  if (soundId === undefined || soundId === -1) {
    print(`[LlkAudio] failed tag=${opts.tag} sound_key=${opts.soundKey}`)
    return null
  }

  print(`[LlkAudio] played tag=${opts.tag} sound_key=${opts.soundKey} sound_id=${soundId} mode=3d pos=(${opts.position.x},${opts.position.y},${opts.position.z})`)
  return { tag: opts.tag, soundIds: [soundId] }
}

function getRuntimeRoles(): Role[] {
  const api = GameAPI as unknown as AudioGameApi
  const roles = safeCall(
    () => {
      if (api.get_all_valid_roles !== undefined) {
        return api.get_all_valid_roles()
      }
      if (api.get_all_roles !== undefined) {
        return api.get_all_roles()
      }
      return []
    },
    { tag: "llk_audio_get_roles", fallback: [], logger: print },
  )
  return roles !== undefined ? roles : []
}

function getCellSoundPosition(cell: LlkGridCell): Vector3 {
  const unit = cell.clickProxyUnit !== null && cell.clickProxyUnit !== undefined ? cell.clickProxyUnit : cell.tileUnit
  if (unit !== null && unit !== undefined) {
    const position = safeCall(
      () => {
        return unit.get_position()
      },
      { tag: "llk_audio_get_cell_position", fallback: null, logger: print },
    )
    if (position !== null && position !== undefined) {
      return position
    }
  }
  return math.Vector3(asFixed(cell.x), asFixed(0), asFixed(cell.z))
}
