# 🚀 Vercel 部署指南

## 📋 前置要求

- ✅ 项目已推送到 GitHub 仓库
- ✅ 拥有 Vercel 账号（如果没有，可以用 GitHub 账号注册）

## 🎯 部署步骤

### 方式一：通过 Vercel 网站部署（推荐）

#### 1. 登录 Vercel

1. 访问 [https://vercel.com](https://vercel.com)
2. 点击右上角 **Sign Up** 或 **Login**
3. 选择 **Continue with GitHub** 使用 GitHub 账号登录

#### 2. 导入项目

1. 登录后，点击 **Add New...** → **Project**
2. 在 **Import Git Repository** 页面，找到你的 `vitePressBlog` 仓库
3. 点击 **Import** 按钮

#### 3. 配置项目

在配置页面，Vercel 会自动检测项目类型。请按以下配置：

**项目名称**（可选）:
```
vitepressblog
```

**Framework Preset**:
```
Other (不选择预设框架)
```

**Root Directory**:
```
./（保持默认，根目录）
```

**Build and Output Settings**:

- **Build Command**:
  ```bash
  pnpm build
  ```

- **Output Directory**:
  ```
  docs/.vitepress/dist
  ```

- **Install Command**:
  ```bash
  pnpm install
  ```

**Environment Variables** (环境变量):
```
暂时不需要配置
```

#### 4. 开始部署

1. 确认配置无误后，点击 **Deploy** 按钮
2. 等待部署完成（通常需要 1-3 分钟）
3. 部署成功后，会显示 🎉 **Congratulations!** 页面

#### 5. 访问你的网站

部署成功后，Vercel 会自动生成一个域名，格式如下：
```
https://你的项目名.vercel.app
```

例如：`https://vitepressblog.vercel.app`

---

### 方式二：使用 Vercel CLI 部署

#### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

选择使用 GitHub 账号登录。

#### 3. 部署项目

在项目根目录执行：

```bash
cd /Users/dingxingxing/Desktop/项目记录文档/学习记录文档/bk/vitePressBlog
vercel
```

首次部署会询问一些问题：

```bash
? Set up and deploy "~/vitePressBlog"? [Y/n] y
? Which scope do you want to deploy to? [选择你的账号]
? Link to existing project? [N/y] n
? What's your project's name? vitepressblog
? In which directory is your code located? ./
```

然后 Vercel 会自动检测配置并部署。

#### 4. 生产环境部署

开发环境部署成功后，运行以下命令进行生产环境部署：

```bash
vercel --prod
```

---

## 🔧 配置文件说明

项目根目录的 `vercel.json` 文件配置说明：

```json
{
  "buildCommand": "pnpm build",           // 构建命令
  "outputDirectory": "docs/.vitepress/dist",  // 构建输出目录
  "installCommand": "pnpm install",       // 安装依赖命令
  "framework": null,                      // 不使用预设框架
  "cleanUrls": true                       // 启用干净的URL（去掉.html后缀）
}
```

---

## 🌐 自定义域名（可选）

### 1. 绑定自定义域名

1. 在 Vercel 项目页面，点击 **Settings** → **Domains**
2. 输入你的域名（例如：`blog.yourdomain.com`）
3. 点击 **Add**
4. 按照提示在你的域名服务商添加 DNS 记录：

**A 记录**:
```
类型: A
名称: @ 或 blog
值: 76.76.21.21
```

**或者使用 CNAME 记录**:
```
类型: CNAME
名称: blog
值: cname.vercel-dns.com
```

5. 等待 DNS 解析生效（可能需要几分钟到几小时）

---

## 🔄 自动部署

### GitHub 自动部署

Vercel 默认会监听 GitHub 仓库的变化：

✅ **推送到 `main` 分支** → 自动触发生产环境部署
✅ **推送到其他分支** → 自动触发预览环境部署
✅ **创建 Pull Request** → 自动生成预览链接

**工作流程**:
```bash
# 本地修改文件
git add .
git commit -m "更新文档"
git push origin main

# Vercel 会自动检测到推送并开始部署
# 部署完成后可以访问新版本
```

---

## 📊 部署状态查看

### 通过 Vercel Dashboard

1. 访问 [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. 找到你的项目
3. 查看 **Deployments** 标签页
4. 可以看到：
   - 部署历史记录
   - 部署状态（成功/失败）
   - 部署日志
   - 预览链接

### 通过 CLI

```bash
# 查看部署列表
vercel ls

# 查看最近的部署日志
vercel logs
```

---

## ⚡ 性能优化建议

### 1. 启用边缘缓存

Vercel 默认会为静态资源启用 CDN 缓存，无需额外配置。

### 2. 图片优化

如果使用大量图片，建议使用 Vercel 的图片优化服务：

```md
<!-- 原来的写法 -->
![图片](/images/photo.jpg)

<!-- 优化后的写法（需要配置） -->
![图片](/_next/image?url=/images/photo.jpg&w=1920&q=75)
```

### 3. 启用分析

在 Vercel Dashboard 中启用 **Analytics** 功能，可以查看：
- 页面访问量
- 性能指标
- 用户地理位置

---

## ❓ 常见问题

### 1. 构建失败

**问题**: 部署时构建失败

**解决方案**:
1. 检查本地是否能正常构建：
   ```bash
   pnpm build
   ```
2. 查看 Vercel 部署日志，找到具体错误信息
3. 确保 `package.json` 中的依赖版本正确

### 2. 404 错误

**问题**: 访问某些页面时出现 404

**解决方案**:
1. 检查 `vercel.json` 中的 `outputDirectory` 配置是否正确
2. 确保文件路径大小写正确
3. VitePress 页面需要有对应的 `.md` 文件

### 3. 样式丢失

**问题**: 部署后样式不正常

**解决方案**:
1. 检查 VitePress 的 `base` 配置
2. 确保静态资源路径正确
3. 清除浏览器缓存

### 4. 更新未生效

**问题**: 推送代码后网站没有更新

**解决方案**:
1. 检查 Vercel Dashboard 中的部署状态
2. 确认是否推送到了正确的分支（默认是 `main`）
3. 检查是否有构建错误
4. 清除浏览器缓存

---

## 🎉 部署成功后

### 1. 分享你的博客

你可以通过以下方式分享：
```
https://你的项目名.vercel.app
```

### 2. 设置环境变量（如果需要）

在 Vercel Dashboard → Settings → Environment Variables 中添加

### 3. 查看分析数据

在 Vercel Dashboard → Analytics 中查看访问统计

### 4. 持续更新

本地修改后只需：
```bash
git add .
git commit -m "更新内容"
git push origin main
```

Vercel 会自动部署更新！

---

## 📚 相关资源

- [Vercel 官方文档](https://vercel.com/docs)
- [VitePress 部署指南](https://vitepress.dev/guide/deploy)
- [Vercel CLI 文档](https://vercel.com/docs/cli)

---

## 🆘 需要帮助？

如果遇到问题：
1. 查看 Vercel 部署日志
2. 检查本地构建是否正常
3. 参考官方文档
4. 在 GitHub Issues 中提问

祝你部署顺利！🎊

