# 19x9 连连看执行文档

## 1. 执行目标

基于当前 19x9 棋盘、单格 `2.5 x 2.5` 的地砖范围，实现一套可运行的连连看基础玩法。

最终效果：

- 游戏启动后生成 `9 x 19` 二维数组
- 初始牌面为 `170` 个成对牌块 + `1` 个空格
- 每个有效格子生成可点击牌块 UI
- 玩家可点击两张牌进行匹配
- 相同牌且路径不超过 2 次转折时消除
- 全部牌消除后胜利
- 不显示调试数字、四角定位方块、调试网格线和残留白板

## 2. 当前基础

当前已有：

- 地砖画面已经按 19:9 视角适配
- 棋盘规格为：
  - `GRID_COLUMNS = 19`
  - `GRID_ROWS = 9`
  - `GRID_CELL_SIZE = 2.5`
- 已有二维数组生成入口
- 初始数组值域为 `0..10`：`0` 表示唯一空格，`1..10` 表示成对牌面
- 初始牌面为 `170` 个有效牌块 + `1` 个空格
- 已按二维数组生成 `19 x 9` 方块
- 已按二维数组的 `value` 生成并绑定贴纸
- 方块、贴纸、按钮层中心点对齐，属于同一个格子的分层表现
- 已按二维数组生成按钮 SceneUI 层：
  - 连连看 SceneUI 层 ID：`1328312114`
  - 圆形蓝 SceneUI 层 ID：`1892680078`
  - 已在 `cell.buttonLayer` / `cell.buttonCircleLayer` / `cell.buttonNode` 中保存引用
- 已删除四角定位方块创建逻辑
- 已删除数组数字显示逻辑
- 地砖当前只作为编辑器定位参考，不作为数组生成对象
- 已在入口禁用角色控制、摇杆/瞄准移动、相机拖拽、陀螺仪和相机旋转同步

当前不再保留：

- 四角 `105205` 定位方块
- 表面动态数字
- 旧 `LLK_UI_TILE_*` 白板

当前尚未完成：

- 胜利检测和无解洗牌还未实现
- 点击选择、路径检测、消除已经接入基础实现，仍需要运行态点击验证

## 3. 文件范围

主要改动文件：

- `ts_src/main.ts`

建议新增文件：

- `ts_src/llk/LlkTypes.ts`
- `ts_src/llk/LlkGrid.ts`
- `ts_src/llk/LlkPath.ts`
- `ts_src/llk/LlkController.ts`
- `ts_src/llk/LlkView.ts`

如果项目暂时不需要拆模块，也可以先全部写在 `ts_src/main.ts`，但后续玩法会变复杂，建议按模块拆开。

## 4. 执行阶段

### 阶段一：整理棋盘数据

目标：

- 将棋盘数据生成从 `main.ts` 中独立出来
- 初始数据改为连连看可消除结构

执行内容：

1. 新增 `LlkTypes.ts`
2. 定义 `LlkGridCell`
3. 定义棋盘常量：
   - `GRID_COLUMNS = 19`
   - `GRID_ROWS = 9`
   - `GRID_CELL_SIZE = 2.5`
   - `EMPTY_GRID_VALUE = 0`
   - `TILE_KIND_COUNT = 10`
4. 新增 `LlkGrid.ts`
5. 实现 `createPairedValues()`
6. 实现 `shuffleValues()`
7. 实现 `createInitialGridData()`
8. 保证数组为 `9 x 19`
9. 保证有效牌为 `170` 个，空格为 `1` 个

验收：

- 日志打印 `rows=9 columns=19`
- 日志打印 `valid=170 empty=1`
- 每个 `1..10` 的值都成对出现
- 不在画面显示数组数字

### 阶段二：实现路径检测

目标：

- 实现标准连连看 0/1/2 折路径判断

当前状态：

- 已在 `ts_src/main.ts` 中实现 `canLinkCells(...)`
- 使用外扩一圈棋盘做 BFS
- 搜索状态包含行、列、方向、转折次数
- 最大转折次数为 `2`

执行内容：

1. 新增 `LlkPath.ts`
2. 实现外扩棋盘：
   - 原棋盘 `9 x 19`
   - 检测棋盘 `11 x 21`
3. 实现 `isCellEmptyForPath()`
4. 实现 BFS：
   - 状态包含行、列、方向、转折次数
   - 转折次数最大为 `2`
5. 实现 `canLink(grid, a, b)`

验收：

- 同行无遮挡可连接
- 同列无遮挡可连接
- 1 折路径可连接
- 2 折路径可连接
- 超过 2 折不可连接
- 中途经过未消除牌不可连接
- 可从棋盘外圈绕线

### 阶段三：生成牌块表现

目标：

- 根据二维数组生成每格可点击牌块

执行内容：

1. 新增 `LlkView.ts`
2. 定义 10 个牌面资源 ID 或贴纸资源
3. 每个 `value > 0` 的格子生成：
   - 方块底板
   - 图案贴纸
   - 后续点击用按钮或碰撞层
4. 每个 UI 节点绑定 `row,column`
5. 空格 `value = 0` 不生成 UI
6. 已消除格不显示

命名建议：

```text
LLK_TILE_00_00_BG
LLK_TILE_00_00_BTN
LLK_TILE_00_00_ICON
```

验收：

- 棋盘内最多显示 170 个牌块
- 1 个空格位置不显示牌块
- 每个牌块大小对齐 `2.5 x 2.5` 网格
- 点击牌块能反查到正确 `row,column`
- 不出现旧的 `LLK_UI_TILE_*` 白板

