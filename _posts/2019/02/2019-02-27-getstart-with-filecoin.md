---
layout: post
title: IPFS 系列03-搭建 FILECOIN 挖矿节点
categories: [IPFS]
tags: [IPFS,FILECOIN]
status: publish
type: post 
noToc: true
published: true
author: blackfox
permalink: /20190227/getstart-with-filecoin.html
keyword: getstart-with-filecoin, 搭建 FILECOIN 挖矿节点

---

本文介绍如何在计算机上安装和运行 Filecoin 节点。后续教程将介绍如何使用您的节点进行 Filecoin 挖矿或存储数据。

文章导读：

* TOC
{:toc}

# 安装 Filecoin
Filecoin 目前有两种安装方式，一种是直接下载编译好的可执行文件，另一种是通过编译源码安装。

## 下载可执行文件
官网有直接编译好的 release 版本 v0.0.1
下载地址为: [https://github.com/filecoin-project/go-filecoin/releases](https://github.com/filecoin-project/go-filecoin/releases){:target="\_blank"}

不过遗憾的是，官方编译的0.0.1(写本文时的最新版本)无法正常运行(本人是用 linux 测试)。我自己手动编译了一个版本，基于 commit 
`94b2894473e57c44d60164f89f417694ea3911db`。 下载地址为: [百度云盘](https://pan.baidu.com/s/1Nf9hqqXDfw6u2aP3Lu1xuA)

## 手动编译
手动编译需要比较长的时间(本人花了大概一个半小时)，根据网络的而定。

> 一、安装依赖

go-filecoin 的编译依赖 Go 语言，Rust, cargo, jq 所以在编译之前需要先安装这些依赖

> 第一步你需要搭建 Go 语言编译环境

去 Go 官网下载二进制安装包， [https://dl.google.com/go/go1.11.5.linux-amd64.tar.gz](https://dl.google.com/go/go1.11.5.linux-amd64.tar.gz)，然后解压：

```bash
tar xvf go1.11.5.linux-amd64.tar.gz -C /usr/local/ 
```

然后配置环境变量 `sudo vim /etc/profile`, 在文件末尾加上

```bash
# golang environment configure
export GOROOT=/usr/local/go
export GOBIN=$GOROOT/bin
export GOPKG=$GOROOT/pkg/tool/linux_amd64
export GOARCH=amd64
export GOOS=linux 
export GOPATH=/golang/
PATH=$PATH:$GOBIN:$GOPKG
```

这里需要注意的是：__假如你没有设置 GOBIN 环境变量，那么你需要把 $GOPATH/bin 加入 PATH 环境路径，
否则可能在待会编译的过程中出现找不到可执行文件的问题。__，因为 Go 默认会把第三方工具安装在 `$GOBIN` 下面，
如果没有配置的话，默认会安装在 `$GOPATH/bin` 下面。
GOPATH 是你所有 Go 项目的根目录，保存之后重启或者执行 `source /ect/profile` 使配置生效。

> 安装 Rust, cargo, 这个非常简单，一条简单的命令就可以

```bash
sudo agt-get install curl # 如果你的操作系统已经安装了 curl 了，那么这一步可以跳过
curl https://sh.rustup.rs -sSf | sh
```

> 安装 jq, gcc(官方要求是 v7.4.0 以上，但是我用 v7.3.0 也编译成功了)

```bash
sudo apt-get install jq
sudo apt-get install gcc
```

> 下载 go-filecoin 源码并安装 Go 依赖包

由于 Filecoin 项目用来很多第三方的开发包，而这些包通常国内的网络是无法访问的，__所以你得保证你的终端是能够翻墙的。__

不知道配置终端翻墙的同学请移步 [linux 配置终端代理](/20190121/proxy-in-terminal.html)

```bash 
# 创建项目目录
mkdir -p ${GOPATH}/src/github.com/filecoin-project
# clone 代码
git clone https://github.com/filecoin-project/go-filecoin.git ${GOPATH}/src/github.com/filecoin-project/go-filecoin
cd ${GOPATH}/src/github.com/filecoin-project/go-filecoin
# 切换到测试网络分之
git checkout devnet-user
# 下载并安装 Go 依赖包
FILECOIN_USE_PRECOMPILED_RUST_PROOFS=true go run ./build/*.go deps
```

第一次执行这个脚本的时间会比较长，因为需要生成一个 1.6GB 的参数文件，文件路径为 `/tmp/filecoin-proof-parameters`。该参数文件主要用于生成复制证明。

> 开始编译构建，运行测试和安装

```bash
# 首先编译成二进制文件
go run ./build/*.go build

# 安装 go-filecoin 到 ${GOPATH}/bin (在测试之前必须先安装)
go run ./build/*.go install

# 然后运行测试程序.
go run ./build/*.go test

# 当然你也可以编译跟测试一起用一条命名运行
go run ./build/*.go best
```

还有一些其他便捷的构建命令：

```bash
# 检查代码的格式的正确性
go run ./build/*.go lint

# 使用覆盖率报告进行测试
go run ./build/*.go test -cover

# 使用Go的竞争条件检测和警告进行测试（请参阅https://blog.golang.org/race-detector）
go run ./build/*.go test -race

# Deps，Lint，Build，Test 所有命名打包执行
go run ./build/*.go all
```
执行完 `go run ./build/*.go install` 之后，说明已经完成安装。

如果你已经安装了 Filecoin, 只是想更新的话，那就非常简单了：

```bash
cd $GOPATH/src/github.com/filecoin-project/go-filecoin 
git fetch origin devnet-user -f
git checkout devnet-user
FILECOIN_USE_PRECOMPILED_RUST_PROOFS=true go run ./build/*.go deps
go run ./build/*.go build
go run ./build/*.go install
```

本人亲测，更新的时间虽然没有第一次安装那么长，但是大概也需要15-20分钟左右。因为更新的时候虽说不需要下载依赖, 也不需要生成 filecoin-proof-parameters 
文件，但是它还是需要去检查一下每个依赖包是否有更新，加上翻墙的网速实在不算快，所以这个过程没有自己想象的那么短。

# 开始运行 Filecoin

1.如果你之前有运行过 go-filecoin，那你需要先删除现有 Filecoin 初始化数据：

```bash
rm -f ~/.filecoin 
```

2.初始化 Filecoin, 使用 --devnet-user 参数连接到测试主网，--genesisfile 指定获取初始化数据的地址 

```bash
go-filecoin init --devnet-user --genesisfile=http://user.kittyhawk.wtf:8020/genesis.car 
```

3.启动 go-filecoin 守护进程

```bash
go-filecoin daemon
```

运行之后当前终端是阻塞的，你不能在运行其他命令，你可以使用 `Ctrl + C` 命令结束进程。当然你可以可以选择在后台运行 Filecoin：

```bash
go-filecoin daemon > filecoin.log &
```

然后你可以使用 `tail` 命令去输出实时日志

```bash
tail -f filecoin.log
```

启动成功之后应该会返回类似 "My peer ID is {peerID}", 其中 {peerID} 是以 "Qm" 开头的长 CID 字符串.

注意：第一次启动守护进程的时候可能会慢，filecoin 节点需要于 /tmp/filecoin-proof-parameters 参数文件进行校验。这个文件就是我们在执行 `deps` 的时候
生成的，如果这些文件丢失或者不下心被删除的话，下次启动 Filecoin 的时候将会被重新创建。重建将会花费接近一个小时的时间，当然，开发人员正在寻找更好的
解决方案。

另外：如果你是开发人员并且希望连接到 nightly devnet (轻节点网络) 而不是 user devnet，则必须将节点配置为使用 small sectors(小扇区)，
并使用 [devnet-nightly tag](https://github.com/filecoin-project/go-filecoin/tree/devnet-nightly) 进行构建。

构建并安装完成之后使用下面的命令启动守护进程：

```bash
env FIL_USE_SMALL_SECTORS=true go-filecoin daemon
```

4.检查你的连接

```bash
go-filecoin swarm peers   # 列出跟你连接的所有节点

# 输出结果
/ip4/104.36.201.250/tcp/6000/ipfs/QmbHGymRX9HbDXksYpZVaeqUzKBWVdsu92VkLLe4fBQ4sA
/ip4/106.39.105.178/tcp/6000/ipfs/QmZVyRnEkB4z9S9pZh1hXf2DXEARHd88ZsUJfyW873432B
/ip4/110.182.86.161/tcp/6000/ipfs/Qma3F4jxaYk7ghgx1sL32HxFn29vAQEEkSYMTXJ3nLjwHe
/ip4/111.19.129.161/tcp/6000/ipfs/QmfT6pr6pGLmPZ1GpiWoH9ryDRu9J5H8H9eWJgTsRfDAwa
/ip4/111.19.129.164/tcp/6000/ipfs/QmRLPgNBfPqJUDTGGUfYriueE5WT976oxnm1X3XTQchZAX
/ip4/111.19.129.165/tcp/6000/ipfs/QmUkH9Co3sWnUMAYRky3HH561bb23uGirw8ZpYcmqCxRqy
/ip4/111.19.129.166/tcp/6000/ipfs/QmRMFT5q5bptCiqjeeg8AGNNNhZ5VCUv2FTQEnB9A4ES44
/ip4/113.118.45.103/tcp/2288/ipfs/QmRPVM97zVGWXt5ewvSWvEnXQEKE7PA9dCCS79QVbem4ZF
/ip4/113.118.45.103/tcp/2292/ipfs/QmfGUgVv9cNs2QiAwgAgmQb6LPg8ugLZfeFTMW74LBVBUn
/ip4/113.118.45.103/tcp/2293/ipfs/QmXZbw4vcFJSZp1hRgPeoyf8zgyDsVx9y2NNfw5enD35Wt
/ip4/113.118.45.103/tcp/2297/ipfs/QmRgkfCVi8r2p16JKF3afZpEjdpQwxiMzA3vPqz66dB5Gb
/ip4/113.118.45.103/tcp/2299/ipfs/QmReHLjniggoW8kCh2qk79o1uPzpeGFShaMBpUrAf2EY1d

```
每一行的最后面一项是节点的 ID，你可以使用 `go-filecoin ping` 命令直接测试你跟某个节点的连接情况

```bash
go-filecoin ping QmbHGymRX9HbDXksYpZVaeqUzKBWVdsu92VkLLe4fBQ4sA
```
<img class="img-view" data-src="http://blog.img.r9it.com/image-7354c2b8532e89bdc5eb9e86176ee56f.png" src="/images/1px.png" />

上图显示了节点的返回，这其实与你直接用系统的 ping 命令去测试某个 IP 地址与你的通信状况类似。

至此，恭喜你，你已经成功的运行了一个 Filecoin 节点。下面是一个节点的基本结构：

<img class="img-view" data-src="http://blog.img.r9it.com/image-86ceba62c563342b61d17123ad8d647f.png" src="/images/1px.png" />

节点运行之后会自动创建一个账号和一个钱包，并立刻验证并同步测试网络上已经生成的区块，
这个时候你会发现你的 CPU 正在满负荷工作(使用 `top` 命令查看):

<img class="img-view" data-src="http://blog.img.r9it.com/image-627190a86b48b176f6a52e3890ee5026.png" src="/images/1px.png" />

# 给你的节点自定义名称
默认情况下，节点昵称跟节点 ID 相同，是一个 46 的长字符串，Filecoin 允许你给它配置一个人性化的可读的名字。

你打开一个新终端执行：

```bash
go-filecoin config heartbeat.nickname "xjxhRock"
```

新名称立即生效，无需重启。你可以使用以下命令检查配置的名称：

```bash
go-filecoin config heartbeat.nickname
```

不过需要注意的是: __昵称只能包含字母字符（没有数字，空格或其他特殊字符）__


# 激活节点，加入网络统计

Filecoin 官方提供了一些可视化工具来让你更直观的了解 Filecoin 网络上发生的事情：
[网络统计](https://stats.kittyhawk.wtf/) 和 [区块浏览器](http://user.kittyhawk.wtf:8000/)。

<img class="img-view" data-src="http://blog.img.r9it.com/image-adb099f845e37960d64ffc6b1ed50ad2.png" src="/images/1px.png" />

要在网络统计信息中查看到你的节点，你需要选择流式传输节点的日志。通过执行以下脚本实现:

```bash
go-filecoin config heartbeat.beatTarget "/dns4/stats-infra.kittyhawk.wtf/tcp/8080/ipfs/QmUWmZnpZb6xFryNDeNU7KcJ1Af5oHy7fB9npU67sseEjR"
```

重新启动当前运行的 go-filecoin 守护进程，然后就可以在 [Network Stats](https://stats.kittyhawk.wtf/) 观察你的节点与网络的其他节点达成共识。

<img class="img-view" data-src="http://blog.img.r9it.com/image-0854e94e9870515770b5b61a91948c39.jpeg" src="/images/1px.png" />

# 获取 Filecoin 测试代币(Mock FIL)

在 Filecoin 节点可以参与市场之前，他们需要一些初始的 filecoin token (FIL)，矿工需要拿这些 FIL 去抵押，客户需要使用 FIL 发布 ask order.

在早期测试期间，您可以从 Filecoin faucet 免费获取 Mock(虚拟) FIL，我们把 faucet 称之为 "水龙头"。
使用 Mock FIL 可以对市场动态进行初步测试，而无需你付出任何的实际资金。

你可以通过以下步骤轻松获得 Mock FIL (以下所有操作请确保你的 go-filecoin 守护进程是一直运行的):

1.获取你的钱包地址

```bash
go-filecoin wallet addrs ls
```
正常情况下应该返回你的钱包地址，如果你有多个钱包的话，会返回多个地址。钱包地址是一个 41 位的字符串

2.拿到钱包地址之后你可以到官方提供的 [http://user.kittyhawk.wtf:9797](http://user.kittyhawk.wtf:9797) 去提交你的钱包地址，提交成功之后会返回一个
{MESSAGE_CID}，类似业务回执单编号的东西。凭证可以查到你的处理进度。

```
Success! Message CID: zDPWYqFD7zqaPvnfmYy2Zr6xnwXrF4QLusdbmCnBTbyFjKJFBtrz
```

或者你也可以通过命令行去手动提交：

```bash 
export WALLET_ADDR=`go-filecoin wallet addrs ls` # 获取钱包地址
MESSAGE_CID=`curl -X POST -F "target=${WALLET_ADDR}" "http://user.kittyhawk.wtf:9797/tap" | cut -d" " -f4`
echo $MESSAGE_CID=
```

通常情况下，系统会在 30 秒内向你的钱包转入一笔(一般为 1000 枚) FIL。

或者你也可以运行以下命令以等待确认：

```bash
go-filecoin message wait ${MESSAGE_CID}
```

此命令在收到回复之前会一直阻塞，这里有个坑，笔者本来以为 30 秒内能收到 FIL 结果等了大半天，
原因是__需要等你的 Filecoin 同步完所有区块之后你才能查询到这笔转账。__

3.验证是否到账，只需要查询一下你钱包的余额

```bash
go-filecoin wallet balance ${WALLET_ADDR}
```

好了，恭喜！你现在已连接到 Filecoin 并且可以开始在 Filecoin 网络上挖掘或存储数据！

# 参考文献
* [Filecoin install](https://github.com/filecoin-project/go-filecoin/blob/master/README.md)
* [Geting Started](https://github.com/filecoin-project/go-filecoin/wiki/Getting-Started)

# 其他相关文章
* [IPFS系列04-FILECOIN 挖矿](/20190301/minering-filecoin.html)
* [IPFS系列01-IPFS 前世今生](/20180906/ipfs-01-summary.html)
* [IPFS系列02-FILECOIN 工作原理](/20190226/how-filecoin-work.html)
* [区块链技术指南一](/20171218/block-chain-1.html)
* [区块链技术指南二](/20171218/block-chain-2.html)


