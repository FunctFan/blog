---
layout: post
title: 搭建主网以太坊全节点钱包
categories: [以太坊]
tags: [以太坊,钱包]
status: publish
type: post
published: true
author: blackfox
permalink: /20181116/ether-main-node-build.html
keyword: 以太坊,钱包搭建, geth
desc: 搭建主网以太坊全节点钱包
---

> 最近公司需要开发以一个基于以太坊的 DApp, 使用 ETH 作为中转介质，需要开发一个简易版的以太坊的钱包组件。考虑到 API 的并发，为了保证 DApp 的稳定运行，
不能使用 Infura 的免费接口，所以还是决定自己搭建钱包节点。本文就是记录了整个节点搭建的过程，供有需要的同学参考。

# 机器配置
__首先一个良好的建议是，不管你的机器配置有多好，请不要把钱包和应用部署在同一台云主机上。__ 否则可能会发生一些你意想不到的后果。

#### 土豪配置

```
CPU: 网络增强型 4 核
内存: 8GB
硬盘: 500GB SSD 固态硬盘
网络: 3M+
```

#### 中产阶级配置

```
CPU: 通用型 4 核
内存: 8GB
硬盘: 500GB 高速云盘(机械硬盘)
网络: 1MB (独享)
```

#### 贫民配置

```
CPU: 通用型 2 核
内存: 4GB
硬盘: 500GB 高速云盘
网络: 1M
```

我们公司是在阿里云买的 ECS 云主机，配置使用的是"中产阶级配置"，系统是 Ubuntu 16.04 LTS.

# 安装相关工具软件
目前搭建以太坊钱包节点的主流的有两种，一种是使用官方的 geth 工具，一种是使用 parity 工具搭建。我们这次技术选型选的是 geth, 你要问我为什么不用 parity,是因为我觉得官方的更靠谱一些，而且我的 API 用的是 web3, 最重要的原因是 parity 我不熟，呵呵...


