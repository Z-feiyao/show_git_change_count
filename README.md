# Show Git Change Count

一个 VSCode 插件，用于在状态栏显示 Git 变更的文件数量。

## 功能特性

- 在 VSCode 状态栏显示当前 Git 仓库中变更的文件数量
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

## 开发

### 项目结构

```
show-git-change-count/
├── src/
│   ├── extension.ts              # 主入口文件
│   ├── gitChangeCountProvider.ts # 核心功能实现
│   └── test/                     # 测试文件
├── out/                          # 编译输出目录
├── examples/                     # 使用示例
├── .vscode/                      # VSCode 配置
├── package.json                  # 插件配置
├── tsconfig.json                 # TypeScript 配置
└── README.md                     # 说明文档
```

### 构建

```bash
# 安装依赖
npm install

# 编译 TypeScript 代码
npm run compile

# 监听文件变化并自动编译
npm run watch
```

### 调试

1. 在 VSCode 中打开项目
2. 按 `F5` 启动新的 VSCode 窗口进行调试
3. 在新窗口中测试插件功能

## 打包发布

### 准备工作

1. **安装打包工具**
   ```bash
   npm install -g @vscode/vsce
   ```

2. **更新版本号**（可选）
   在 `package.json` 中更新 `version` 字段：
   ```json
   {
     "version": "0.0.2"
   }
   ```

3. **清理代码**
   - 移除调试日志
   - 确保代码质量
   - 更新文档

### 打包步骤

1. **编译代码（可选）**
   ```bash
   npm run compile
   ```

2. **执行打包**
   ```bash
   vsce package
   ```

3. **验证打包结果**
   - 检查生成的 `.vsix` 文件
   - 确认文件大小合理（通常几KB到几MB）
   - 验证包含所有必要文件

### 安装测试

#### 方法1: VSCode 界面安装
1. 打开 VSCode
2. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac)
3. 输入 "Extensions: Install from VSIX..."
4. 选择生成的 `.vsix` 文件
5. 重启 VSCode

#### 方法2: 命令行安装
```bash
code --install-extension show-git-change-count-0.0.1.vsix
```

### 发布到扩展市场

1. **创建发布者账户**
   - 访问 [Visual Studio Marketplace](https://marketplace.visualstudio.com/)
   - 注册并创建发布者账户

2. **获取 Personal Access Token**
   - 在发布者账户中创建 Personal Access Token
   - 保存 Token 用于后续发布

3. **发布扩展**
   ```bash
   vsce publish
   ```

4. **验证发布**
   - 在扩展市场中搜索你的插件
   - 确认插件信息正确
   - 测试安装和功能

### 本地安装

如果你只想在本地使用插件，可以直接安装 `.vsix` 文件：

```bash
# 安装插件
code --install-extension show-git-change-count-0.0.1.vsix

# 卸载插件（如果需要）
code --uninstall-extension show-git-change-count
```

### 打包文件说明

生成的 `.vsix` 文件包含：
- `package.json` - 插件配置和元数据
- `README.md` - 插件说明文档
- `out/` - 编译后的 JavaScript 代码
- `examples/` - 使用示例
- 其他必要的配置文件

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