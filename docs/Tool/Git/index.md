# Git

Git 是目前世界上最流行的分布式版本控制系统。本文档整理了 Git 的常用命令和最佳实践。

## 基础配置

### 全局配置

```bash
# 配置用户名和邮箱
git config --global user.name "你的名字"
git config --global user.email "your.email@example.com"

# 查看所有配置
git config --list

# 查看特定配置
git config user.name

# 设置默认编辑器
git config --global core.editor "code --wait"

# 设置默认分支名为 main
git config --global init.defaultBranch main

# 启用颜色输出
git config --global color.ui auto
```

### SSH 密钥配置

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your.email@example.com"

# 查看公钥（添加到 GitHub/GitLab）
cat ~/.ssh/id_ed25519.pub

# 测试 SSH 连接
ssh -T git@github.com
```

---

## 仓库初始化

### 创建新仓库

```bash
# 初始化本地仓库
git init

# 克隆远程仓库
git clone <仓库地址>

# 克隆指定分支
git clone -b <分支名> <仓库地址>

# 浅克隆（只克隆最近的提交历史）
git clone --depth 1 <仓库地址>
```

---

## 基本操作

### 查看状态

```bash
# 查看工作区状态
git status

# 查看状态（简洁模式）
git status -s

# 查看提交历史
git log

# 查看提交历史（一行显示）
git log --oneline

# 查看提交历史（图形化）
git log --graph --oneline --all

# 查看某个文件的修改历史
git log -p <文件名>

# 查看最近 n 次提交
git log -n 5
```

### 添加和提交

```bash
# 添加文件到暂存区
git add <文件名>

# 添加所有修改的文件
git add .

# 添加所有已跟踪的文件
git add -u

# 交互式添加（选择性添加文件的部分修改）
git add -p

# 提交暂存区的修改
git commit -m "提交信息"

# 添加并提交（跳过 git add）
git commit -am "提交信息"

# 修改最后一次提交
git commit --amend

# 修改最后一次提交信息
git commit --amend -m "新的提交信息"
```

### 撤销操作

```bash
# 撤销工作区的修改（未 add）
git checkout -- <文件名>
# 或使用新命令
git restore <文件名>

# 撤销暂存区的修改（已 add，未 commit）
git reset HEAD <文件名>
# 或使用新命令
git restore --staged <文件名>

# 撤销最后一次提交（保留修改）
git reset --soft HEAD^

# 撤销最后一次提交（不保留修改）
git reset --hard HEAD^

# 撤销到指定提交
git reset --hard <commit-id>

# 撤销某次提交（生成新的提交）
git revert <commit-id>
```

---

## 分支管理

### 分支操作

```bash
# 查看所有分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 创建新分支
git branch <分支名>

# 切换分支
git checkout <分支名>
# 或使用新命令
git switch <分支名>

# 创建并切换到新分支
git checkout -b <分支名>
# 或使用新命令
git switch -c <分支名>

# 删除本地分支
git branch -d <分支名>

# 强制删除本地分支
git branch -D <分支名>

# 删除远程分支
git push origin --delete <分支名>

# 重命名当前分支
git branch -m <新分支名>
```

### 分支合并

```bash
# 合并指定分支到当前分支
git merge <分支名>

# 取消合并
git merge --abort

# 使用 rebase 合并（保持线性历史）
git rebase <分支名>

# 取消 rebase
git rebase --abort

# 继续 rebase（解决冲突后）
git rebase --continue

# 交互式 rebase（整理提交历史）
git rebase -i HEAD~3
```

---

## 储存(Stashing)

::: tip
经常有这样的事情发生，当你正在进行项目中某一部分的工作，里面的东西处于一个比杂乱的状态，而你想转到其它分支上进行一些工作。问题是莫不想提交进行了一半的工作，否则你无法回到这个工作点，解决这个问题的办法就是git stash命令。
:::

```javascript
// 储存这些变更，往堆栈推送一个新的储藏
$ git stash

// 这时方便切换到其他分支上工作；你的变更都保存在栈上。查看现有储存
$ git stash list
//ex: stash@{0}: WIP on dev: 38fb00e 同城配送修改

// 当你在另一个分支上工作完成以后，回到刚刚的分支重新应用实施的储藏
$ git stash apply

// apply选项只尝试应用储藏的工作--储藏的内容任然在栈上。要移除它，可以使用git stash drop,加上你希望移除的储藏名字：
$ git stash drop stash@{0}

// 也可以运行 git stash pop来重新应用储藏，同时立刻将其从堆栈中移走
$ git stash pop

//删除所有缓存的stash
$ git stash clear
```

---

## 远程仓库管理

### 远程仓库操作

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin <仓库地址>

# 修改远程仓库地址
git remote set-url origin <新仓库地址>

# 删除远程仓库
git remote remove origin

# 重命名远程仓库
git remote rename origin new-origin

# 查看远程仓库详细信息
git remote show origin
```

