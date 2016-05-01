---
layout: post
title: docker学习笔记（一）
date: 2016-05-01
categories: [linux,服务器运维]
tags: [linux,docker]
status: publish
type: post
published: true
author: blackfox
permalink: /2016-05-01/docker-study-1.html
description: docker 入门学习笔记（一）
---

作为码农，最麻烦的莫过于系统奔溃之后需要重新配置环境了，这个比较麻烦且耗时，一个偶然的机会了解docker,它解决了长期困扰我的问题

关于docker
=======
Docker是一个开源的引擎，可以轻松的为任何应用创建一个轻量级的、可移植的、自给自足的容器。开发者在笔记本上编译测试通过的容器可以批量地在生产环境中部署，包括VMs（虚拟机）、bare metal、OpenStack 集群和其他的基础应用平台。

<strong>docker的应用场景</strong>
* 隔离开发环境，每个容器都是个独立的开发环境，如果这个容器坏了，删掉再创建一个容器即可。
* web应用的自动化打包和发布；
* 自动化测试和持续集成、发布；
* 在服务型环境中部署和调整数据库或其他的后台应用；
* 从头编译或者扩展现有的OpenShift或Cloud Foundry平台来搭建自己的PaaS环境。

<strong>docker的特点</strong>
第一：它是轻量级的 – 容器的内存占用非常小一般只有200左右，它只要对主进程分配内存再加上几十MB。
第二：它很快速 – 启动一个容器与启动一个单进程一样快。不需要几分钟，您可以在几秒钟内启动一个全新的容器。


安装 docker
=======
```bash
sudo apt-get install apt-transport-https
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 36A1D7869245C8950F966E92D8576A8BA88D21E9
sudo bash -c "echo deb https://get.docker.io/ubuntu docker main > /etc/apt/sources.list.d/docker.list"
sudo apt-get update
sudo apt-get install lxc-docker
```

获取镜像
====
获取官方镜像(默认)

> sudo docker pull ubuntu:14.04

获取指定镜像仓库的镜像，如获取阿里云docker镜像

> sudo docker pull registry.mirrors.aliyuncs.com/library/centos

容器操作
=====
创建容器

> sudo docker run -it ubuntu:14.04 /bin/bash

删除容器

> sudo docker rm  \<container_name\>\|\<container_id\>（容器名称或者ID）

删除所有已终止的容器

> sudo docker rm $(sudo docker ps -a -q)

进入容器

> sudo docker attach \<container_name>\|\<container_id> <br />
	sudo docker exec -it \<container_name\> /bin/bash 


端口映射
=======

<strong>1. 自动映射端口</strong>

-P 使用时需要指定 --expose 选项，指定需要对外提供服务的端口

> sudo docker run -t -P --expose 22 --name container_name  ubuntu:14.04

<strong>2. 绑定端口到指定接口</strong>

> sudo docker run -it -p 8080:80 -p 22:22 container_name ubuntu:14.04 /bin/bash 

挂载宿主文件
=======

> sudo docker run -it -v /share:/usr/local/myshare --name container_name ubuntu:14.04 /bin/bash 



可能碰到的问题
=====
一、 网络超级慢，运行一个apt-get update要半天

1. 切换源

```bash
deb http://mirrors.aliyun.com/ubuntu/ trusty main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ trusty-security main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ trusty-updates main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ trusty-proposed main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ trusty-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ trusty main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ trusty-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ trusty-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ trusty-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ trusty-backports main restricted universe multiverseV
```

2. docker 默认的dns是8.8.8.8和8.8.4.4这个一般在天朝是比较慢的，所以最好换成所在城市的dns


