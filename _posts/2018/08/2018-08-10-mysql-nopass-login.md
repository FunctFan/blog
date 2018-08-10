---
layout: post
title: 为什么MYSQL不用密码也能访问？
categories: [数据库技术]
tags: [MYSQL]
status: publish
type: post
published: true
author: blackfox
permalink: /20180810/why-mysql-nopass-login.html
keyword: 
desc: 为什么MySQL 不输入密码也等登录
---

> 最近解决了一个困扰很久的问题，就是常常配置好 MySQL 环境之后，明明自己设置了密码，却发现在本地不输入用户名，密码照样可以登录.

问题描述如下：

```bash
root@ppblock:~# mysql
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 5.7.23-0ubuntu0.18.04.1 (Ubuntu)

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 

```

你只要输入 mysql 命令，后面随便输入什么，或者什么也不输入，都能轻松的进入 mysql 客户端控制台, 而且是 root 账户，意味着任何一个人只要登入你的服务器
就可以轻轻松松的删了你所有的数据库...

我们可以从三个方向去排查引起这个问题的原因：

> 1、看看 mysql 的配置文件目录 /etc/mysql/ 是否有跳过权限检查的配置

```bash
root@ppblock:~# cd /etc/mysql/
root@ppblock:/etc/mysql# grep -r "skip-grant-tables"
root@ppblock:/etc/mysql#
```

显然我的配置文档中并没有跳过密码验证的配置

> 2、看看 my.cnf 里面是不是把密码写进去了，这里因为我们只找 root 账户，因此只需查找是否有 user='root' 或者 user=root 就 Ok 了.

```bash
root@ppblock:~# cd /etc/mysql/
root@ppblock:/etc/mysql# grep -r "user=root"
root@ppblock:/etc/mysql# grep -r "user='root'"
root@ppblock:/etc/mysql# 
```

查完发现没有，另外还需在查找是否存在 ~/.my.cnf 文件，因为一般的免密码登录都设置在这个文件里面。我一查发现我的机器上根本没有这个文件。所以排除原因2

> 3、是否是 MySQL 用户插件的问题

先进入 MYSQL 控制台，输入如下命名

```bash
mysql> select user,Host, plugin from mysql.user;
+------------+-------------+-----------------------+
| user       | Host        | plugin                |
+------------+-------------+-----------------------+
| root       | localhost   | auth_socket           |
| ppexchange | %           | mysql_native_password |
| root       | 172.16.10.* | mysql_native_password |
| admin      | localhost   | mysql_native_password |
+------------+-------------+-----------------------+
4 rows in set (0.00 sec)
```

果然，localhost 的 root 用户跟其他用户都不同，其他用户都是 mysql_native_password, 而默认用户却是 auth_socket, 于是果断改过来试下

```bash
mysql> update mysql.user set plugin = 'mysql_native_password' where user = 'root' and host='localhost';
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0
mysql> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.00 sec)
```

__这里注意最后要执行 FLUSH PRIVILEGES 去刷新权限缓冲__

退出重启 MySQL 之后发现终于得到了自己想要的结果

```bash
root@ppblock:~# mysql
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: NO)
```

至此，这个问题算是彻底解决了。




