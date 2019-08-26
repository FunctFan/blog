---
layout: post
title: 使用 docker 搭建 Redis 主从同步
categories: [Database,Redis]
tags: [Docker, Redis]
status: publish
type: post
published: true
author: blackfox
permalink: /20190826/docker-build-redis-master-slave.html
desc: 使用 Docker 构建 Redis 主从同步, Redis 主从同步原理
--- 

首先我们来看下 Redis 主从同步的机制，Redis 的同步分为全量同步和增量同步。

> 全量同步流程

1. Slave 发送 sync 命令到 Master
2. Master 启动一个后台进程，将当前 Redis 中的数据快照保存到文件中（即启动 BgSave 进程）
3. Master 将保存数据快照期间的写入指令缓存起来
4. Master 完成数据写入操作之后，将快照文件(RBD 文件)发送到 Slave
5. Slave 接收到文件之后使用新的文件替换旧的 RBD 文件
6. Master 将这期间缓存的增量写入指令发送到 Slave 端
7. Slave 收到增量指令集合之后进行指令回放，从而完成本次全量同步

> 增量同步过程

1. Master 接收到用户的指令操作，判断是否需要传播到 Slave(一般只有写指令才需要广播到 Slave)
2. 将操作记录追加到 AOF 文件
3. 将操作传播到其他 Slave ，先对齐主从库，然后往响应缓存中写入指令
4. 将缓存中的数据发送到 Slave

接下来我们正式讲解如何使用 Docker 搭建主从同步。

## 1. 下载 docker 镜像

这里我下载当前最新的版本 5.0.5

```bahs
docker pull redis:5.0.5
```

## 2. 修改配置文档

首先要从 Redis 官方下载一份标准的配置文档

```bash
wget -c http://download.redis.io/redis-stable/redis.conf
```

我们本次测试的是搭建一主二从(1 Master 2 Slaves)，由于是容器，所以我们需要把数据目录和配置文件映射出来。先创建好目录和文件

```bash
mkdir -p /data/redis/master/data 
mkdir -p /data/redis/slave1/data 
mkdir -p /data/redis/slave2/data

cp redis.conf /data/redis/master/
cp redis.conf /data/redis/slave1/
cp redis.conf /data/redis/slave2/
```
接下来修改配置文档 

> master/redis.conf

```properties
dir /data 
appendonly yes
requirepass 123456 #设置连接密码 
bind 0.0.0.0 #允许外网访问
```

> slave/redis.conf

```properties
dir /data 
appendonly yes
bind 0.0.0.0 
replicaof redis-master 6379
masterauth 123456
```

这里需要注意的是，`replicaof` 的配置格式本来是 `replicaof <masterip> <masterport>`，但是考虑到容器的 IP 不好确定，所以这里用 Master 节点
的容器名称来替代 IP。容器的通信可以通过 `--link` 选项来实现，而这里的 `redis-master` 就是 master 节点容器的名字。

## 启动容器

启动 Master 

```bash
docker run --name redis-master -p 6379:6379 \
		   -v /data/redis/master/data:/data \
		   -v /data/redis/master/redis.conf:/etc/redis/redis.conf \
		   -d redis:5.0.5 redis-server /etc/redis/redis.conf
```

启动 Slave1 

```bash
docker run --name redis-slave1 -p 6380:6379 \
		   -v /data/redis/slave1/data:/data \
		   -v /data/redis/slave1/redis.conf:/etc/redis/redis.conf \
		   -d redis:5.0.5 redis-server /etc/redis/redis.conf \
		   --link redis-master:master
```

启动 Slave2

```bash
docker run --name redis-slave2 -p 6381:6379 \
		   -v /data/redis/slave2/data:/data \
		   -v /data/redis/slave2/redis.conf:/etc/redis/redis.conf \
		   -d redis:5.0.5 redis-server /etc/redis/redis.conf \
		   --link redis-master:master
```

## 连接测试

首先连接主节点，添加一条数据：

```bash
yangjian@yangjian-desktop:~$ redis-cli -p 6379 -a 123456
127.0.0.1:6379> set name "hello Redis"
OK
127.0.0.1:6379>
```

然后分别连接两个从节点，看能否读取对应的数据

```bash
yangjian@yangjian-desktop:~$ redis-cli -p 6380
127.0.0.1:6380> get name
"hello Redis"
127.0.0.1:6380> exit
yangjian@yangjian-desktop:~$ redis-cli -p 6381
127.0.0.1:6381> get name
"hello Redis"
127.0.0.1:6381>
```

进一步测试，我们通过 shell 脚本管道往 Master 节点中灌入 10w 条数据，然后查看从节点是否有同步。

```bash
for((i=1;i<=100000;i++)); do echo "set k$i v$i" >> /tmp/redisTest.txt; done;
cat /tmp/redisTest.txt | redis-cli -a 123456 --pipe

All data transferred. Waiting for the last reply...
Last reply received from server.
errors: 0, replies: 100000
```

如果在灌入数据的时候出错的话，可能是换行符的问题，只需要把 `redisTest.txt` 文件的格式改成 `dos` 就好了。具体操作步骤如下：

1. vim /tmp/redisTest.txt 
2. :set fileformat=dos 
3. :wq 保存退出

灌入数据之后我们切换到 Redis 的 `data` 目录，查看 AOF 文件大小。

```bash
yangjian@yangjian-desktop:~$ du -sh /data/redis/*
5.0M	/data/redis/master
5.0M	/data/redis/slave1
5.0M	/data/redis/slave2
```

发现数据都大小都是一致的。Redis 主从同步已经搭建完成。



