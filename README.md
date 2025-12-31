# Show Git Change Count

一个 Cursor 专用的插件，用于在状态栏显示 Git 变更的文件数量。

## 功能特性

- 在 Cursor 状态栏显示当前 Git 仓库中变更的文件数量
- 支持统计已暂存和未暂存的文件变更
- 支持多工作区（Multi-root Workspace）
- 实时监听文件变化，自动更新计数
- 点击状态栏图标可直接打开源代码管理面板
- 支持手动刷新命令

## 快速开始

### 开发环境

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/show-git-change-count.git
   cd show-git-change-count
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **编译代码**
   ```bash
   npm run compile
   ```

4. **启动调试**
   - 在 VSCode 中打开项目
   - 按 `F5` 启动调试模式
   - 在新窗口中测试插件功能

### 直接安装

如果你想直接使用插件，可以：

1. **下载 VSIX 文件**
   - 从 [Releases](../../releases) 页面下载最新的 `.vsix` 文件

2. **安装插件**
   ```bash
   code --install-extension show-git-change-count-0.0.1.vsix
   ```

3. **重启 VSCode**
   - 重启 VSCode 以激活插件

## 使用方法

安装插件后，当你在 Git 仓库中工作时，状态栏会显示 Git 变更信息：

### 显示格式

- **详细模式**（默认）：`$(git-branch) M:2 A:1 D:0 R:1 U:3`
  - M: 修改的文件数量
  - A: 新增的文件数量  
  - D: 删除的文件数量
  - R: 重命名的文件数量
  - U: 未暂存的文件数量

- **简洁模式**：`$(git-branch) 4`（仅显示总数量）

### 交互功能

- **点击状态栏图标**：打开源代码管理面板
- **悬停查看详情**：显示详细的变更信息
- **手动刷新**：使用命令 `Ctrl+Shift+P` 然后输入 "刷新 Git 变更数量"

### 配置选项

在 VSCode 设置中可以配置以下选项：

- `showGitChangeCount.enabled`: 是否启用插件（默认：true）
- `showGitChangeCount.showDetails`: 是否显示详细变更类型（默认：true）
- `showGitChangeCount.updateInterval`: 更新间隔，单位毫秒（默认：500）
- `showGitChangeCount.position`: 状态栏显示位置（默认：left）


## 技术实现

- **状态栏显示**: 使用 VSCode 的 StatusBarItem API 在状态栏显示 Git 变更信息
- **Git 状态检测**: 通过 `git status --porcelain` 命令获取变更文件列表
- **实时监听**: 使用 FileSystemWatcher 监听文件变化，自动更新计数
- **多工作区支持**: 自动汇总所有 Git 仓库的变更数量
- **配置管理**: 支持多种配置选项，包括显示模式、更新间隔、位置等
- **性能优化**: 使用防抖机制避免频繁更新，定期检查确保准确性

## 故障排除

### 常见问题

1. **状态栏没有显示**
   - 确认当前文件夹是 Git 仓库
   - 检查插件是否已启用：`showGitChangeCount.enabled` 设置为 `true`
   - 尝试手动刷新：使用命令 "刷新 Git 变更数量"

2. **计数不准确**
   - 检查 Git 状态：`git status`
   - 确认文件确实有变更
   - 尝试重启 VSCode

3. **性能问题**
   - 增加更新间隔：`showGitChangeCount.updateInterval` 设置为更大的值
   - 禁用详细显示：`showGitChangeCount.showDetails` 设置为 `false`
   - 检查是否有大量文件变更

4. **插件无法激活**
   - 检查 VSCode 版本是否支持（需要 1.74.0 或更高）
   - 查看开发者工具中的错误信息
   - 尝试重新安装插件

### 获取帮助

- 查看 [使用示例](examples/usage-example.md) 获取详细说明
- 在 [Issues](../../issues) 中报告问题
- 提交 [Pull Request](../../pulls) 贡献代码

## 许可证

本项目采用 [MIT 许可证](LICENSE) 开源。

MIT 许可证是一个宽松的许可证，允许任何人自由使用、修改和分发本软件，只要保留原始的版权声明和许可证声明即可。

### 许可证条款

- ✅ 可以自由使用、修改和分发
- ✅ 可以用于商业用途
- ✅ 可以修改源代码
- ✅ 可以分发修改后的版本
- ❌ 不提供任何担保
- ❌ 作者不承担任何责任

### 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

---

**如果这个项目对你有帮助，请给一个 ⭐ Star！** 
