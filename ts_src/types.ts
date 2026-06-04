export type StickerSource = {
  value: number
  prefabId: number
  name: string
  modelSizeX: number
  modelSizeZ: number
  pitch?: number
}

export type GridBounds = {
  xMin: number
  xMax: number
  zMin: number
  zMax: number
}

export type LlkGridCell = {
  row: number
  column: number
  x: number
  z: number
  value: number
  matched: boolean
  tileUnit: any
  stickerUnit: any
  buttonLayer: any
  buttonCircleLayer: any
  buttonNode: any
  buttonPosition: Vector3 | null
  stickerPitch: number
  clickProxyUnit: any
  selectionEffectUnit: any
  selectionRangeUnits: any[]
  selectionVisualToken: number
  tileTouchRegistered: boolean
  clickProxyTouchRegistered: boolean
  buttonTouchBindingCount: number
}

export type TileHeightLevels = {
  bottomY: number
  middleY: number
  topY: number
}

export type PathDirection = {
  rowDelta: number
  columnDelta: number
}

export type PathSearchState = {
  row: number
  column: number
  direction: number
  turns: number
  previousIndex: number
}

export type GridCellClickHandler = (cell: LlkGridCell, touchSource: string) => void

export type LinkPathPoint = {
  row: number
  column: number
}

export type LinkPathResult = {
  points: LinkPathPoint[]
  turns: number
}

export type LinkVisualHandle = {
  anchorUnits: any[]
  sfxIds: any[]
  effectUnits: any[]
  effectOuterUnits: any[]
  effectCoreUnits: any[]
  effectNodeUnits: any[]
  fallbackModelCreated: boolean
}
