---
layout: post
title: Filecoin 系列08-开始 Lotus 挖矿
categories: [Filecoin]
tags: [Lotus]
status: publish
type: post
published: true
author: blackfox
permalink: /20191020/start-mining-lotus.html
keyword: Lotus 挖矿, Filecoin, Filecoin 的另一个实现版本
desc: 分布式存储网络 Lotus 挖矿踩坑实录, 一篇文章带你彻底搞懂 Lotus 挖矿
---

<div class="custom-block tip">
	<p>如果人们不相信数学是简单的，那是因为他们还没有意识到生命有多复杂。<strong>（约翰·冯·诺依曼）</strong></p>
</div>

假如你想通过一篇文章全方位的搞懂 `Lotus` 挖矿，那么本文将是你目前的不二选择。

* TOC
{:toc}

# Lotus 是什么

按照官方的说法，Lotus 是 Filecoin 分布式存储网络的实验性实现。也就是说 Lotus 是 Filecoin 规范的另一个实现，跟 go-filecoin 项目类似，
它也实现了钱包，矿工，存储证明，时空证明(PoST)，数据存储，检索等等一系列的功能。
只不过 Lotus 是 Filecoin 规范的简单实现，而 `go-filecoin` 是一个更完整的实现。

那什么是 Filecoin 规范呢？简单的说就是白皮书里面提到的那个
构建 DSN 网络的 Filecoin 协议，协议里面写明了如何实现一个全球性的分布式存储网络，把全球的闲置存储空间利用起来。