#### 1. 配置 go 语言运行环境
根据自己操作系统类型，选择对应的版本，我安装的是 liunx 64 位系统版本的
```bash
wget https://dl.google.com/go/go1.11.2.linux-amd64.tar.gz
# 解压
tar xvpzf go1.11.2.linux-amd64.tar.gz
# 安装
mv go /usr/local/
sudo ln -s /usr/local/go/bin/go /usr/local/bin/
```
#### 2. 安装 geth
这里我们采用编译以太坊官方的源码来安装，
我安装的时候最新版本是 v1.8.17, 大家具体根据自己情况下载对应的版本，下载地址：[https://github.com/ethereum/go-ethereum/tags](https://github.com/ethereum/go-ethereum/tags)

```bash
wget https://github.com/ethereum/go-ethereum/archive/v1.8.17.tar.gz
# 解压
tar xvpzf v1.8.17.tar.gz
mv go-ethereum-1.8.17 /usr/local/go-ethereum
cd /usr/local/go-ethereum
make all
```
编译完成之后在 build/bin 目录下会生成很多可执行文件，<code class="scode">geth</code> 就是其中一个.

#### 3. 配置环境变量

编辑 `/etc/environment` 文件，添加 geth 和 go 语言的环境变量

```bash
GOROOT=/usr/local/go

PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/usr/local/go/bin:/usr/local/go-ethereum/build/bin"
```

重启服务器或者执行 source /etc/environment 命令使环境配置生效

然后在终端输入 geth version 命令就会返回如下输出：

```bash
root@iZj6cefzgbtxiky8zkwv3oZ:~# geth version
Geth
Version: 1.8.17-stable
Architecture: amd64
Protocol Versions: [63 62]
Network Id: 1
Go Version: go1.11.2
Operating System: linux
GOPATH=
GOROOT=/usr/local/go
```

打印出 geth 的版本，go 语言版本，以及 GOROOT 这些环境变量，说明 geth 已经安装成功了.

# 准备节点启动脚本

这里我直接给出一个启动脚本，如果要了解 geth 命令的详细用法的话，这里推荐一篇比较好的博客
 [以太坊客户端Geth命令用法-参数详解](https://learnblockchain.cn/2017/11/29/geth_cmd_options/)

```bash
nohup geth --syncmode "fast" --networkid 1 --datadir /data --cache 2048 --identity "ddblock" --rpc --rpcapi "db,eth,net,web3" --rpccorsdomain "*" --rpcport 8545 --port 30303 --rpcaddr 127.0.0.1  & > nohup.out
```

我现在对这些参数进行简单解释:

参数名称 | 参数说明
--syncmode | 同步模式，有三种"fast" ,"full","light".
--networkid | 网络ID(整型, 1=Main, 2=Morden (弃用), 3=Ropsten, 4=Rinkeby) 这里我们使用默认值 1 表示同步主网的数据
--datadir | 钱包以及区块数据等存储目录，这个建议单独使用数据盘，不要指定系统盘的文件夹
--identity | 节点标识符
--rpc | 开启 RPC 服务
--rpcapi | 开放那些 API 给 JSONRPC 调用，默认 personal 工具是不开放的
--rpccorsdomain | RPC 调用跨域限制，`*`号标识不限制
--rpcport | JSONRPC 服务监控的端口
--port | 同步服务端口
--rpcaddr | 可以调用 RPC 服务的IP地址，我这里只允许本地调用，不开放给其他用户，如果你想做成 Infura 那样作为公开的 API 的话，可以设置成 0.0.0.0

```bash
nohup {cmd} & > nohup.out
```
表示在后台运行一个脚本，并将输出导入到 nohup.out 文档中

__这里我再对同步模式做一个更加详细的解释__

> 【 fast 】 启动快速区块同步模式，在同步到最新区块后，转化为正常区块同步模式. 这个是推荐选项，此方法可能会对历史数据有部分丢失，
但是不影响今后的使用 <br />
【full】从开始到结束，获取区块的header，获取区块的body，从创始块开始校验每一个元素，需要下载所有区块数据信息。
速度最慢，但是能获取到所有的历史数据, 这个是默认的选项。<br />
【light】仅获取当前状态。验证元素需要向full节点发起相应的请求。

如果想要关闭在后台运行的节点，可以使用以下脚本

```bash
#!/bin/sh
pid=`ps -ef|grep geth|grep -v grep|awk '{print $2}'`
echo $pid
kill -INT $pid
```

在节点启动之后，我们可以使用 `geth attach` 命令去进入节点 javascript 终端

```bash
root@iZj6cefzgbtxiky8zkwv3oZ:~# geth attach /data/geth.ipc
Welcome to the Geth JavaScript console!

instance: Geth/ddblock/v1.8.17-stable/linux-amd64/go1.11.2
modules: admin:1.0 debug:1.0 eth:1.0 ethash:1.0 miner:1.0 net:1.0 personal:1.0 rpc:1.0 txpool:1.0 web3:1.0

>
```

这里的 data 为上面启动 geth 时指定的 datadir 目录。

进入终端以后我们就可以输入命令去查看同步的状态，网络，区块信息等，比如如果我们想查看当前同步状态的话可以使用 `eth.syncing` 命令：

```bash
> eth.syncing
{
  currentBlock: 6143193,
  highestBlock: 6143296,
  knownStates: 91512910,
  pulledStates: 91498893,
  startingBlock: 0
}
```

这里有个坑就是，你会发现你每次执行 `eth.syncing` 命令的时候 currentBlock 和 highestBlock 都只相差几百，以为马上就要同步完了，只有几百个区块了。
其实你还只是同步了一小部分。这个是正常现象，因为我们使用了 --fast 选项，所以开始只同步了区块头，它还要慢慢的去同步区块 Body.

另外在同步的过程中我们通过 eth.blockNumber 去查看当前区块号的话会显示为 0

```bash
> eth.blockNumber
0
```

可以通过 net.peerCount 来看自己的这个节点连了多少个其它节点进行数据同步。

```bash
> net.peerCount
6
```
如果是返回的是 0 的话，那么估计可能还没有开始同步，没有找到节点，如果长时间是 0 的话，那么就查一下你的网络是否通畅了。

如果你通过 `eth.syncing` 返回的是 false 的，或者 `eth.blockNumber` 返回的是大于 0  的整数的话，如下：

```bash
> eth.blockNumber
6712841
> eth.syncing
false
```

那么 Congratulations, 同步已经完成，你就可以开始调用钱包 API 转账了。

顺便说一下，我用的阿里云的香港主机，中产阶级配置，大概不到两天就同步完成了，区块的数据总共 140 GB, 速度还是可以的。

至此，一个全节点的以太坊钱包就部署完成，__Enjoy Coding.__
