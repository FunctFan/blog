---
layout: post
title: 使用 docker 搭建 MySQL 主从同步/读写分离
categories: [Database, Docker]
tags: [docker, MySQL]
status: publish
type: post
published: true
author: blackfox
permalink: /20190727/mysql-master-slave-in-docker.html
desc: 使用 docker 搭建 mysql 主从同步, 实现 MySQL 读写分离
--- 
MySQL 提供自带的主从同步功能，可以轻松实现读写分离，保证系统性能的稳定性和数据安全性。

本文讲述如何使用 Docker 搭建 MySQL 的主从复制功能。

* TOC
{:toc}

> Note: 如果对 Docker 不熟悉的同学，可以先看看下面两篇文章：
* [docker 学习笔记（一）](/20160501/docker-study-1.html)
* [docker 学习笔记（二）](/20160502/docker-study-2.html)

# 拉取 MySQL 容器镜像

```bash
docker pull mysql:5.7
```
这里我使用的是 5.7 版本，如果你想要拉取最新版本的镜像，可以使用：

```bash
docker pull mysql:latest
```

下载完成之后我们可以先查看一下镜像是拉取成功

```bash
docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
mysql               5.7                 f6509bac4980        4 days ago          373MB
```

# 创建 MySQL 容器 

创建主数据库容器

```bash
docker run --name mysql-master -p 3307:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7
```

创建从数据库容器

```bash
docker run --name mysql-slave -p 3308:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7
```

这里我们分别使用了 3307 和 3308 端口，因为我们本地宿主机器上已经跑了 MySQL 了，3306 端口被占用。


# 配置主数据库

首先，进入容器：

```bash
docker exec -it mysql-master /bin/bash 
root@c72a3032f986:/#
```

连接 MySQL

```bash
mysql -u root -p123456
```

修改 root 可以通过任何客户端连接

```sql
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
```

修改 MySQL 配置文档 `/etc/mysql/mysql.conf.d/mysqld.cnf`，在 `[mysqld]` 段添加以下配置：

```ini
log-bin=mysql-bin    //[必须]启用二进制日志
server-id=1          //[必须]服务器标识ID，每台服务器唯一
```

# 配置从服务器

首先，进入容器：

```bash
docker exec -it mysql-slave /bin/bash 
root@89bdbb5786ab:/#
```

连接 MySQL

```bash
mysql -u root -p123456
```

修改 root 可以通过任何客户端连接

```sql
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
```

修改 MySQL 配置文档 `/etc/mysql/mysql.conf.d/mysqld.cnf`，在 `[mysqld]` 段添加以下配置：

```ini
log-bin=mysql-bin    //[必须]启用二进制日志
server-id=2          //[必须]服务器标识ID，每台服务器唯一
```

# **配置 MySQL 主从复制**

首先连接 master 服务器，查看数据库状态：

```sql
mysql> show master status;
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000003 |      154 |              |                  |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)
```

记录 File 的值和 Position 的值，等会配置 slave 服务器的时候要用。

接下来连接 slave 服务器，配置主从复制：

```sql
mysql>change master to
master_host='x.x.x.x',
master_user='user',
master_log_file='mysql-bin.000003',
master_log_pos=154,
master_port=3307,
master_password='123456';
Query OK, 0 rows affected, 2 warnings (0.03 sec)
mysql> start slave;
Query OK, 0 rows affected (0.01 sec)
```

解释下配置参数

```
master_host='x.x.x.x' // 这里填 master 主机 ip
master_log_file='mysql-bin.000003', // 这里填写 File 的值
master_log_pos=154,// 这里填写 Position 的值。
mysql> start slave;// 启动从服务器复制功能
```

**如果不小心配置错, 输入 mysql> stop slave; 然后重新录入一遍就可以了。**

接下来我们可以检查主从连接状态：

```sql
show slave status\G
```

![](/images/1px.png){:class="img-view" data-src="http://blog.img.r9it.com/image-4ae11e5a41ade71bb74cfb9e6a94a411.png"}

```bash
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
```

**这两个必须是 Yes 为 No 或者 connect 说明没有连接上。**

# 重启容器，使配置生效

分别重启 `mysql-master` 和 `mysql-slave` 容器
```bash
docker stop mysql-master
docker start mysql-master

docker stop mysql-slave
docker start mysql-slave
```

# 测试

在 master 容器中创建一张 user 表；

```sql
mysql> CREATE TABLE `user` (
    ->   `user_id` bigint(20) AUTO_INCREMENT,
    ->   `username` varchar(30) NOT NULL,
    ->   `password` varchar(30) DEFAULT NULL,
    ->   PRIMARY KEY (`user_id`)
    -> ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
Query OK, 0 rows affected (0.47 sec)
```

然后在 slave 容器查看：

```sql
mysql> show tables;
+----------------+
| Tables_in_test |
+----------------+
| user           |
+----------------+
1 row in set (0.00 sec)
```

发现已经同步过来了。

在 master 服务器 `user` 表插入一条数据：

```sql
mysql> insert into user(username, password) values ('test_user', 'test_pass');
Query OK, 1 row affected (0.07 sec)
```

然后看看 slave 服务器是否有同步

```sql
mysql> select * from user;
+---------+-----------+-----------+
| user_id | username  | password  |
+---------+-----------+-----------+
|       1 | test_user | test_pass |
+---------+-----------+-----------+
1 row in set (0.00 sec)
```

显然，已经完美同步了。

> Note: 这里我们只是演示，所以把数据表也同步过来了。一般情况下数据表是不同步的，先各自在 master 和 salve 创建好。
因为一般来说 master 和 slave 的表的存储引擎是不一样的，master 一般用的是 `InnoDB`，因为它要写数据比较多。
而 slave 表一般用的是 `MyISAM` 引擎，因为它是没有写数据操作，只有读，用 `MyISAM` 引擎能大大节省资源，速度也会快一些。


# 参考链接

* http://www.sunhao.win/articles/mysql-replication.html
