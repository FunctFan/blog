---
layout: post
title: IPFS系列03-使用容器运行 IPFS 节点
categories: [IPFS]
tags: [IPFS,docker]
status: publish
type: post
published: true
author: blackfox
permalink: /20190410/run-ipfs-with-docker.html
desc: 使用 docker 运行 IPFS 节点
--- 

容器（docker）是一个伟大的创新，它将我们带入了云原生的时代。使得环境搭建，应用的部署变得异常简单，方便。使用容器我们可以很轻松的搭建
我们的集群应用和微服务。

本文主要讲述如何在容器中运行 ipfs 节点。

文章导读：
* TOC
{:toc}

> 注：本文默认你的机器上已经安装好了 docker 服务，如果还有安装请先阅读 [docker学习笔记](/20160501/docker-study-1.html)

# 下载 IPFS docker 镜像

```bash
docker pull ipfs/go-ipfs
```

# 创建 IPFS 容器实例

首先你需要创建两个目录，因为 docker 只是用来作为 IPFS 运行的环境，把文件数据也存储在容器中显然是个糟糕的注意，所以我们需要把数据目录
通过 docker 的 `-v` 参数映射出来，另外还需要选择一个文件用来在 ipfs 容器重启的时候保存文件的状态。

```bash
mkdir -p /data/ipfs/ipfs_staging
mkdir -p /data/ipfs/ipfs_data
export ipfs_staging=/data/ipfs/ipfs_staging
export ipfs_data=/data/ipfs/ipfs_data
```

然后启动运行 IPFS 的容器并暴露端口4001，5001和8080：

```bash
docker run -d --name ipfs_host \
		   -v $ipfs_staging:/export \
		   -v $ipfs_data:/data/ipfs \
		   -p 4001:4001 -p 127.0.0.1:8080:8080 \
		   -p 127.0.0.1:5001:5001 ipfs/go-ipfs:latest
```

### 查看容器日志

```bash
docker logs -f ipfs_host
```

启动需要一点时间，如果你看到下面的日志输出，说明 ipfs 节点服务启动成功：

```bash
Gateway (readonly) server
listening on /ip4/0.0.0.0/tcp/8080
```
### 运行 ipfs 命令

```bash
docker exec ipfs_host ipfs <args...>
```

比如查看当前容器节点的连接节点：

```bash
docker exec ipfs_host ipfs swarm peers
```

如果你想进入容器的终端，可以通过执行下面的命令：

```bash
docker exec -it ipfs_host /bin/sh 
```

停止运行容器

```bash
docker stop ipfs_host
```

启动容器

```bash
docker start ipfs_host
```

### 批量创建容器

假设你需要创建多个容器了，一个一个这样输入命令很麻烦，这时你可以把整个创建容器的操作写成一个脚本：

`vim create-ipfs-node` 加入以下内容：

```bash
#!/bin/bash 
# This script help you create an ipfs container quickly.

if [ $# != 4 ] ; then
	echo "Four args needed: name, port1, port2, port3"
	exit 1;
fi

ipfs_staging=$(pwd)/$1/ipfs_staging
ipfs_data=$(pwd)/$1/ipfs_data

mkdir -p $ipfs_staging
mkdir -p $ipfs_data

docker run -d --name $1 \
		   -v $ipfs_staging:/export \
		   -v $ipfs_data:/data/ipfs \
		   -p $2:4001 -p 127.0.0.1:$3:8080 \
		   -p 127.0.0.1:$4:5001 ipfs/go-ipfs:latest
```

然后如果想创建一个新的 ipfs 节点的话，只需要运行脚本，传入参数就可以了，比如：

```bash
./create-ipfs-node ipfs-node1 4001 5001 8001
```

# 参考链接

* [go-ipfs#docker-usage](https://github.com/ipfs/go-ipfs#docker-usage)


