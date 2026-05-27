# 前端文案修改后更新 Demo Web 容器 SOP

## 1. 文档目的

这份 SOP 用于指导以下场景：

- 前端页面文案、按钮文字、提示语、标题等发生修改
- 需要把修改后的前端重新部署到服务器上的 demo 环境
- 当前 demo 前端运行在 `nzat-demo-web` 容器中
- 需要保证更新过程尽量可控、可验证、可回滚

这份文档只针对 **Web 前端容器更新**，不涉及数据库迁移、API 代码更新或 Redis 配置变更。

---

## 2. 适用前提

使用本 SOP 前，默认以下条件已经成立：

- 你已经有前端源码
- 你可以修改前端项目代码
- 你知道当前 demo 使用的是哪个前端镜像
- 服务器上已经有可运行的 `nzat-demo-pod`
- `nzat-demo-web` 当前已经能正常提供页面
- 现有反代配置文件已保存在宿主机，例如：
  - `~/apps/nzat-demo/web/default.conf`

---

## 3. 更新原则

更新前端容器时，建议遵循以下原则：

- 不要直接在运行中的容器里手改前端静态文件
- 优先在源码中修改，再重新构建镜像
- 新镜像尽量使用新 tag，而不是长期只依赖 `latest`
- 重启前端容器前，确认 API 和 Pod 结构不变
- 每次更新后都做页面与接口双重验收

---

## 4. 标准流程总览

标准流程如下：

1. 修改前端源码中的文案 --done
2. 本地运行前端，确认文案修改正确 --done
3. 构建新的前端镜像
4. 推送镜像到镜像仓库
5. 服务器拉取新镜像
6. 删除旧的 `nzat-demo-web`
7. 用新镜像重新启动 `nzat-demo-web`
8. 验证页面、接口、浏览器显示

---

## 5. 详细步骤

## 5.1 修改前端源码

在前端源码中修改需要汉化或调整的文案，例如：

- 页面标题
- 按钮文字
- 表单提示
- 错误提示
- 描述性文本

### 成功标准

- 代码修改完成
- 文案内容符合预期
- 没有误改 API 地址、环境变量或路由

---

## 5.2 本地验证文案修改

在本地运行前端，先确认修改后的内容已经显示正确。

建议至少检查：

- 关键页面是否能打开
- 中文文案是否显示正确
- 没有乱码
- 没有因为文案改动影响布局

### 成功标准

- 本地页面能正常访问
- 修改后的文案已经显示出来
- 浏览器 Console 没有新增明显报错

---

## 5.3 构建新的前端镜像

如果项目目录中已有 `Dockerfile`，则在前端项目根目录重新 build 镜像。

建议使用新 tag，例如：

- `ghcr.io/<your-user>/nzat-web:demo-en`

不建议长期只用：

- `latest`

### 成功标准

- 镜像构建成功
- 本地镜像列表中能看到新 tag
- 构建过程中没有报错

---

## 5.4 推送镜像到镜像仓库

把新镜像推送到仓库，供服务器拉取。

如果使用 GHCR，先确认已经登录：

- `podman login ghcr.io`
- 或 `docker login ghcr.io`

### 成功标准

- 镜像推送成功
- 服务器所在环境能够拉取该镜像

---

## 5.5 服务器上拉取新镜像

在服务器的 `deploy` 用户下执行：

```bash
podman pull ghcr.io/lynn61liu/nzat-web:demo-en
podman images
```
能看到新 tag

---

## 5.6 删除旧的 demo web 容器

前端容器本身通常不存业务数据，所以可以直接删除并重建。

```bash
podman rm -f nzat-web
podman rmi image id
```

### 成功标准

- 旧容器删除成功
- `podman ps -a --filter name=nzat-demo-web` 不再显示旧容器

---

## 5.7 用新镜像重新启动 `nzat-web`

重新启动时，必须继续挂载当前正在使用的 Nginx 配置文件，否则默认镜像中的配置可能会覆盖你现在的代理逻辑。

示例：

```bash
podman run -d \
  --name nzat-demo-web \
  --pod nzat-demo-pod \
  --restart=unless-stopped \
  -v ~/apps/nzat-demo/web/default.conf:/etc/nginx/conf.d/default.conf:Z \
  ghcr.io/lynn61liu/nzat-web:demo-en
```

### 注意事项

- `--pod nzat-demo-pod` 不要漏掉
- `default.conf` 挂载不要漏掉
- 镜像 tag 要确认是新版本，不要误用旧镜像

### 成功标准

- `podman ps` 中 `nzat-demo-web` 状态为 `Up`
- 容器日志没有启动错误

---

## 5.8 服务器本机验收

