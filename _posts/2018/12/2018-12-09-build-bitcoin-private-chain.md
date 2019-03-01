---
layout: post
title: 搭建比特币私有链开发环境
categories: [区块链]
tags: [比特币]
status: publish
type: post
published: true
author: blackfox
permalink: /20181209/build-bitcoin-private-chain.html
keyword: 比特币,私有链开发环境
desc:  搭建比特币私有链开发环境
---
最近因为在折腾了一下比特币的钱包功能相关开发工作，搭建环境的时候遇到了一些坑，因此记录下来，以备不时之需。

在比特币的大系统里存在三个独立的网络链系统：比特币主链系统、测试链系统、回归测试链系统。
主链系统就是生产环境正在跑的网络，也是矿工工作的网络。测试链系统也是在公共网络跑的节点，只不过节点比较少，仅仅用来线上测试。
回归测试链系统常用来做开发调试使用，也就是这儿所说的“私链”，在这里你所有的操作都只能在本地生效，不会影响线上。

这三个网络系统其实用的是同样的运行程序，只是启动的时候需要配置的参数不一样，这个后面还会提到。

搭建步骤：

* TOC
{:toc}

## 1. 安装依赖
在编译源码之前我们需要先安装依赖，否则在编译源码的时候会有各种错误。我用的是 Ubuntu 18.04 LTS 系统，安装依赖的脚本如下：

```bash
apt-get  install make
apt-get  install gcc
apt-get  install g++

apt-get  install zlib1g-dev
apt-get  install libssl-dev
apt-get  install build-essential
apt-get  install libminiupnpc-dev
apt-get  install autoconf

apt-get  install libdb5.3++-dev
apt-get  install qt4-dev-tools qt4-doc qt4-qtconfig qt4-demos qt4-designer
apt-get  install libboost-all-dev
apt-get  install gcc-multilib

apt-get  install libprotobuf-dev
apt-get  install libevent-dev
apt-get  install protobuf-compiler
```
比特币的区块存储需要依赖 Berkeley DB 4.8 , 所以还需要安装 Berkeley DB

```bash
wget http://download.oracle.com/berkeley-db/db-4.8.30.tar.gz
tar xvpzf db-4.8.30.tar.gz
cd db-4.8.30/build_unix
../dist/configure --enable-cxx
make -j8
sudo make install
```

安装玩之后记得要导出环境路径，否则编译器不知道去哪个目录找相关的类库 
默认安装路径是/usr/local/BerkeleyDB.4.8 

```bash
export BDB_CFLAGS=/usr/local/BerkeleyDB.4.8/
```

## 2. 编译安装比特币源码
首先需要去比特币的 github 仓库下载源代码 

```bash
git clone https://github.com/bitcoin/bitcoin.git
```
这里需要注意的是，clone 完代码之后，你需要 checkout 到你需要编译的安装的代码分之，比如我想要编译的是版本是 0.17, 所以我就需要把代码版本切换到 0.17 

```bash
git checkout 0.17
```

接下来就是配置(检查依赖)，编译，安装:

```bash
./configure --prefix=/usr/local/bitcoin --enable-wallet

make && sudo make install
```

--prefix 是配置安装的路径，--enable-wallet 表示启用钱包功能

C++ 的编译速度有点慢，源代码又有点多，所以建议在中午下班的时候开始编译，然后你下楼去吃顿饭回来就差不多编译完成了，不会有等待的痛感。

安装完成之后，还需要把相关的可执行文件添加到环境路径。这里我们创建软链接就好了。

```bash
sudo ln -s /usr/local/bitcoin/bin/bitcoind /usr/local/bin/bitcoind  
sudo ln -s /usr/local/bitcoin/bin/bitcoin-cli /usr/local/bin/bitcoin-cli  
```

## 3. 启动节点

上面我们说了，比特有三个网络，主网，测试网，本地网络，下面我们就分别说下如何启动这三个网络

> 启动主网节点： `bitcoind -daemon` 启动后会通过内置的地址去寻找其他节点。

> 启动测试网节点：`bitcoind -testnet -daemon` 启动后，它也会根据内置其他节点地址去P2P学习链接其他节点。

> 启动本地私有节点：`bitcoind -regtest -daemon` 启动后，它是一个本地私有节点，不会同步数据。

不过一般我们在启动节点的时候，还会指定一些其他参数，比如端口，区块数据存储地址，rpc 用户名密码等。所以一个标准的启动脚本应该是这样的

```bash
bitcoind -testnet -datadir=/data/bitcoin/ -rpcuser=user -rpcpassword=password -rpcport=8332 -daemon
```

当然你还可以设置很多其他参数，下面是 bitcoind 的可选参数：

__常规选项__