想要更详细的了解协议的具体内容，请异步 [Filecoin 协议规范](https://github.com/filecoin-project/specs)，由于篇幅的原因这里不做过多的阐述。

# 构建（编译）和安装
Lotus 构建的步骤也跟 Filecoin 极其相似

1、安装 Go 1.13 以上的版本

这个具体安装过程请参考我之前的文章的 [Filecoin 系列02-搭建 Filecoin 挖矿节点](/20190227/getstart-with-filecoin.html)

2、安装依赖软件库

```bash
sudo apt-get install bzr pkg-config gcc git jq
```

3、克隆项目到本地，并切换到项目根目录

```bash
$ git clone https://github.com/filecoin-project/lotus.git
$ cd lotus/
```

4、编译源代码，并安装到本地

```bash
$ make
$ sudo make install
```

> 整个过程时间可能有点长，因为需要从 Github 下载很多依赖组件，国内访问 AWS Cloud 空间都很慢的，至于原因大家都懂得。
笔者在编译的过程中运气有点差，因为网速太慢，尝试了好几次都因为依赖下载失败导致编译不成功。
这个时候你有两种解决方案，第一种方案当然是上梯子了，这种方式简单粗暴，但是不是我们这种良民所推荐的做法，有风险。
笔者想到一绝招：**既然山不过来，那我就过去。**我把编译环境搭建在我的香港服务器上，编译完成之后把编译好的可执行文件拷贝到本地就 OK 了。

5、节点安装和配置

如果你是初次运行 Lotus 的话，你就不必进行任何初始化和配置，因为当前 Lotus 构建版本默认使用 `build` 目录中的创世区块和
引导文件自动加入 Lotus 开发网络。

但是如果你之前有运行过 Lotus, 请执行下面的清理脚本：

```bash
rm -rf ~/.lotus ~/.lotusstorage
```

# 启动节点 Daemon

```bash
$ lotus daemon
```

你可以新打开一个终端窗口，检查您是否已连接到网络：

```bash
$ lotus net peers | wc -l
5 # 这里返回的是节点数量
```

接下来你需要等待节点同步数据，你可以通过以下方式跟踪同步状态：

```bash
watch lotus sync status
```

你会看到类似下图的返回信息，其中 `height:` 是当前同步的区块高度。如果同步完成了这个值会编程 0， 你也可以去
[https://lotus-metrics.kittyhawk.wtf/chain](https://lotus-metrics.kittyhawk.wtf/chain) 查看当前开发网络最新区块高度和其他网络指标。

<img src="/images/1px.png" data-src="http://blog.img.r9it.com/image-91f108e40a06e254c14598bd74f5d303.png" class="img-view" alt="" />

这里有一点要提一下的就是，笔者发现开发网络的统计最新区块出块时间指标居然显示的是中文，这个让我有点欣慰，说明 Filecoin 协议实验室
也意识到了大部分矿工都来自中国，我们希望以后整个统计网络的所有指标都用中文显示`O(∩_∩)O`。

<img src="/images/1px.png" data-src="http://blog.img.r9it.com/image-16e8928a94efae225709f0ab361600a2.png" class="img-view" alt="" />

# 获取测试代币，创建矿工

获取测试代币的地址为 [https://lotus-faucet.kittyhawk.wtf/](https://lotus-faucet.kittyhawk.wtf/)

Lotus 获取开发网代币有两种方式，一种是 `[Send Funds]` 这个接口每次请求会给你的钱包地址充值 `0.0000000005` 个测试代币。并且为了防止
薅羊毛，接口请求的次数是有限制的。**每个 IP 每 5 分钟发出一次请求，初始并发次数为5，最大并发数为 20**。具体详细的限制请参考：
[https://github.com/filecoin-project/lotus/pull/384](https://github.com/filecoin-project/lotus/pull/384)

下面我们来看下当前网络创建一个矿工需要抵押多少代币：

```bash
lotus state pledge-collateral
21.719350748900198182
```
21.7 个！！！ 也就是说，如果靠薅羊毛，你就是薅到明年，也不够你创建一个矿工。。。

所以 Lotus 还提供了另外一种申请测试代币的方式：`[Create Miner]`，就是直接申请一笔足够创建矿工的资金，同时帮你创建一个矿工。
这个接口一个地址只能调用一次，每次调用费时大概 5 分钟，一般我们都是直接用这个接口去申请代币。

# 初始化矿工，开始挖矿

创建矿工成功之后，Faucet 页面会返回类似下面的指令。

```bash
lotus-storage-miner init --actor=t0394 -owner=t3qtzwoevzlzzfbnovoj3gf3l62rlhx3elub5otw7oyalmorhgb6o3dfjcoaub5yzp7zoa53ynffgra7he5aja
```

这条命令把矿工相应的信息提交到区块链，如果上链成功的话(这个过程将花费 30-60s)，此命令应成功返回。

下图是执行过程，主要是获取用于生成 `PoSts` 的参数到本地(/var/tmp/filecoin-proof-parameters)。

<img src="/images/1px.png" data-src="http://blog.img.r9it.com/image-559eb9d287d7ae977c13b74d4f957a4d.png" class="img-view" alt="" />

运行矿工，开始挖矿：

```bash
lotus-storage-miner run
```

你可以通过下面的方式查看矿工信息：

```bash
~$ lotus-storage-miner info
Miner: t0394 # 矿工 ID
Power: 0 / 888370369416 (0.00%) # 当前矿工的存储算力
Sealed Sectors:	 0  # 已经密封的扇区
Sealing Sectors:	 0 # 等待密封的扇区
Pending Sectors:	 0 # 正在追加的扇区
Failed Sectors:	 0 # 密封失败的扇区
```

# 存储数据

> 自动存储随机数据

Lotus 允许我们密封一些随机数据以开始生成PoSts，这点如果要在 `go-filecoin` 网络实现的话，需要自己写额外的刷单脚本。

```bash
~$ lotus-storage-miner store-garbage
1
```

返回的是订单的序号，在单一节点是递增的（1,2,3...）。

现在你可以使用矿工 ID 检查矿工存储算力和扇区使用情况：

```bash
# 查看全网算力
$ lotus-storage-miner state power
# 查看指定矿工的算力
$ lotus-storage-miner state power <miner>
# 查看指定矿工的扇区密封状态
$ lotus-storage-miner state sectors <miner>
```

> 存储指定的数据

导入数据到节点

```bash
# 创建一个简单文件
$ echo "Hi my name is $USER" > hello.txt
# 导入数据
$ lotus client import ./hello.txt
bafkreifgxbfutlcrbfnwpk5gx6o5of4mpleqvbkt5thphvbnsg6mnasp3q
# 查看当前节点的所有 <Data CID>
$ lotus client local
bafkreifgxbfutlcrbfnwpk5gx6o5of4mpleqvbkt5thphvbnsg6mnasp3q hello.txt 23 ok
```

查看矿工订单价格

```bash
$ lotus client query-ask t0394
Ask: t0394
Price per Byte: 3
```

发起一笔存储交易

```bash
$ lotus client deal bafkreifgxbfutlcrbfnwpk5gx6o5of4mpleqvbkt5thphvbnsg6mnasp3q t0394 3 10
bafyreibcvxlzzfqgwic3tyuayndgctzszttnnyemlbn4e7us6iimcd3mvi
```

这里笔者发现一个问题，就是这里提交订单成功了，但是我在运行矿工的终端却发现了报错信息：

```bash
2019-10-20T06:52:17.187+0800	INFO	deals	deals/handler.go:165	Deal bafyreibcvxlzzfqgwic3tyuayndgctzszttnnyemlbn4e7us6iimcd3mvi updated state to 2
2019-10-20T06:52:17.196+0800	INFO	deals	deals/handler_states.go:155	waiting for channel message to appear on chain
2019-10-20T06:52:17.217+0800	INFO	deals	deals/handler.go:165	Deal bafyreibcvxlzzfqgwic3tyuayndgctzszttnnyemlbn4e7us6iimcd3mvi updated state to 5
2019-10-20T06:52:17.217+0800	ERROR	deals	deals/handler.go:167	deal bafyreibcvxlzzfqgwic3tyuayndgctzszttnnyemlbn4e7us6iimcd3mvi failed: minimum price: 690
github.com/filecoin-project/lotus/chain/deals.(*Handler).onUpdated
	/var/www/go/src/lotus/chain/deals/handler.go:167
github.com/filecoin-project/lotus/chain/deals.(*Handler).Run.func1
	/var/www/go/src/lotus/chain/deals/handler.go:135
2019-10-20T06:52:17.219+0800	ERROR	deals	deals/handler_utils.go:30	deal bafyreibcvxlzzfqgwic3tyuayndgctzszttnnyemlbn4e7us6iimcd3mvi failed: minimum price: 690
github.com/filecoin-project/lotus/chain/deals.(*Handler).failDeal
	/var/www/go/src/lotus/chain/deals/handler_utils.go:30
github.com/filecoin-project/lotus/chain/deals.(*Handler).onUpdated
	/var/www/go/src/lotus/chain/deals/handler.go:168
github.com/filecoin-project/lotus/chain/deals.(*Handler).Run.func1
	/var/www/go/src/lotus/chain/deals/handler.go:135
```

报错内容大概是交易的 `Price` 值太小了，最小为 690. 但是问题是我上面查询出来的明明是 3 ，既然有最小值怎么订单又是发送成功的。

关于这个问题我在 Lotus 的 GitHub 项目上创建了一个 issue，对这个问题有兴趣的同学可以跟踪一下，地址为:
[https://github.com/filecoin-project/lotus/issues/426](https://github.com/filecoin-project/lotus/issues/426)

如果想知道数据数据密封的进度，再次执行 `lotus-storage-miner info` :

```bash
~$ lotus-storage-miner info
Miner: t0394
Power: 889192448 / 943248642952 (0.00%)
Sealed Sectors:	 63
Sealing Sectors:	 291
Pending Sectors:	 0
Failed Sectors:	 0
```

下面我们简单分析一下 Lotus 挖矿的整个过程，由于 `lotus-storage-miner run` 打印了详细的日志信息，因此我们通过分析日志就可以清晰的知道整个挖矿的流程，具体做了哪些事情。

```bash
2019-10-20T07:06:05.288+0800	INFO	storageminer	storage/miner.go:122	committing sector
2019-10-20T07:08:22.128+0800	WARN	storageminer	storage/post.go:35	PoSts already running 8468
2019-10-20T07:12:50.288+0800	INFO	storageminer	storage/miner.go:122	committing sector
2019-10-20T07:16:03.681+0800	WARN	storageminer	storage/post.go:35	PoSts already running 8468
2019-10-20T07:19:45.438+0800	INFO	storageminer	storage/miner.go:122	committing sector
2019-10-20T07:21:49.554+0800	WARN	storageminer	storage/post.go:35	PoSts already running 8468
2019-10-20T07:21:49.556+0800	INFO	storageminer	storage/post.go:121	running PoSt	{"delayed-by": 0, "chain-random": "hRnfQ1MxjBRgWC99bvtufOEiMxt50/VB5jGOnartsNBVRqlTyGWWdmYcOYgkN8ahCDAh1EtjvvQhJiHn1tawX2JSVIUtc0LOJlSCm6C4ds5IhsCs5OvQfNO6XnBNERaI", "ppe": 8468, "height": 8448}
2019-10-20T07:21:49.558+0800	WARN	storageminer	storage/post.go:35	PoSts already running 8468
2019-10-20T07:24:16.683+0800	INFO	storageminer	storage/post.go:133	submitting PoSt	{"pLen": 192, "elapsed": 147.127304159}
2019-10-20T07:24:16.683+0800	INFO	storageminer	storage/post.go:155	mpush
2019-10-20T07:24:16.704+0800	INFO	storageminer	storage/post.go:162	Waiting for post bafy2bzaced7iklxtorijackxgnnv7kwvgocz473sgcostj2i4ocretlm2z6f6 to appear on chain
...
```

1. 矿工接收到客户端发送过来的数据包之后立即进行封包(sealing) 操作，完成封包之后进行 `committing sector` (提交打包好的 sector)
2. 运行时空证明(`running PoSts`)
3. 请求将 PoSts 上链(`Waiting for post bafxxx to appear on chain`)
4. 上链成功，返回上链区块高度(`"height": 8448`)

下面截图可以让你看到一些更详细的信息

<img src="/images/1px.png" data-src="http://blog.img.r9it.com/image-e5190c44ac9c3eee428f864154bb1dc4.png" class="img-view" />

**而且从日志中我们可以看出，我当前笔记本的封包速度大概是4分钟一个。** 这个速度一般，而且我 8 核的 CPU 资源几乎全被 Lotus 占满了。

<img src="/images/1px.png" data-src="http://blog.img.r9it.com/image-f9eef3c3dc0278ea746892b5b97312bf.png" class="img-view" />

# 搜索与检索

如果您已将数据与矿工存储在网络中，则可以按CID搜索它：

```bash
# 通过 CID 搜索数据
$ lotus client find <Data CID>
LOCAL
RETRIEVAL <miner>@<miner peerId>-<deal funds>-<size>
```

从矿工那里检索数据：

```bash
$ lotus client retrieve <Data CID> <outfile>
# 比如检索我们刚刚存储的数据 
Lotus client retrieve bafkreifgxbfutlcrbfnwpk5gx6o5of4mpleqvbkt5thphvbnsg6mnasp3q hello.txt
```
上面的指令将启动检索交易并将数据写入`hello.txt`。（此过程可能需要一些时间。）


# 总结

总体来说个人觉得 Lotus 的整体挖矿体验比 `go-filecoin` 要好一个档次，可能是因为它是 `轻量级` 实现，整个流程你体验下来不会有卡壳。
所以 Lotus 作为 Filecoin 的备用网络，让我对 Filecoin 网络的健壮性又多了一些信心。

1. Lotus 的 API 完善程度很高，你几乎不用通过统计页面，直接通过命令行工具就可以获取整个网络你想要知道的信息。

2. Lotus 实现了多种扇区大小，因此具有许多不同存储配置的矿工都可以在网络上进行挖矿。我的笔记本之前在测试 `go-filecoin` 的时候每 30 分钟才能完成一个 `sector`，Lotus 只需要 4 分钟。因为 Lotus 扇区
小一些。也正因为如此，你能在很短时间内体验一次整个挖矿流程。

3. Lotus 的存储挖矿功能是作为一个单独的模块(lotus-storage-miner)实现的，因此高级矿工可以根据自己的特定硬件配置优化其挖矿过程(这个后期有时间的话会专门写一篇如何优化)。

4. Lotus 还提供了`Pond UI` 作为CLI的替代，这对于那些不熟悉命令行操作的同学是非常友好的，直接通过图形界面完成上述操作。（如果有必要的话，后期也会专门一篇如何使用 Pond 的教程）。

