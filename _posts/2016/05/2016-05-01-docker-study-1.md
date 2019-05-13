---
layout: post
title: docker 学习笔记（一）
categories: [Docker]
tags: [linux,docker]
status: publish
type: post
published: true
author: blackfox
permalink: /20160501/docker-study-1.html
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

第一：它是轻量级的 – 容器的内存占用非常小一般只有200左右，它只要对主进程分配内存再加上几十MB

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

```bash
sudo docker pull ubuntu:14.04
```

获取指定镜像仓库的镜像，如获取阿里云docker镜像

```bash
sudo docker pull registry.mirrors.aliyuncs.com/library/centos
```

创建容器
====

```bash
sudo docker run -d --name php ubuntu:14.04 /usr/sbin/sshd -D
```

删除容器
====
```bash
sudo docker rm  container_name #这里传入容器名称或者容器id
sudo docker rm $(sudo docker ps -a -q)  #删除所有已终止的容器
```

启动|终止容器
====

```bash
sudo docker start container_name | container_id
sudo docker stop container_name | container_id
```

进入容器
====

```bash
sudo docker attach <container_name>|<container_id>
sudo docker exec -it <container_name> /bin/bash
```

打包和导入镜像
====

```bash
 sudo docker commit 046331bdbb90 new-image  #提交容器

 sudo docker save new-image > /tmp/new-image.tar #保存容器
 sudo docker save -o centos.tar centos #也可以用这种方法保存容器

 sudo docker load < /tmp/new-image.tar #导入容器
 sudo docker load --input /tmp/new-image.tar
```


端口映射
=======

<strong>1. 自动映射端口</strong>

-P 使用时需要指定 --expose 选项，指定需要对外提供服务的端口

```bash
sudo docker run -t -P --expose 22 --name container_name  ubuntu:14.04
```

<strong>2. 绑定端口到指定接口</strong>

```bash
sudo docker run -it -p 8080:80 -p 22:22 container_name ubuntu:14.04 /bin/bash
```

挂载宿主文件
=======

```bash
sudo docker run -it -v /share:/usr/local/myshare --name container_name ubuntu:14.04 /bin/bash
```


> 如果你发现容器的网络超级慢，运行一个apt-get update要半天, 那么可能需要切换源.
这里贴上一个阿里云的源，亲测很快

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

docker镜像的远程托管
=====
我们可以像把代码托管在git仓库一样，容器的镜像也是可以托管到远程镜像仓库的，比如说<a href="https://dev.aliyun.com/search.html">阿里云的镜像仓库。</a>
登陆进去创建一个镜像仓库。（这里不提供教程，很容创建的），创建之后你就可以管理你的docker镜像了

> 登陆 docker registry:

```bash
$ sudo docker login --username={username} registry.cn-shenzhen.aliyuncs.com
```
{username}是你的阿里云账号全名，密码是您开通namespace时设置的密码。

registry.cn-shenzhen.aliyuncs.com 是你的镜像仓库的地址

> 从registry中拉取镜像：

```bash
$ sudo docker pull registry.cn-shenzhen.aliyuncs.com/{username}/{仓库名称}:{镜像版本号}
```

> 将镜像推送到registry：

```bash
$ sudo docker login --username={username} registry.cn-shenzhen.aliyuncs.com
$ sudo docker tag {ImageId} registry.cn-shenzhen.aliyuncs.com/{username}/{仓库名称}:{镜像版本号}
$ sudo docker push registry.cn-shenzhen.aliyuncs.com/{username}/{仓库名称}:{镜像版本号}
```

> 重命名镜像

镜像的名称其实是以标签的形式存在，一般都是 {ImageName}:{Version} 的形式， 所以要想重名镜像只需要再打一个标签

```bash
sudo docker tag {ImageId} {ImageName}
sudo docker tag 4356834d3af1 new-image
```

然后把之前的标签删除

```bash
sudo docker rmi {ImageName}
```


使用过程中的一些思考
=====
(1) 在使用和管理容器的时候，你要始终记住一点 <strong>docker 创建的只是一个容器，而不是虚拟机</strong>，
容器只是起到一个隔离作用，这一点很容易搞混。
在linux系统中，你会发现docker容器中的进程都是跑再宿主机器中的
，这一点很容易自己证实，你只需要在宿主机器上输入<code class="scode">ps aux</code>查看你宿主机器上没有的进程就好了。
比如你在容器中开了nginx，但是宿主机器并没有启动nginx，在执行 <code class="scode">ps aux|grep nginx</code> 也是能看到有进程的。
所以，<strong>如果你在宿主目录启动了多个容器，千万不要在宿主目录使用pkill去杀死某个进程</strong>, 因为这样你可能没法知道
你杀死的是哪个容器的进程，最终不得不把所有的容器重启一遍。

<hr />

(2) 容器在启动的时候的ip地址是自动分配的，不可更改。一般是从 <code class="scode">172.17.0.2</code> 开始。为什么？因为
<code class="scode">172.17.0.1</code> 这个ip是宿主机的。从这你也可以知道，在一台宿主机器上你最多只能创建 65534个容器。

<hr />

(3) 容器和外部的通信是不受影响的，因为它是通过宿主机的路由出去的，但是外部机器和容器通信则必须通过宿主机的端口映射来实现，
否则，宿主机无法提供路由到达容器。这一点不搞清楚，你的在配置服务的时候一定会踩各种坑。
但是同一个宿主机器创建的容器之间是可以通过内网ip(<code class="scode">172.28.x.x</code>)直接通信的。

(4) window系统的docker是通过虚拟机实现的，具体实现原理是，通过docker-tool 调用vbox创建一个ubuntu的虚拟机，虚拟机再创建容器。
如果能搞清这层关系，你就可以理解其实在windows系统中，<strong>真正的宿主机是虚拟机，不是windows系统的宿主机器。</strong>
它们是完全不同的系统了，你在windows系统里面是肯定无法管理容器中的进程的。
那很显然，它们之间的网络通信也肯定不像linux那么简单了。大部分人都在百度，google提问，为什么创建容器的时候挂载不了
D盘，或者E，F盘的文件夹。如有你能了解上面所说的，真正的宿主机是虚拟机，而并非window物理机，那么这个问题就很容易解决了。
容器只能挂载宿主机的目录的，所以想要挂载windows的目录或者磁盘，那你首先必须要把windows的磁盘挂载（共享）到虚拟机，这样问题就解决。
<strong>同样，网络也是一样，想要过window宿主机访问容器，那你需要先在虚拟机上做window物理机和虚拟机的端口映射。
然后创建的容器的时候在把容器的端口映射到虚拟机，这样经过2次映射，你就可以通过windows主机的端口直接访问容器的服务了。</strong>

<strong>《完》</strong>