```
 -conf=<文件名>     指定配置文件（默认：bitcoin.conf）
  -pid=<文件名>      指定 pid （进程 ID）文件（默认：bitcoind.pid）
  -gen               生成比特币
  -gen=0             不生成比特币
  -min               启动时最小化
  -splash            启动时显示启动屏幕（默认：1）
  -datadir=<目录名>  指定数据目录
  -dbcache=       设置数据库缓存大小，单位为兆字节（MB）（默认：25）
  -dblogsize=     设置数据库磁盘日志大小，单位为兆字节（MB）（默认：100）
  -timeout=       设置连接超时，单位为毫秒
  -proxy=   通过 Socks4 代理链接
  -dns               addnode 允许查询 DNS 并连接
  -port=<端口>       监听 <端口> 上的连接（默认：8333，测试网络 testnet：18333）
  -maxconnections=  最多维护 个节点连接（默认：125）
  -addnode=      添加一个节点以供连接，并尝试保持与该节点的连接
  -connect=      仅连接到这里指定的节点
  -irc               使用 IRC（因特网中继聊天）查找节点（默认：0）
  -listen            接受来自外部的连接（默认：1）
  -dnsseed           使用 DNS 查找节点（默认：1）
  -banscore=      与行为异常节点断开连接的临界值（默认：100）
  -bantime=       重新允许行为异常节点连接所间隔的秒数（默认：86400）
  -maxreceivebuffer=  最大每连接接收缓存，*1000 字节（默认：10000）
  -maxsendbuffer=  最大每连接发送缓存，*1000 字节（默认：10000）
  -upnp              使用全局即插即用（UPNP）映射监听端口（默认：0）
  -detachdb          分离货币块和地址数据库。会增加客户端关闭时间（默认：0）
  -paytxfee=    您发送的交易每 KB 字节的手续费
  -testnet           使用测试网络
  -debug             输出额外的调试信息
  -logtimestamps     调试信息前添加时间戳
  -printtoconsole    发送跟踪/调试信息到控制台而不是 debug.log 文件
  -printtodebugger   发送跟踪/调试信息到调试器
  -rpcuser=<用户名>  JSON-RPC 连接使用的用户名
  -rpcpassword=<密码>  JSON-RPC 连接使用的密码
  -rpcport=    JSON-RPC 连接所监听的 <端口>（默认：8332）
  -rpcallowip=   允许来自指定 地址的 JSON-RPC 连接
  -rpcconnect=   发送命令到运行在 地址的节点（默认：127.0.0.1）
  -blocknotify=<命令> 当最好的货币块改变时执行命令（命令中的 %s 会被替换为货币块哈希值）
  -upgradewallet     将钱包升级到最新的格式
  -keypool=       将密匙池的尺寸设置为 （默认：100）
  -rescan            重新扫描货币块链以查找钱包丢失的交易
  -checkblocks=   启动时检查多少货币块（默认：2500，0 表示全部）
  -checklevel=    货币块验证的级别（0-6，默认：1）
```

__SSL 选项__

```bash
-rpcssl                                  使用 OpenSSL（https）JSON-RPC 连接
-rpcsslcertificatechainfile=<文件.cert>  服务器证书文件（默认：server.cert）
-rpcsslprivatekeyfile=<文件.pem>         服务器私匙文件（默认：server.pem）
-rpcsslciphers=<密码>                    可接受的密码（默认：TLSv1+HIGH:!SSLv2:!aNULL:!eNULL:!AH:!3DES:@STRENGTH）
```

## 4. 测试节点

通过"bitcoin-cli"执行系统相关命令，需要注意的是在执行 bitcoin-cli 时同样需要加上指定的数据路径，-rpcuser -rpcpassword 等参数，比如：

创建地址

```bash
bitcoin-cli -regtest -datadir=/data/bitcoin -rpcuser=user -rpcpassword=password -rpcport=8332 getnewaddress
2NDCCiQ2vYhW74pazBGhFzT6oAz539ZrhAS
```
如果感觉每次要输入这么长的命令很麻烦的话，可以在 /usr/local/bin 下新建脚本 bitcoin-cli(如果原来有软链接的话就删除)

```bash
#!/bin/bash 

/usr/local/bitcoin/bin/bitcoin-cli -regtest -datadir=/data/bitcoin -rpcuser=user -rpcpassword=password -rpcport=8332 getnewaddress
```

然后你就可以直接使用 bitcoin-cli {method} {params} 的方式调用 RPC 接口了。

给上面创建地址生成区块

```bash
bitcoin-cli generatetoaddress 101 2NDCCiQ2vYhW74pazBGhFzT6oAz539ZrhAS
```

这里为什么生成 101 个区块是因为回归测试模式中，__前100个块是拿不到 BTC 的，需要生成第101个块的时候才有BTC.__

查询钱包余额

```bash
bitcoin-cli getbalance
50.00000000
```

查看钱包信息

```bash
bitcoin-cli getwalletinfo
{
  "walletname": "",
  "walletversion": 169900,
  "balance": 50.00000000,
  "unconfirmed_balance": 0.00000000,
  "immature_balance": 5000.00000000,
  "txcount": 202,
  "keypoololdest": 1544106013,
  "keypoolsize": 1000,
  "keypoolsize_hd_internal": 1000,
  "paytxfee": 0.00000000,
  "hdseedid": "96294a6a3428d2501099326a31b9ebe46519b691",
  "hdmasterkeyid": "96294a6a3428d2501099326a31b9ebe46519b691",
  "private_keys_enabled": true
}
```

关键参数解释：

> `balance` 钱包中以 BTC 为单位已确认的总余额 <br />
`unconfirmed_balance` 钱包中以 BTC 为单位未确认的总余额 <br />
`immature_balance` 钱包中以 BTC 为单位未成熟的总余额

可以看到，前面生成的 100 个区块的奖励都是在 `immature_balance` 也就是在未成熟的余额当中。

最后，贴上一个比特币官方的 RPC API 文档地址

[https://bitcoin.org/en/developer-reference](https://bitcoin.org/en/developer-reference)



