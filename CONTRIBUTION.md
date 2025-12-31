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
