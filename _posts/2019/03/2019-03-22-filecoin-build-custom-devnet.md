---
layout: post
title: Filecoin 系列06-构建自己的 devnet 开发网络
categories: [IPFS, Filecoin]
tags: [区块链, Filecoin, IPFS]
status: publish
type: post
published: true
author: blackfox
permalink: /20190322/build-custom-devnet.html
keyword: 构建 Filecoin 开发网络, 搭建 Filecoin 私有链
desc: 如何使用 Filecoin 搭建自己的去中心化存储网络
---

这里是 Filecoin 系列文章的第六篇，今天我们继续学习如何搭建自己的开发网络(`custom devnet`)

文章导读：

* TOC
{:toc}

# 现有开发者网络

我们知道目前官方提供了三个 Filecoin 开发者网络，便于给不同层级的开发者进行开发和测试，他们分别是：

## devnet-user
目前，这是默认使用的网络，用于测试和试验。需要用户从主节点手动部署节点, 我们之前有篇文章介绍
[Filecoin 系列03-加入 Filecoin 测试网络挖矿](/20190302/minering-filecoin.html)连接的就是这个网络。

## devnet-nightly
构建网络，专门为开发人员准备的，需要从 `devnet-nightly` 标签下构建， 并且在启动的时候必须将节点配置为使用 small sectors(小扇区)，这个网络同步的速度会快一些。
每天 06:00 由 CI 从主节点部署，官方提示你应该尽量避免接入这个网络。

```bash
env FIL_USE_SMALL_SECTORS=true go-filecoin daemon
```

## devnet-test
这是专门为 `Infra` 开发人员部署的网络，一般从 `redeploy_test_devnet` 标签构建，所以如果你是一般开发人员或者是普通用户，你也应该避免使用这个网络。

# 搭建自己的开发网络

既然官方都有这么多开发网络了，为毛我们还要构建自己的开发网络？我觉得理由有三：
1. 官方的测试网络一来同步太慢，现在才只有 6w 多个区块，同步一个节点就随随便便花费你一个星期的时间，想测试一下太耗费时间了，码农等不起。
2. 基于【理由1】想部署一条山寨 Filecoin 给国内有需要的同学测试。
3. 就是想折腾一下玩玩，不行么！

废话不多说，直接上操作步骤。

### 1. 搭建主节点(种子节点)

我们需要重新编译 Filecoin， 为了能够清晰的看到整个 Filecoin 从同步数据，挖矿，创建矿工，发布订单到接单的整个流程，建议开启 Debug 模式。
修改方法很简单，在 `go-filecoin` 根目录下的 `main.go` 第 22 行改为 `n = 5`

```go
// TODO fix this in go-log 4 == INFO
n, err := strconv.Atoi(os.Getenv("GO_FILECOIN_LOG_LEVEL"))
if err != nil {
	n = 5
}
```
然后重新 `build`

```bash
go run ./build/*.go build
```
然后就可以搭建主节点了，如果你之前有运行过 `go-filecoin` 节点的话，需要把 `.filecoin` 移除或者备份。

```bash
mv ~/.filecoin filecoin-bak
```
先初始化节点，这里需要用我们刚刚编译的时候生成的 genesisfile, 并且移除 `--devnet-user` flag

```bash
$ ./go-filecoin init --genesisfile=./fixtures/genesis.car
$ ./go-filecoin daemon
```

我们编译的时候程序给我们生成了 5 个初始地址，并为每个地址分配了 `1000000000000` 个 FIL 币，如果你觉得不够你挥霍，
你还可以改大一些，在 `fixtures/setup.json` 中。

```javascript
{
  "keys": 5,
  "preAlloc": [
    "1000000000000",
    "1000000000000",
    "1000000000000",
    "1000000000000",
    "1000000000000"
  ],
  "miners": [{
    "owner": 0,
    "power": 1
  }]
}
```
然后我们开始导入初始地址，并设置矿工：

```bash
$ mineraddr=$(jq -r '.Miners[0].Address' ./fixtures/gen.json)
$ peerid=$(./go-filecoin --enc=json id | jq -r '.ID')
$ ./go-filecoin config mining.minerAddress $mineraddr
$ walletaddr=$(./go-filecoin --enc=json wallet import ./fixtures/0.key | jq -r '.Addresses[0]')
$ ./go-filecoin config wallet.defaultAddress $walletaddr
$ ./go-filecoin miner update-peerid --from $walletaddr --gas-price 0 --gas-limit=300 $mineraddr $peerid
```

启动挖矿，查询余额

```bash
$ ./go-filecoin mining start
$ ./go-filecoin wallet balance $walletaddr
```

这时你应该会看到你的钱包里面已经有巨额资金了。一个创世节点就搭建起来了，同时你应该可以在控制台看到很详细的日志输出。网络默认是 30 秒出一个区块，区块的信息也会在控制台详细打印输出。

接下我们还需要做两件事情：

#### 1. 搭建 faucet 服务
首先我们需要在主节点搭建一个水龙头服务(faucet)，以便其他节点可以到水龙头去申请测试代币。faucet 启动程序在 `tools/faucet` 目录下：

