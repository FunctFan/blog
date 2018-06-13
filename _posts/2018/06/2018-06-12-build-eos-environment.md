---
layout: post
title: EOS 本地开发环境搭建
categories: [区块链]
tags: [EOS, docker]
status: publish
type: post
published: true
author: blackfox
permalink: /20180612/build-eos-dev-env.html 
keyword: EOS, 区块链 
desc: EOS 本地开发环境搭建 
---

&emsp;&emsp;EOS 主网已经于北京时间 2018 年 6 月 10 日晚 9 点开启交易。作为一个爱折腾的码农，花了一整天的事件尝试着搭建了本地测试网络。中间踩的坑比较多，
记录一下，分享出来，希望其他朋友看了之后可以少踩一些坑。

首先看下官方给的最低硬件配置：

> System Requirements (all platforms) <br/>
	8GB RAM free required <br />
	20GB Disk free required 

__所以说内存低于 8GB 的同学就不要尝试了__

然后再看看 EOS 超级节点的配置门槛

> AWSEC 2 主机 x1.32x large 型 <br/>
128 核处理器 <br />
2 TB 内存 <br />
2x1920 GB SSD <br />
25Gb 带宽

啧啧, 果然不是穷逼能玩的起的，据说每年租用费都高达 76 万 RMB.

我物理机安装的是 ubuntu 16.04 LTS, 为了不影响我的开发环境，我选择在 docker 容器里面搭建测试环境，因为 EOS 运行环境需要安装各种依赖，我担心
它分分钟把我的开发主机环境搞的一团糟。如果对 docker 容器还不了解的同学，请看下我的另外一篇 docker 容器入门的博客 
[docker学习笔记（一）](/20160501/docker-study-1.html)

容器使用的镜像还是 ubuntu, 官方推荐的是 ubuntu16.04 或者 ubuntu 18.04, 我这里选择 ubuntu 18.04, 先使用 docker pull 命令把容器镜像下载下来：

```bash
docker pull ubuntu:18.04 
```

然后创建容器，按照官方的推荐需要映射两个端口 8888 和 9876

```bash
docker run -it -v /data/eos:/temp -p 8888:8888 -p 9876:9876 --name eos ubuntu:18.04 /bin/bash 
```

> 注意: 我这里使用了 -v 参数映射了我宿主机的一个文件夹进去，方便我们宿主机和容器之间的文件传输.

接下来，去 github 下载 eos 的源代码, 这里需要下载所有的子模块，所以需要使用 --recursive 参数.

```bash
cd /temp
git clone https://github.com/EOSIO/eos --recursive
```
由于我们做了文件夹映射，所以如果你觉得容器里面的速度太慢，你也可以在宿主机运行，只不过目录需要切换到 <code class="scode">/data/eos</code>

项目比较大，源代码差不多有 800 多MB，真的相当于一个操作系统了， 如果没有翻墙的话，github 会很慢，还有可能会超时下载失败。但是没关系，如果下载失败了
在项目的根目录执行下面代码可以继续 pull 代码

```bash
git submodule update --init --recursive 
```

代码下载完了之后，就可以开始构建环境了, EOS 提供了一个自动化构建的脚本, 从项目的根目录执行自动化构建脚本就好了。

```bash
cd eos
./eosio_build.sh
```

首先自动构建脚本会先安装依赖包，这个过程大概需要15分钟左右，根据你的网速决定。在安装依赖的时候还有一个小插曲，就是 eosio_build.sh 
这个自动化构建脚本里面默认你不是 __root__  用户的，所以它里面很多命令都用了 __sudo__ , 这样就会导致报一个这样的错误：

<img class="img-view" data-src="/images/2018/06/eosbuild-2.png" src="/images/1px.png" />

这个很简单，打开 eosio_build.sh 脚本，把里面所有的 __sudo__ 全部去掉。比如把 sudo apt-get update 换成 apt-get update, 以此类推.

依赖安装一切很顺利，然后接下来你会遇到第二个坑，就是 eosio_build.sh 会在 github 上面下载很多项目来编译安装，比如 mongo-c-driver 等。

github 用的是亚马逊的 aws 云存储，国内访问非常慢，经常下着下着就断了，相信不少人都吐槽过这个。所以安装进行到第二阶段的时候我这边是报了一个这样的错误：

<img class="img-view" data-src="/images/2018/06/eosbuild-1.png" src="/images/1px.png" />

由于 mongo-c-driver 下载失败，执行下面的解压命令的时候出错了，重试了好几次，每次都是到这里下载失败。后来不想浪费时间了，直接去 github 把 
mongo-c-driver-1.9.3.tar.gz 下载下来，然后 copy 到 /tmp 

