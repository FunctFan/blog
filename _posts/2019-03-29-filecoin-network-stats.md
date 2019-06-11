---
layout: post
title: Filecoin 系列07-构建 Filecoin 网络统计项目
categories: [Filecoin]
tags: [Filecoin]
status: publish
type: post
published: true
author: blackfox
permalink: /20190329/build-filecoin-network-stats.html
keyword: filecoin-network-stats
desc: 构建 Filecoin 网络统计仪表盘
---

本文讲述如何构建 Filecoin 网络统计项目(filecoin-network-stats)

文章导读：

* TOC
{:toc}

filecoin-network-stats 是一个用于跟踪 Filecoin 网络状态的可视界面。它包含两个项目，**前端仪表盘** 和 **后端信息统计收集服务** 。

# 部署前端

前端的部署特别简单，首先切换到 `front` 目录，然后执行构建就好了。

```bash
cd front
npm install
npm run dev
```

前端项目启动后默认会将 `http://127.0.0.1:8081` 作为后端服务 API 的请求地址，由于我们目前还没有部署后端，所以前端页面暂时无法访问。

如果你想更改后端 API 的 url 可以通过下面的命令来实现：

```bash
BACKEND_URL=<your-backend-url> webpack-dev-server --hot
```

前端仪表盘每隔 5 秒钟向后端发送 http 请求更新一次数据。

# 后端部署

先切换到后端目录 `backend`

然后安装依赖模块

```bash
npm install
```

构建项目

```bash
npm run build
```

如果你计算机上没有安装 PostgreSQL 请先安装：

```bash
sudo apt-get install postgresql # 安装服务端
sudo apt-get install postgresql-client # 安装客户端
sudo apt-get install pgadmin3 # 安装可视化数据库客户端工具
```

然后创建用户和数据库

```bash
sudo su - postgres
psql
CREATE USER filecoin WITH PASSWORD '123456';
CREATE DATABASE filecoin OWNER filecoin;
GRANT ALL PRIVILEGES ON DATABASE filecoin to filecoin;
\q
```

PostgreSQL 的入门教程请点击 [这里](http://www.ruanyifeng.com/blog/2013/12/getting_started_with_postgresql.html){:target="_blank"}

然后，创建 `peerId.json` 文件，在 `backend` 目录下运行以下命令：

```bash
node -e "require('peer-id').create({ bits: 1024 }, (err, id) => { if (err) { throw err; } console.log(JSON.stringify(id.toJSON(), null, 2))})" > peerId.json
```

在启动之前，你首先需要在 `backend` 目录下创建一个环境变量文件 `.env`：

```bash
export DB_URL=<your-postgres-url>
export FULL_NODE_URL=<your-full-node-url>
export IS_MASTER=true
export PEER_INFO_FILE=./peerId.json
export HEARTBEAT_PORT=8080
export API_PORT=8081
export LOG_LEVEL=info
```

关键变量解释：

变量名称 | 变量说明
-----|------
DB_URL | PostgreSQL 数据库连接地址，一般格式为 postgresql://{user}:{pass}@{host}:{port}, 跟 MySQL 的有点像
FULL_NODE_URL | 全节点的 API 地址，一般为  http://{host}:3453, {host} 为你的全节点服务器的 IP 地址
PEER_INFO_FILE | 节点信息文件，就是前面我们创建的 `peerId.json` 文件，不用修改
HEARTBEAT_PORT | 接收节点心跳的端口，所有节点都需要通过这个端口推送改节点的相关信息
API_PORT | API 端口，这个是只给前端项目 (front) 提供服务的 API 服务的端口
LOG_LEVEL | 日志等级，默认是 info，只打印重要信息，更改为 silly 可以打印更详细的信息

下面贴上我的完整配置：

```bash
export DB_URL=postgresql://filecoin:123456@localhost:5432
export FULL_NODE_URL=http://127.0.0.1:3453
export IS_MASTER=true
export PEER_INFO_FILE=./peerId.json
export HEARTBEAT_PORT=8080
export API_PORT=8081
export LOG_LEVEL=silly
```

接下来你需要迁移数据库：

```bash
DATABASE_URL=<your database url> db-migrate up
```
这里的 `DATABASE_URL` 跟上面一样

@Note: 如果这里你碰到权限错误的话，建议先迁移到超级用户 `postgres`，然后再通过导出，导入命令实现。

```bash
pg_dump --host 127.0.0.1 --port 5432 --username postgres  > db.sql postgres # 导出
psql -d filecoin  -f db.sql filecoin # 导入
```

> Note: 如果你的全节点是私有链的话，建议先把除 `ip_to_locations` 之外的所有数据表的数据都清空，否则会有些报找不到区块的异常，因为你测试数据上已经有
10000 多个区块了。

现在万事俱备，可以启动后端节点了：

```bash
source ./.env && node ./dist/src/main.js
```

启动成功之后，你就可以开始收集矿工信息了，要收集有关节点数量和位置的统计信息，请让矿工设置其节点的 `heartbeatUrl` 和昵称，如下所示：

```bash
go-filecoin config heartbeat.nickname '"Pizzanode"'
go-filecoin config heartbeat.beatTarget "/dns4/<your-backend-domain-name>/tcp/8080/ipfs/<your-peer-id>"
```

### 重要提醒
1. `<your-backend-domain-name>` 可以使用域名也可以使用 IP 地址，如果你使用的是 IP 地址，请把前面的 `dns4` 协议改成 `ip4`
2. `<your-peer-id>` 指的是 `peerId.json` 文件中的 `ID` 字段，而不是全节点的节点 ID

比如我的 `peerId.json` 文件中的 ID 为 `QmbUAMCS9bknw5tG4BTpDRsGxFSnvbCqgA6uo8Hvx1wcHc`，然后我的几个节点和 `filecoin-network-stats` 后端服务都是
部署在同一台服务器，所以我设置的 `heartbeatUrl` 为：

> /ip4/127.0.0.1/tcp/8080/ipfs/QmbUAMCS9bknw5tG4BTpDRsGxFSnvbCqgA6uo8Hvx1wcHc

现在你访问前端仪表盘页面： `http://localhost:8082` 就可以看到统计数据了，下面贴上我的部署成功之后的最终效果图：

![](/images/1px.png){:class="img-view" data-src="http://blog.img.r9it.com/image-4998e26f6500ba3e53b1b76ce32b5660.png"}

矿工统计页面：

![](/images/1px.png){:class="img-view" data-src="http://blog.img.r9it.com/image-32870af97db87d7f18c7539bfbddf752.png"}

# 参考文献
[filecoin-network-stats](https://github.com/filecoin-project/filecoin-network-stats){:target="_blank"}