```bash
./tools/faucet/faucet -faucet-val=500 -fil-wallet ${walletaddr} -limiter-expiry 0h0m10s
```
服务器启动成功之后，使用浏览器访问 `http://localhost:9797` 就能看到熟悉的 faucet 页面了

![](/images/1px.png){:class="img-view" data-src="http://blog.img.r9it.com/image-fc35ebe3bc0ee992402ac03b3629fbad.png"}

#### 2. 搭建 genesisfile.car 下载服务
这个也是从节点初始化的时候所必须的服务，在 devnet-user 网络我们都是用 `http://user.kittyhawk.wtf:8020/genesis.car`，现在因为我们需要用我们自己搭建网络的
`genesis.car`, 所以我们也需要搭建这样一个服务。 genesis-file-server 服务程序同样在 `tools` 目录下。

```bash
./tools/genesis-file-server/genesis-file-server --port 8020
```
genesis-file-server 启动成功之后我们就可以开始搭建从节点了，监听的端口是 8020.

### 2. 搭建从节点

Note: 其实理论来说，没有主从节点的说法，都是对等节点，这里只是为了便于大家理解，给个标记而已。
搭建从节点就非常简单了，首先我们需要把刚刚在主节点构建生成的 `go-filecoin` 文件拷贝到需要搭建从节点的机器上，然后执行初始化脚本：

```bash
./go-filecoin init --genesisfile=http://192.168.0.110:8020/genesis.car
```
这里的 192.168.0.110 是我的主节点的 IP，所以这里你需要换成你的 ip 或域名。

![](/images/1px.png){:class="img-view" data-src="http://blog.img.r9it.com/image-67f5386c85d17b3bc46de0e6705683b9.png"}

然后启动守护进程，启动之后由于是内部网络，你会发现区块数据同步很快。

```bash
./go-filecoin daemon
```

### 3. 连接到主节点
接下来我们只需要将所有的从节点都连接上主节点，整个网络就搭建完成了。

首先在主节点上运行 `go-filecoin id` 获取主节点网络地址：

```javascript
{
	"Addresses": [
		"/ip4/127.0.0.1/tcp/6000/ipfs/QmQvUmeB2jtFWJEmCe5LXyDmRzToJkDDzC6eK9oWvfspzM",
		"/ip4/192.168.0.110/tcp/6000/ipfs/QmQvUmeB2jtFWJEmCe5LXyDmRzToJkDDzC6eK9oWvfspzM",
		"/ip4/172.17.0.1/tcp/6000/ipfs/QmQvUmeB2jtFWJEmCe5LXyDmRzToJkDDzC6eK9oWvfspzM",
		"/ip4/192.168.56.1/tcp/6000/ipfs/QmQvUmeB2jtFWJEmCe5LXyDmRzToJkDDzC6eK9oWvfspzM"
	],
	"ID": "QmQvUmeB2jtFWJEmCe5LXyDmRzToJkDDzC6eK9oWvfspzM"
}
```

连接主节点

```bash
./go-filecoin swarm connect /ip4/192.168.0.110/tcp/6000/ipfs/QmQvUmeB2jtFWJEmCe5LXyDmRzToJkDDzC6eK9oWvfspzM
```

> Note: 这里每次重新启动从节点的时候都需要重新使用 `swarm` 命令去连接主节点同步数据，当然你也可以通过更改节点的配置文档来让节点在每次启动的时候自动连接主节点同步数据

打开节点配置文档 `vim ~/.filecoin/config.json`, （如果你在启动 daemon 的时候更改了  `--repodir` 参数，请替换成你的真实配置文档地址）

修改 `bootstrap.addresses` 配置：

```bash
"bootstrap": {
	"addresses": [
		"/ip4/192.168.0.110/tcp/6000/ipfs/QmQvUmeB2jtFWJEmCe5LXyDmRzToJkDDzC6eK9oWvfspzM"
	],
	"minPeerThreshold": 1,
	"period": "10s"
}

```

### 3. 测试

测试之前先为每个从节点申请测试 FIL，先查看钱包地址:

```bash
./go-filecoin address ls
```
访问 faucet 地址，填入自己的钱包地址，申请代币（每个地址每隔 10 秒钟可以申请一次），提交之后你可以在主节点的终端看到调试信息，表示收到充值请求，如下图所示。

<img class="img-view" data-src="http://blog.img.r9it.com/image-5da29e7aed1ec74073b0936a9c489724.png" src="/images/1px.png" />

接下来，有了测试 FIL 之后就可以在各自的节点上测试创建矿工，发布订单，存储数据等操作了。这些操作我们之前的系列文章都有详细的操作介绍，这里就不赘述了，大家尽情玩耍吧。

测坏了之后再重建一个就好了，反正数据很少，很快就同步完了。

# 你可能需要阅读的文章
[Filecoin 系列03-加入 Filecoin 测试网络挖矿](/20190302/minering-filecoin.html)

[Filecoin 系列04-存储数据到 Filecoin 网络](/20190304/storing-on-filecoin.html)

# 参考文献
[Devnets](https://github.com/filecoin-project/go-filecoin/wiki/Devnets){:target='_blank'}
