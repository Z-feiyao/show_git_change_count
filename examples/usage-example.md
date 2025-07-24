# 使用示例

## 基本使用

1. 在 VSCode 中打开一个 Git 仓库
2. 插件会自动在状态栏显示变更数量
3. 当你修改、添加或删除文件时，计数会自动更新

## 配置示例

### 在 settings.json 中配置

```json
{
  "showGitChangeCount.enabled": true,
  "showGitChangeCount.showDetails": true,
  "showGitChangeCount.updateInterval": 300,
  "showGitChangeCount.position": "left"
}
```

### 禁用详细显示

```json
{
  "showGitChangeCount.showDetails": false
}
```

这样状态栏会显示为：`$(git-branch) 5` 而不是 `$(git-branch) M:2 A:1 D:1 R:1`

### 调整更新频率

```json
{
  "showGitChangeCount.updateInterval": 1000
}
```

将更新间隔设置为 1 秒，减少系统资源占用。

## 多工作区支持

插件支持 VSCode 的多工作区功能：

- 每个工作区文件夹的 Git 变更会被分别计算
- 状态栏显示所有工作区的总变更数量
- 如果某个工作区不是 Git 仓库，会被自动忽略

## 故障排除

### 插件不显示

1. 检查当前文件夹是否为 Git 仓库
2. 确认插件已启用：`showGitChangeCount.enabled` 设置为 `true`
3. 尝试手动刷新：使用命令 "刷新 Git 变更数量"

### 计数不准确

1. 检查 Git 状态：`git status`
2. 确认文件确实有变更
3. 尝试重启 VSCode

### 性能问题

1. 增加更新间隔：`showGitChangeCount.updateInterval` 设置为更大的值
2. 禁用详细显示：`showGitChangeCount.showDetails` 设置为 `false`
3. 检查是否有大量文件变更 