### 推送和拉取

```bash
# 推送到远程仓库
git push origin <分支名>

# 推送所有分支
git push origin --all

# 推送并设置上游分支
git push -u origin <分支名>

# 强制推送（危险操作，谨慎使用）
git push -f origin <分支名>

# 拉取远程更新
git pull origin <分支名>

# 拉取远程更新（使用 rebase）
git pull --rebase origin <分支名>

# 获取远程更新（不合并）
git fetch origin

# 获取所有远程分支
git fetch --all

# 同步远程已删除的分支
git fetch -p
```

---

## Git提交多个远程仓库

```jade
// 使用.git/config查看git配置
$ .git/config
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	symlinks = false
	ignorecase = true
[remote "origin"]
	url = https://gitee.com/dingxiaoxing/vue_shop.git
	fetch = +refs/heads/*:refs/remotes/origin/*
	url = git@github.com:dingxingxing/vue_shop.git
[branch "master"]
	remote = origin
	merge = refs/heads/master
```

本身有一个远程仓库，使用命令增加一个远程仓库

```JavaScript
$ git remote set-url --add origin https://github.com/dingxingxing/vue_shop.git
// 使用https地址，导致每次pull都需要输入账号密码才能成功，所以换成ssh协议地址可以避免每次提交都输账号密码

$ git remote set-url --add origin git@github.com:dingxingxing/vue_shop.git

// 使用 git remote -v 可查看远程仓库地址
$ git remote -v
```

::: tip 提示
使用 SSH 协议可以避免每次推送都输入用户名密码。建议配置 SSH 密钥后使用 `git@github.com:` 格式的地址。
:::

---

## 标签管理

### 创建和查看标签

```bash
# 查看所有标签
git tag

# 创建轻量标签
git tag v1.0.0

# 创建附注标签（推荐）
git tag -a v1.0.0 -m "版本 1.0.0"

# 为历史提交打标签
git tag -a v0.9.0 <commit-id> -m "版本 0.9.0"

# 查看标签信息
git show v1.0.0

# 删除本地标签
git tag -d v1.0.0

# 推送标签到远程
git push origin v1.0.0

# 推送所有标签
git push origin --tags

# 删除远程标签
git push origin --delete v1.0.0
```

---

## 差异比较

```bash
# 查看工作区和暂存区的差异
git diff

# 查看暂存区和最后一次提交的差异
git diff --staged
# 或
git diff --cached

# 比较两次提交的差异
git diff <commit-id-1> <commit-id-2>

# 比较两个分支的差异
git diff <分支1> <分支2>

# 查看指定文件的差异
git diff <文件名>

# 查看简略的差异统计
git diff --stat
```

---

## 文件管理

### 重命名和删除

```bash
# 重命名文件
git mv <旧文件名> <新文件名>

# 删除文件
git rm <文件名>

# 删除文件但保留工作区
git rm --cached <文件名>

# 强制删除文件
git rm -f <文件名>
```

### 忽略文件

创建 `.gitignore` 文件：

```bash
# 忽略所有 .log 文件
*.log

# 忽略 node_modules 目录
node_modules/

# 忽略 dist 目录
dist/

# 但不忽略特定文件
!important.log

# 忽略当前目录下的 TODO 文件（不包括子目录）
/TODO

# 忽略所有目录下的 build 目录
**/build/
```

```bash
# 清除已跟踪但被 .gitignore 的文件
git rm -r --cached .
git add .
git commit -m "更新 .gitignore"
```

---

## 高级技巧

### Cherry-pick（拣选提交）

```bash
# 将指定提交应用到当前分支
git cherry-pick <commit-id>

# 拣选多个提交
git cherry-pick <commit-id-1> <commit-id-2>

# 拣选提交范围
git cherry-pick <commit-id-1>..<commit-id-2>

# 取消 cherry-pick
git cherry-pick --abort
```

### 查找和调试

```bash
# 查找包含特定字符串的提交
git log --grep="关键词"

# 查找修改了特定文件的提交
git log -- <文件名>

# 查找谁修改了某一行代码
git blame <文件名>

# 二分查找引入 bug 的提交
git bisect start
git bisect bad          # 当前版本有问题
git bisect good <commit-id>  # 某个版本是好的
# Git 会自动切换到中间的提交，测试后标记：
git bisect good  # 或 git bisect bad
# 重复直到找到问题提交
git bisect reset  # 结束查找
```

### 清理和优化

