# 共享 Linux 主机上部署第二个项目指导文档

## 1. 文档目的

这份文档用于指导后续项目在**同一台 Linux 主机**上部署到现有环境中，适用于以下场景：

- 主机上已经运行多个项目
- 新项目希望与现有项目保持隔离
- 使用 `rootless Podman` 作为新项目运行时
- 需要同时管理前端、API、数据库、缓存等多服务
- 希望在部署过程中有明确的验收标准，而不是只看“容器启动了没有”

这不是文章，也不是经验总结，而是一份偏操作型的步骤书。

---

## 2. 适用范围

适用于以下类型项目：

- React / Vue / 静态前端 + 后端 API
- .NET / Node.js / Python Flask / Spring Boot 等后端
- PostgreSQL / MySQL / Redis 等依赖型项目
- Demo 环境
- Side project / portfolio project
- 与现有项目共存在同一台主机上的新服务

不适用于以下情况：

- 需要多节点编排的集群部署
- 需要 Kubernetes / k3s 统一调度
- 对高可用、自动扩缩容、复杂流量治理有明确要求的生产平台

---

## 3. 建议部署原则

### 3.1 新项目默认原则

后续新项目建议默认遵循：

- 使用独立项目目录
- 使用独立容器名
- 使用独立端口
- 使用独立环境变量文件
- 使用独立数据库或独立数据库 schema
- 使用独立 seed / upload / logs / data 目录
- 不与已有项目共享容器名、volume 路径、环境变量文件

### 3.2 共享主机上的隔离原则

如果主机上已经有多个项目在跑，部署第二个项目时优先考虑：

- **运行时隔离**
  - 新项目使用 `rootless Podman`
- **数据隔离**
  - 新项目不要直接连接旧项目业务数据库
- **配置隔离**
  - 每个项目单独维护 `.env`
- **访问隔离**
  - 每个项目单独端口或单独反代入口
- **运维隔离**
  - 出问题时能快速定位是哪个项目、哪个容器、哪个依赖层

---

## 4. 前期需要准备什么

## 4.1 主机环境准备

部署前确认以下环境已经具备：

- Linux 主机可正常 SSH 登录
- 已创建部署用户，例如 `deploy`
- 已启用 `rootless Podman`
- `systemd --user` 可用
- 主机磁盘空间充足
- 当前已有项目运行稳定
- 不会误覆盖已有端口和目录

### 成功标准

- `deploy` 用户可以登录
- `podman ps` 可正常执行
- `systemctl --user status` 正常
- 主机已有项目未受影响

---

## 4.2 项目资料准备

每个新项目部署前，至少要准备清楚：

- 项目名称
- 前端镜像名
- API 镜像名
- 是否需要数据库
- 使用什么数据库类型
- 是否需要 Redis
- 后端启动依赖哪些环境变量
- 是否依赖 seed 数据 / import 文件 / uploads 目录
- 是否有 migration
- 是否需要初始化脚本
- 是否需要公网访问

### 成功标准

- 能清楚列出该项目的服务清单
- 能明确哪些是必须依赖，哪些是可选依赖
- 能写出该项目的最小启动条件

---

## 4.3 命名规范准备

部署前先确定统一命名，避免后续混乱。

建议格式：

- 项目代号：`projectx-demo`
- pod 名：`projectx-demo-pod`
- web：`projectx-demo-web`
- api：`projectx-demo-api`
- db：`projectx-demo-db`
- redis：`projectx-demo-redis`

目录建议：

- `/home/deploy/apps/projectx-demo/`
- `/home/deploy/apps/projectx-demo/env/`
- `/home/deploy/apps/projectx-demo/data/`
- `/home/deploy/apps/projectx-demo/logs/`
- `/home/deploy/apps/projectx-demo/seed/`
- `/home/deploy/apps/projectx-demo/web/`
- `/home/deploy/apps/projectx-demo/scripts/`

### 成功标准

- 所有服务命名统一
- 目录结构在部署前已经规划好
- 不会和现有项目目录混淆

---

## 4.4 端口规划准备

部署前必须先做端口规划，避免和现有项目冲突。

建议做一张简单表：

| 服务 | 内部端口 | 宿主机端口 | 是否公网访问 |
|---|---:|---:|---|
| web | 80 | 18xxx | 视情况 |
| api | 8080 | 18xxx | 通常不直接公网 |
| postgres | 5432 | 15xxx | 通常不直接公网 |
| redis | 6379 | 16xxx | 通常不直接公网 |
| mysql | 3306 | 13xxx | 通常不直接公网 |