下载地址：[https://github.com/mongodb/mongo-c-driver/releases?after=1.9.4](https://github.com/mongodb/mongo-c-driver/releases?after=1.9.4)

```bash
wget https://github.com/mongodb/mongo-c-driver/releases/download/1.9.3/mongo-c-driver-1.9.3.tar.gz 
cp mongo-c-driver-1.9.3.tar.gz /tmp
```

然后在回到 eos 的项目根目录， 修改构建脚本 

```bash
vim scripts/eosio_build_ubuntu.sh 
```

注释掉从 281 到 290 行，这几行是下载 mongo-c-driver 的

```bash
#STATUS=$(curl -LO -w '%{http_code}' --connect-timeout 30 https://github.com/mongodb/mongo-c-driver/releases/download/1.9.3/mongo-c-driver-    1.9.3.tar.gz)
282 #               if [ "${STATUS}" -ne 200 ]; then
283 #                       if ! rm -f "${TEMP_DIR}/mongo-c-driver-1.9.3.tar.gz"
284 #                       then
285 #                               printf "\\n\\tUnable to remove file %s/mongo-c-driver-1.9.3.tar.gz.\\n" "${TEMP_DIR}"
286 #                       fi
287 #                       printf "\\tUnable to download MongoDB C driver at this time.\\n"
288 #                       printf "\\tExiting now.\\n\\n"
289 #                       exit 1;
290 #               fi
```

然后把那几行删除 mongo-c-driver-1.9.3.tar.gz 的脚本也注释掉，防止后面安装失败你又得重新拷贝，最后安装完了之后你一次性的把 /tmp 下面的文件删除就好。

```bash
297 #               if ! rm -f "${TEMP_DIR}/mongo-c-driver-1.9.3.tar.gz"
298 #               then
299 #                       printf "\\n\\tUnable to remove file %s/mongo-c-driver-1.9.3.tar.gz.\\n" "${TEMP_DIR}"
300 #                       printf "\\n\\tExiting now.\\n\\n"
301 #                       exit 1;
302 #               fi
```

装完 mongo C++ 之后，还会有几个软件时不时下载失败（如下图）

<img class="img-view" data-src="/images/2018/06/eosbuild-3.png" src="/images/1px.png" />

没关系，重新之心 eosio_build.sh 就好了，它会接着上次失败的地方继续安装。

装完一些依赖插件之后，就迎来了 EOS 主程序代码编译，要编译比较久，你会发现你的 CPU 在满负荷工作，CPU 风扇猛转，几乎所有的 CPU 资源都用光了。下面贴上我的
雷神笔记本执行 __top__ 命令之后的情况:

<img class="img-view" data-src="/images/2018/06/eosbuild-4.png" src="/images/1px.png" />

经过漫长的编译过程（我的笔记本大概编译了 2 个小时, 跟我当初编译 Linux 内核的时候耗时差不多）, 终于出现了我们想看到的界面：

<img class="img-view" data-src="/images/2018/06/eosbuild-5.png" src="/images/1px.png" />

至此，恭喜你，编译完成了。 不过你还需完成最后一步 -- 安装.

进入到 build 目录，执行 make install (如果你不是超级管理员的身份登录的话，记得带上 sudo)

```bash
cd build
make install
```

默认他是安装到 /usr/local/bin 的， cd /usr/local/bin 你会看到下面命名行工具

```bash
-rwxr-xr-x 1 root root  8348888 Jun 12 03:16 cleos*
-rwxr-xr-x 1 root root 27419840 Jun 12 03:17 eosio-abigen*
-rwxr-xr-x 1 root root  5572280 Jun 12 03:16 eosio-launcher*
-rwxr-xr-x 1 root root  2520360 Jun 12 02:59 eosio-s2wasm*
-rwxr-xr-x 1 root root   698896 Jun 12 03:03 eosio-wast2wasm*
-rwxr-xr-x 1 root root     4973 Jun 12 02:56 eosiocpp*
-rwxr-xr-x 1 root root  7629688 Jun 12 03:16 keosd*
-rwxr-xr-x 1 root root    13072 Jun 10 15:29 mongoc-stat*
-rwxr-xr-x 1 root root 48067344 Jun 12 03:15 nodeos*
```

下面测试，先启动 Mongodb 服务

```bash
~/opt/mongodb/bin/mongod -f ~/opt/mongodb/mongod.conf &
```

然后启动节点

```bash
nodeos -e -p eosio --plugin eosio::chain_api_plugin --plugin eosio::history_api_plugin 
```

启动之后如果没有问题就会自动开始生成区块(producing blocks)

<img class="img-view" data-src="/images/2018/06/eosbuild-6.png" src="/images/1px.png" />

然后就可以使用 cleos 等命令行工具进行你想要的各种操作了。

<img class="img-view" data-src="/images/2018/06/eosbuild-7.png" src="/images/1px.png" />

至此，EOS 本地开发环境搭建搭建完成. 

这里顺便提一句，本文是使用 docker 容器模拟物理机器来搭建的，如果单纯想用容器去跑 EOS 服务，要简单的多，只要执行几条命令就好了，
官网有详细的教程 [https://github.com/EOSIO/eos/blob/master/Docker/README.md](https://github.com/EOSIO/eos/blob/master/Docker/README.md), 感兴趣的
同学可以去看看，我这里就不赘述了.



### 参考连接

[https://github.com/EOSIO/eos/wiki/Local-Environment#2-building-eosio](https://github.com/EOSIO/eos/wiki/Local-Environment#2-building-eosio)