在服务器上先做最基本的本机验证：

```bash
curl -I http://127.0.0.1:18513
curl -i http://127.0.0.1:18513/api/jobs/wof-schedule



http://45.114.124.101:18513

podman logs --tail 50 nzat-demo-web
```

### 验收标准

- 首页返回 `200`
- `/api/...` 请求不返回 `502`
- 日志中没有 `upstream` 错误
- Nginx 配置加载正常

---

## 5.9 浏览器验收

在浏览器中访问 demo 地址，建议使用：

- 新标签页
- 强制刷新
- 或无痕窗口

检查以下内容：

- 新的中文文案是否已经显示
- 页面样式是否正常
- 页面是否仍能正常请求 API
- 浏览器 `Console` 是否有新报错
- 浏览器 `Network` 中主要接口是否正常返回

### 成功标准

- 修改后的文案可见
- 页面能正常加载
- 没有明显功能回归

---

## 6. 推荐命令模板

以下是推荐的更新命令模板。

### 6.1 拉取新镜像

```bash
podman pull ghcr.io/<your-user>/nzat-web:<new-tag>
```

### 6.2 删除旧容器

```bash
podman rm -f nzat-demo-web
```

### 6.3 重新启动

```bash
podman run -d \
  --name nzat-demo-web \
  --pod nzat-demo-pod \
  --restart=unless-stopped \
  -v ~/apps/nzat-demo/web/default.conf:/etc/nginx/conf.d/default.conf:Z \
  ghcr.io/<your-user>/nzat-web:<new-tag>
```

### 6.4 本机验证

```bash
curl -I http://127.0.0.1:18513
curl -i http://127.0.0.1:18513/api/jobs/wof-schedule
podman logs --tail 50 nzat-demo-web
```

---

## 7. 常见问题

## 7.1 页面没有更新

常见原因：

- 浏览器缓存未刷新
- 实际拉取的仍然是旧镜像
- 启动时用的还是旧 tag

建议检查：

- `podman images`
- 当前容器镜像 tag
- 浏览器无痕窗口或强制刷新

---

## 7.2 页面能打开，但请求 API 返回 502

常见原因：

- 没有挂载正确的 `default.conf`
- `nzat-demo-web` 没放进 `nzat-demo-pod`
- Nginx 反代地址写错

建议检查：

- `podman exec -it nzat-demo-web sh -lc 'cat /etc/nginx/conf.d/default.conf'`
- `curl -i http://127.0.0.1:18513/api/...`

---

## 7.3 页面文字没变，但容器已更新

常见原因：

- 改动没有真正进入 build
- 修改的是错误文件
- 前端构建产物没有重新生成

建议检查：

- 本地构建产物
- 镜像是否来自最新源码
- 页面中的 JS/CSS 文件是否已更新

---

## 7.4 不小心把 Nginx 配置覆盖回默认版本

现象通常是：

- 页面打不开
- API 返回 502
- 日志出现类似：
  - `host not found in upstream "api"`

处理方式：

- 确认 `~/apps/nzat-demo/web/default.conf` 仍然存在
- 重新启动容器时继续挂载该文件

---

## 8. 回滚方式

如果新版本前端有问题，可以快速回滚到旧镜像。

### 步骤

1. 删除当前 `nzat-demo-web`
2. 用旧 tag 重新启动

示例：

```bash
podman rm -f nzat-demo-web

podman run -d \
  --name nzat-demo-web \
  --pod nzat-demo-pod \
  --restart=unless-stopped \
  -v ~/apps/nzat-demo/web/default.conf:/etc/nginx/conf.d/default.conf:Z \
  ghcr.io/<your-user>/nzat-web:<old-tag>
```

### 成功标准

- 页面恢复正常
- API 代理恢复正常
- 浏览器显示回滚后的版本

---

## 9. 最低验收清单

每次前端文案更新后，至少通过以下检查：

- [ ] 前端源码已修改
- [ ] 本地页面验证通过
- [ ] 新镜像 build 成功
- [ ] 新镜像 push 成功
- [ ] 服务器 pull 成功
- [ ] 旧 `nzat-demo-web` 已删除
- [ ] 新 `nzat-demo-web` 已启动
- [ ] 本机 `curl -I http://127.0.0.1:18513` 返回 `200`
- [ ] `/api/...` 请求不返回 `502`
- [ ] 浏览器能看到新文案
- [ ] 没有明显样式或功能回归

---

## 10. 一句话原则

前端文案修改后的正确更新方式不是“进入容器改文件”，而是：

**修改源码 -> 重新构建镜像 -> 替换 demo web 容器 -> 做页面与接口双重验收。**