```bash
# 查看仓库大小
du -sh .git

# 清理未跟踪的文件（预览）
git clean -n

# 清理未跟踪的文件
git clean -f

# 清理未跟踪的文件和目录
git clean -fd

# 清理被忽略的文件
git clean -fX

# 清理所有未跟踪的文件
git clean -fxd

# 优化仓库
git gc

# 删除悬空对象
git prune
```

---

## Git 工作流

### 功能分支工作流

```bash
# 1. 从 main 创建功能分支
git checkout -b feature/new-feature main

# 2. 在功能分支上开发
git add .
git commit -m "添加新功能"

# 3. 推送到远程
git push -u origin feature/new-feature

# 4. 创建 Pull Request / Merge Request

# 5. 代码审查通过后合并到 main
git checkout main
git merge feature/new-feature

# 6. 删除功能分支
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### GitFlow 工作流

```bash
# 主分支
# - main: 生产环境代码
# - develop: 开发分支

# 功能开发
git checkout -b feature/xxx develop
# 开发完成后合并回 develop
git checkout develop
git merge feature/xxx

# 发布准备
git checkout -b release/1.0.0 develop
# 修复发布相关的 bug
# 完成后合并到 main 和 develop
git checkout main
git merge release/1.0.0
git tag -a v1.0.0
git checkout develop
git merge release/1.0.0

# 紧急修复
git checkout -b hotfix/critical-bug main
# 修复完成后合并到 main 和 develop
git checkout main
git merge hotfix/critical-bug
git tag -a v1.0.1
git checkout develop
git merge hotfix/critical-bug
```

---

## 最佳实践

### 提交规范

使用规范的提交信息格式：

```
<类型>(<范围>): <简短描述>

<详细描述>

<页脚>
```

**类型**：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例**：
```bash
git commit -m "feat(用户模块): 添加用户登录功能"
git commit -m "fix(购物车): 修复购物车数量计算错误"
git commit -m "docs(README): 更新项目文档"
```

### 分支命名规范

```
# 功能分支
feature/用户登录
feature/购物车优化

# 修复分支
fix/登录bug修复
hotfix/紧急修复支付问题

# 发布分支
release/v1.0.0

# 测试分支
test/性能测试
```

### 安全建议

::: warning 注意
1. **永远不要**使用 `git push -f` 强制推送到 main/master 等主要分支
2. **敏感信息**（密码、密钥、token）不要提交到仓库
3. **大文件**不要提交到 Git，使用 Git LFS 或其他存储方案
4. 定期**备份重要分支**
5. 在团队协作中，遵循团队的 Git 规范
:::

### 常用 Git 别名

在 `~/.gitconfig` 或项目 `.git/config` 中配置：

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD
    last = log -1 HEAD
    visual = log --graph --oneline --all
    amend = commit --amend --no-edit
    undo = reset --soft HEAD^
    conflicts = diff --name-only --diff-filter=U
```

使用方式：
```bash
git st          # 等同于 git status
git co main     # 等同于 git checkout main
git visual      # 查看图形化历史
```

---

## 常见问题

### 1. 修改已推送的提交信息

```bash
# 修改最后一次提交
git commit --amend -m "新的提交信息"
git push -f origin <分支名>  # 谨慎使用
```

### 2. 合并多个提交

```bash
# 合并最近 3 次提交
git rebase -i HEAD~3
# 在编辑器中将 pick 改为 squash（除第一个）
# 保存退出，编辑合并后的提交信息
```

### 3. 恢复已删除的分支

```bash
# 查找被删除分支的最后提交
git reflog

# 恢复分支
git checkout -b <分支名> <commit-id>
```

### 4. 解决合并冲突

```bash
# 1. 查看冲突文件
git status

# 2. 手动编辑解决冲突
# 冲突标记：
# <<<<<<< HEAD
# 当前分支的内容
# =======
# 要合并分支的内容
# >>>>>>> branch-name

# 3. 标记为已解决
git add <文件名>

# 4. 完成合并
git commit
```

### 5. 取消合并

```bash
# 如果合并还没有提交
git merge --abort

# 如果合并已经提交
git reset --hard HEAD^
```

---

## 资源链接

- [Git 官方文档](https://git-scm.com/doc)
- [Pro Git 书籍](https://git-scm.com/book/zh/v2)
- [Git 可视化学习](https://learngitbranching.js.org/?locale=zh_CN)
- [GitHub 文档](https://docs.github.com/zh)
- [GitLab 文档](https://docs.gitlab.com/)

---

## 总结

Git 是一个功能强大的版本控制系统，掌握基本命令和工作流程可以极大提升开发效率。建议：

1. 从基本命令开始，逐步掌握高级功能
2. 保持良好的提交习惯和分支管理
3. 在团队中遵循统一的 Git 规范
4. 定期学习 Git 的新特性和最佳实践

记住：Git 的学习是一个渐进的过程，在实践中不断积累经验才是最好的学习方式！🚀
