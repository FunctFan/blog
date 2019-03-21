---
layout: post
title: Filecon 系列05-复制游戏(Replication-Game)
categories: [IPFS,区块链]
tags: [IPFS,区块链,Filecoin]
status: publish
type: post
published: true
author: blackfox
permalink: /20190606/filecoin-replication-game.html
keyword: 复制游戏, Filecoin, IPFS, 复制证明
desc: Filecoin 复制证明游戏
---

本文介绍如何参与 Filecoin 官方发起的 Replication-Game(复制游戏)。


文章导读：

* TOC
{:toc}


# 游戏介绍

![](/images/1px.png){:data-src="http://blog.img.r9it.com/image-718c13784919269075f89feeb7d57d4c.gif" class="img-view"}

复制游戏是一项复制竞赛，参与者挑战 Filecoin 官方提供的默认的复制证明算法，看是否能够提供更优(相对于默认算法)的算法或执行结果。

参与游戏的方法是：通过运行当前 Filecoin 提供的复制算法(或者是你自己的实现)，并将执行结果发送到 Filecoin 服务器。

## 什么是复制证明？

这个我们在之前的文章 [IPFS 系列02-Filecon 工作原理](/20190226/how-filecoin-work.html#复制证明) 中简单的介绍过，
这里补充说明下，所谓的复制证明就是为了确保：

1. Filecoin 存储市场是安全的：它确保矿工不会在没有存储数据的情况下谎称自己存储了用户的数据
2. Filecoin 区块链是安全的：它确保矿工不会对他们拥有的存储空间撒谎，矿工凭借他们的存储能力争夺出块资格。
Filecoin 在挖矿过程打包数据时使用复制证明。

## 复制证明是如何工作的？

官方对于复制证明的原理解释是：来自 Filecoin 市场的数据通过无法并行化的慢速顺序计算进行编码。

这个解释可能让很多同学一脸懵逼，感觉还是不知道它是怎么工作的。 我这里简单把它掰开来了解释一下：

1. 让矿工把它存储的用户的数据按照某种算法重新编码，生成一个证明文件发送给 Filecoin 存储市场验证（验证成功存入区块链）
2. 这种编码的算法无法并行化，也就是说不能把整个编码差拆分成多个任务，然后并行处理，必须按照某个顺序串行处理（这样整个编码的过程就比较慢）。

## 怎样才能在排行榜上排名靠前？

有两种方法可以让你快速爬上排行榜：

> 1. __进行硬件和软件优化：__ 你可以增加你的硬件配置，使用更快的 CPU 更大的内存(RAM)，或者使用其他的替换方案比如使用 FPGA, GPU, ASICs 等更擅长
进行深度计算的硬件。另外你可以优化你操作系统的一些参数设置，比如 IO 参数等。
2. __进行算法优化：__ 你可以不使用 Filecoin 给你提供的默认实现算法，自己设计一种新的能够更快生成存储证明的算法，比如打破顺序假设，
生成存储更少数据的证明，打破 Pedersen 哈希等。__如果你真能做到这些，那么恭喜你，你的名字将会被密码学载入史册，从此名垂不朽。__

# 开始游戏

这将执行一个真实的游戏，使用 `rust-proofs` 开发，你可以很方便实现你自己的版本。

## 编译游戏二进制文件

编译游戏之前先要安装下面依赖:

* [rustup](https://www.rust-lang.org/tools/install){:target="_blank"}
* Rust nightly (执行 `rustup install nightly` 安装)
* [PostgreSQL](https://www.postgresql.org/) 数据库，如果你需要自己搭建游戏后端服务器的话，就需要安装. ubuntu 安装教程在
[这里](https://www.postgresql.org/download/linux/ubuntu/)
* Clang and libclang (C++ 编译环境)
* jq (可选安装) - 一个美化 json 数据的命令行工具，查看排行榜使用

切换到到 `replication-game` 根目录，使用下面的命令去编译游戏的二进制文件

```bash
cargo +nightly build --release --bin replication-game
```

我使用的是 Ubuntu 系统，在编译的时候碰到这个错误：

```bash
 = note: /usr/bin/ld: cannot find -lpq
          collect2: error: ld returned 1 exit status
```

找不到 `pq` 库，解决方法是： 如果你系统本身安装了 `pq` 库，那么创建一个软链接就可以了。

```bash
sudo ln -s /usr/lib/x86_64-linux-gnu/libpq.so.5 /usr/lib/libpq.so
```

否则需要安装 `libpq-dev`

```bash
sudo apt-get install libpq-dev
```

## 启动游戏

有两种方式开始复制游戏。

### 方法 1: 运行 `play` 脚本

编译完成之后，会在 `bin/` 目录下生成一个 `play` 文件，直接执行：

```bash
bin/play NAME SIZE TYPE
```
* NAME: 你的游戏玩家名称
* SIZE: 你打算要复制的文件的大小，单位是 KB
* TYPE: 你想要运行的算法名称(目前可选值有： `zigzag` 和 `drgporep`)

`play` 脚本将自动从游戏服务器下载种子，复制数据，生成证据，然后将该证据发布到游戏服务器。

### 方法 2: 运行每个单独的命令
首先，设置你的名称：

```bash
export REPL_GAME_ID="ReadyPlayerOne"
```
然后，从服务器上获取种子：

```bash
curl https://replication-game.herokuapp.com/api/seed > seed.json
export REPL_GAME_SEED=$(cat seed.json| jq -r '.seed')
export REPL_GAME_TIMESTAMP=$(cat seed.json| jq -r '.timestamp')
```

最后，运行游戏

```bash
./target/release/replication-game \
	--prover $REPL_GAME_ID \
	--seed $REPL_GAME_SEED \
	--timestamp $REPL_GAME_TIMESTAMP \
	--size 10240 \
	zigzag > proof.json
```

**整个过程非常耗费资源，本人在执行的过程中，CPU 和 内存都是在满负荷工作** 下面是本人执行过程中计算机的运行状态：

<img class="img-view" data-src="http://blog.img.r9it.com/image-219c3cc8aa7ccb60f5fede054a7c1b4b.png" src="/images/1px.png" />

我的机器配置为: CPU i5 四核，RAM 16GB。**从图上可以看出仅仅 replication-game 一个进程就几乎耗尽了我整个计算机的所有资源！！！**

执行完成之后把结果发送到服务器：

```bash
curl -X POST -H "Content-Type: application/json" -d @./proof.json https://replication-game.herokuapp.com/api/proof
```

## 查看游戏排行榜

有三种方法可以查看排行榜，其中两种来自命令行，另一种来自浏览器：

方法一：直接使用 show-leaderboard 命令来查询

```bash
bin/show-leaderboard SIZE
```
SIZE 用来过滤复制游戏的 SIZE 参数，游戏有很多个排行榜，分不同的量级，从 1KB 到 10GB 不等。同一量级的还有不同算法的排行榜。

方法二：利用游戏服务器开放的 API 来查询

```bash
curl https://replication-game.herokuapp.com/api/leaderboard | jq
```

方法三： 直接通过浏览器打开官方排名网站 [https://replication-game.herokuapp.com/](https://replication-game.herokuapp.com/){:target="_blank"}

下面贴上本人的运行结果(我的游戏名称是: xjxh.io)：

<img class="img-view" data-src="http://blog.img.r9it.com/image-a443577e637e9febd53d7028fb9a3d0e.png" src="/images/1px.png" />

<img class="img-view" data-src="http://blog.img.r9it.com/image-5d364dbfdebb2ca541d181d9aee195a0.png" src="/images/1px.png" />

# 搭建复制游戏服务器

搭建游戏服务器需要 Postgresql 才能正常工作。

```bash
cargo +nightly run --bin replication-game-server
```

游戏服务器主要有三个 API：

* GET /api/seed: 获取游戏种子文件
* POST /api/proof: 上传复制证明结果
* GET /api/leaderboard: 获取排行榜