建议原则：

- 前端端口：`18xxx`
- PostgreSQL：`15xxx`
- MySQL：`13xxx`
- Redis：`16xxx`

### 成功标准

- 新项目端口与现有项目完全不冲突
- 已明确哪些端口只绑本机，哪些允许公网

---

## 5. 部署总流程

建议按以下顺序部署：

1. 确认依赖和端口规划
2. 创建项目目录
3. 准备环境变量文件
4. 准备数据库容器
5. 准备 Redis 容器
6. 准备 API 容器
7. 准备 Web 容器
8. 做本机链路验证
9. 做外部访问验证
10. 整理重启、备份、回滚方式

---

## 6. 部署步骤与验收标准

## 6.1 创建项目目录

先在 `deploy` 用户下创建项目目录。

建议目录：

- `~/apps/projectx-demo/env`
- `~/apps/projectx-demo/data`
- `~/apps/projectx-demo/logs`
- `~/apps/projectx-demo/seed`
- `~/apps/projectx-demo/scripts`
- `~/apps/projectx-demo/web`

### 成功标准

- 项目目录创建完成
- 目录结构清晰
- 与其他项目目录完全分开

---

## 6.2 准备环境变量文件

通常需要准备：

- `db.env`
- `api.env`
- 如有需要，额外的 `web.env` 或其他配置文件

需要明确：

- 数据库连接串 key 名
- Redis 配置 key 名
- 应用环境变量名
- 特殊 seed / import 路径
- 第三方服务的关闭或替换配置

### 成功标准

- 环境变量文件存在
- 配置 key 名已与应用实际读取逻辑对齐
- 不依赖“猜测程序会读哪个 key”

---

## 6.3 创建 Pod

如果项目是多服务结构，建议为单个项目创建一个 Pod，让：

- web
- api
- db
- redis

共享同一个网络命名空间。

这样容器之间可以统一通过：

- `127.0.0.1:内部端口`

通信，减少复杂网络问题。

### 成功标准

- `podman pod ps` 能看到项目 Pod
- Pod 状态为 `Running`
- 端口映射与规划一致

---

## 6.4 启动数据库容器

根据项目类型选择：

- PostgreSQL
- MySQL / MariaDB

数据库应优先独立，最少也要做到：

- 独立数据库名
- 独立用户名
- 独立密码

### 成功标准

- 数据库容器状态为 `Up`
- 日志显示 ready to accept connections
- 可以从容器内或宿主机成功连接
- 数据目录挂载成功

---

## 6.5 启动 Redis 容器

如果应用依赖 Redis，不要等 API 报错之后再补，建议在数据库之后、API 之前就准备好。

### 成功标准

- Redis 容器状态为 `Up`
- `redis-cli ping` 返回 `PONG`
- API 所在网络上下文内可以访问 `127.0.0.1:6379`

---

## 6.6 启动 API 容器

启动 API 前需要确认：

- 数据库已可连
- Redis 已可连
- 必要 seed / import 文件已存在
- API 所有必需环境变量已准备

### 成功标准

- 容器状态为 `Up`
- 日志没有持续重启循环
- 数据库 migration 成功或至少不报阻塞性错误
- 健康接口、本机端口或核心 API 路径可访问

建议验收方式：

- `podman logs --tail 100 <api-container>`
- `curl http://127.0.0.1:<api-port>/health`
- 或项目实际核心接口返回合理响应

---

## 6.7 启动 Web 容器

前端部署前需要确认：

- 前端是否内置 Nginx
- 是否依赖反代到 API
- 是否写死 API 地址
- 是否需要额外覆盖 Nginx 配置

如果前端请求的是相对路径 `/api/...`，则需确保反代配置正确。

### 成功标准

- Web 容器状态为 `Up`
- 本机访问前端页面返回 `200`
- 前端请求 API 不返回 `502`
- 页面能正常加载，不是只有静态壳

建议验收方式：

- `curl -I http://127.0.0.1:<web-port>`
- `curl -i http://127.0.0.1:<web-port>/api/...`
- 浏览器打开页面，观察 `Network` 和 `Console`

---

## 6.8 本机链路验证

部署成功不等于系统可用，必须做链路验证。

建议按这个顺序检查：

1. web 本机端口
2. web -> api 反代
3. api -> db
4. api -> redis
5. 应用初始化逻辑

### 成功标准

- web 首页 `200`
- API 接口不是 `502`
- API 无数据库连接错误
- API 无 Redis 连接错误
- 应用不再持续 crash/restart