### 阶段四：实现点击选择

目标：

- 玩家可以选择第一张和第二张牌

当前状态：

- 已接入按钮点击入口 `handleGridTileClick(cell, source)`
- 第一次点击会保存 `selectedCell` 并高亮方块
- 点击同一格会取消选择
- 点击不同值会切换选择
- 点击同值会调用路径检测

执行内容：

1. 新增 `LlkController.ts`
2. 保存当前选中格：

```ts
let selectedCell: LlkGridCell | null = null
```

3. 点击无效格时忽略：
   - `value = 0`
   - `matched = true`
4. 第一次点击：
   - 记录选中格
   - 显示选中效果
5. 第二次点击：
   - 同一格则取消选择
   - 不同值则切换选择或提示错误
   - 相同值则进入路径检测

验收：

- 点击按钮能反查并打印正确 `row,column,value,matched`
- 点击牌块有选中反馈
- 点击同一牌块能取消
- 点击不同牌不会消除
- 点击空格无反应
- 点击已消除格无反应

### 阶段五：实现消除

目标：

- 相同牌且路径合法时消除

当前状态：

- 已实现 `matchCells(first, second)`
- 路径合法后会设置 `matched = true`
- 会销毁对应的方块、贴纸、按钮 SceneUI 层
- 会把两个格子值改为 `0`，供后续路径通过

执行内容：

1. 调用 `canLink(grid, first, second)`
2. 成功时：
   - `matched = true`
   - 可选：`value = 0`
   - 隐藏两个 UI
   - 清空选中状态
   - 播放消除反馈
3. 失败时：
   - 保持或清空选中状态
   - 播放失败反馈

验收：

- 合法路径可以消除
- 非法路径不能消除
- 消除后该位置可作为路径通过
- UI 与数组状态一致

### 阶段六：实现胜利和洗牌

目标：

- 完成完整局内闭环

执行内容：

1. 每次消除后检查是否胜利
2. 如果所有 `value > 0` 的格子都已消除：
   - 显示胜利
   - 禁止继续点击
3. 如果未胜利，检查是否还有可连接牌对
4. 没有可连接牌对时：
   - 自动洗牌
   - 或显示洗牌按钮

验收：

- 全部消除后触发胜利
- 有剩余牌但无可消除对时能洗牌
- 洗牌不改变剩余牌数量和配对关系

## 5. 推荐开发顺序

1. 先把当前 `main.ts` 里的数组生成改成成对牌面：`170` 张牌 + `1` 个空格
2. 再把数组、坐标、方块、贴纸结构拆到 `LlkGrid.ts` / `LlkView.ts`
3. 实现 `LlkPath.ts`，用日志验证路径算法
4. 接入点击选择和消除逻辑
5. 最后处理胜利、无解洗牌和表现反馈

当前方块和贴纸表现层已经有初版，后续不要推翻这套数组绑定方式；应当在这个基础上补齐成对数据、路径和交互。

## 6. 运行验证命令

每次改完 TS 后执行：

```bash
npm run build
```

下发到编辑器：

```bash
../platform/tools/bridge/eggitor-curl.sh --workspace /home/zhangyuwen/eggy_space/llk flush-code
```

启动试玩：

```bash
../platform/tools/bridge/eggitor-curl.sh --workspace /home/zhangyuwen/eggy_space/llk game-start
```

停止试玩：

```bash
../platform/tools/bridge/eggitor-curl.sh --workspace /home/zhangyuwen/eggy_space/llk game-stop
```

## 7. 日志验收

建议保留以下关键日志：

```text
[LlkGrid] rows=9 columns=19 valid=170 empty=1
[LlkGrid] pairs=85 kinds=10
[LlkView] created_tiles=170 empty=1
[LlkSelect] first=(r,c) value=v
[LlkSelect] second=(r,c) value=v
[LlkPath] success turns=n
[LlkMatch] removed=(r1,c1),(r2,c2) remaining=n
[LlkWin] cleared=true
```

上线前应删除或降低频率的日志：

- 每行数组完整打印
- 每次路径 BFS 详细节点打印
- 每个 UI 节点创建日志

## 8. 风险点

### 8.1 171 格是奇数

必须保留一个空格，否则无法保证所有牌成对。

### 8.2 UI 残留白板

历史生成过 `LLK_UI_TILE_*` 节点，当前已有清理逻辑。后续新 UI 命名建议不要继续复用 `LLK_UI_TILE_*`，避免和历史残留混淆。

推荐新命名：

```text
LLK_TILE_V2_00_00_BG
LLK_TILE_V2_00_00_BTN
LLK_TILE_V2_00_00_ICON
```

### 8.3 路径检测坐标

连线算法只使用数组行列，不要使用世界坐标判断连通性。世界坐标只用于显示和连线表现。

### 8.4 UI 与数组不同步

所有点击、消除、隐藏都必须从数组状态出发。不要让 UI 自己维护一份独立状态。

## 9. 完成标准

代码完成后需要满足：

- `npm run build` 成功
- 游戏启动无运行时报错
- 不显示调试数字
- 不显示四角定位方块
- 不显示残留白板
- 牌块数量正确
- 点击选择正确
- 连线消除正确
- 胜利判断正确

## 10. 第一轮最小可交付版本

第一轮只做最小闭环：

- 170 个牌块 + 1 个空格
- 10 种牌面
- 点击选择
- 2 折内消除
- 全部消除胜利

第一轮暂不做：

- 计时器
- 分数
- 道具
- 提示
- 洗牌按钮
- 复杂动画

等最小闭环稳定后，再加表现和扩展玩法。