---

## 6.9 外部访问验证

如果项目需要外部访问，再做外网验证。

deploy@2CJPJYo3Qe:~$ podman exec -it nzat-demo-web sh -lc 'cat /etc/nginx/conf.d/default.conf'
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}

检查项：

- 端口是否需要公网开放
- 防火墙是否允许
- 如果走反代，是否通过 Nginx / BT-Panel 暴露
- 浏览器访问是否正常

### 成功标准

- 浏览器能访问目标 URL
- 页面加载不是超时
- 静态页面与 API 请求都能成功返回

---

## 7. 如果部署第二个项目要共用一个数据库实例，需要注意什么

## 7.1 可以共用“实例”，不要共用“业务库”

可以接受：

- 共用一个 PostgreSQL 实例
- 共用一个 MySQL 实例

但每个项目必须至少做到：

- 独立数据库名
- 独立数据库用户
- 独立密码

不建议：

- 多个项目共用同一个业务数据库
- 多个项目共用超级账号
- 多个项目共用同一个 schema 而没有清晰边界

---

## 7.2 共用实例的前提条件

只有满足下面条件时才建议共用：

- 数据库版本兼容
- 资源足够
- 各项目之间没有强依赖
- 备份策略明确
- 权限边界明确
- 你能清楚区分每个项目的库和账号

---

## 7.3 共用 PostgreSQL 实例时的建议

建议做法：

- `projecta_demo`
- `projectb_demo`
- `projectc_demo`

每个项目一套：

- database
- user
- password

如果其中一个项目是公开 demo，尤其要注意：

- 不要让 demo 数据库和真实业务数据放在同一个业务库里
- 最多共享实例，不共享业务数据

---

## 7.4 共用 MySQL 实例时的建议

原则和 PostgreSQL 类似：

- 独立库
- 独立账号
- 独立权限
- 不共用 root 账号作为应用连接账号

---

## 7.5 什么情况下不应该共用数据库实例

以下情况建议直接单独开一个数据库容器：

- 项目是公开 demo，且需要频繁重置数据
- 项目使用完全不同的数据库版本
- 项目有高风险 migration
- 项目依赖实验性 schema 变更
- 需要彻底分离备份和恢复流程
- 需要避免不同项目在同一实例上互相影响

---

## 8. 建议的共享主机部署模板

假设未来再部署一个项目 `projectx-demo`，建议模板如下：

### 目录

- `/home/deploy/apps/projectx-demo/env/`
- `/home/deploy/apps/projectx-demo/data/`
- `/home/deploy/apps/projectx-demo/logs/`
- `/home/deploy/apps/projectx-demo/seed/`
- `/home/deploy/apps/projectx-demo/web/`
- `/home/deploy/apps/projectx-demo/scripts/`

### 容器

- `projectx-demo-pod`
- `projectx-demo-db`
- `projectx-demo-redis`
- `projectx-demo-api`
- `projectx-demo-web`

### 端口示例

- web：`18613`
- api：`18113`
- postgres：`15513`
- redis：`16613`

### 验收

- `curl -I http://127.0.0.1:18613`
- `curl -i http://127.0.0.1:18613/api/...`
- `podman ps`
- `podman pod ps`

---

## 9. 最低验收清单

后续每个项目部署完成后，至少要通过下面清单：

- [ ] 项目目录结构已创建
- [ ] 环境变量文件已准备
- [ ] 端口规划无冲突
- [ ] Pod 已创建并运行
- [ ] DB 容器可连接
- [ ] Redis 容器可连接
- [ ] API 容器不持续重启
- [ ] migration 或 schema 初始化通过
- [ ] seed / import 文件路径存在
- [ ] Web 页面返回 `200`
- [ ] Web -> API 反代通
- [ ] 浏览器页面能正常加载
- [ ] 浏览器 Network 中核心接口返回正常
- [ ] 当前项目不影响主机上其他项目

---

## 10. 建议的后续优化

这份文档先解决“如何稳定部署第二个项目”。后续建议逐步补：

- systemd --user 启动配置
- 项目级重启脚本
- 项目级备份脚本
- 项目级 health check 脚本
- 统一端口登记表
- 统一项目清单文档
- 统一 Podman 启动模板

---

## 11. 一句话原则

在共享 Linux 主机上部署第二个项目时，重点不是“把容器再跑起来一次”，而是：

**让新项目拥有独立边界、清晰依赖、可验证链路，以及不影响现有项目的运行方式。**
