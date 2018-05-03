---
layout: post
title: Geth 命令详解
categories: [区块链]
tags: [geth]
status: publish
type: post
published: true
author: blackfox
permalink: /20180503/geth.html
keyword: Geth,以太坊
desc: Geth 命令详解 
---

geth控制台启动和退出
======

最简单的启动方式如下：

```bash
geth console
```
启动成功之后可以看到输入提示符 > 

退出 Geth 控制台也很简单，只要输入 <code class="scode">exit</code> 即可.

geth 日志控制
======
使用geth console启动是，会在当前的交互界面下时不时出现日志。

可以使用以下方式把日志输出到文件。

```bash
geth console 2>>geth.log
```

可以新开一个命令行终端输入以下命令查看日志动态：

```bash
tail -f geth.log
```

#### 重定向另一个终端

也可以把日志重定向到另一个终端，先在想要看日志的终端输入：

```bash
tty
```

就可以获取到终端编号，如：/dev/pts/19

然后另一个终端使用：

```bash
geth console 2>> /dev/pts/19 
```

当然你也可以将日志导入到黑洞，即不输出日志

```bash
geth console 2>> /dev/null 
```

启动一个开发模式测试节点
=========

```bash
geth --datadir /data/testNet --dev console
```

#### 连接geth节点

另外一个启动geth的方法是连接到一个geth节点：

```bash
geth attach ipc:{ipc_file_path} # geth.ipc 文件路径
geth attach http://191.168.1.1:8545 # JSONRPC 的地址
geth attach ws://191.168.1.1:8546
```

如连接刚刚打开的开发模式节点使用：

```bash
geth attach ipc:testNet/geth.ipc
```

启动本地多节点连接集群
=======

在搭建联盟链测试的时候需要在本地启动多个节点，组成一个集群。

先启动一个节点：

```bash
geth --datadir ./data-init1/ --identity "TestNode1" --rpc --rpcapi "db,eth,net,web3" --rpccorsdomain "*" --rpcport 8045 --port 30303 --networkid 88 --nodiscover console
```

不过需要注意的是，这个时候 --datadir, --identity --rpcport --port 这些参数每个节点要配置不同的参数。

比如启动第二个节点：

```bash
geth --datadir ./data-init2/ --identity "TetNode2" --rpc --rpcapi "db,eth,net,web3" --rpccorsdomain "*" --rpcport 8046 --port 30304 --networkid 88 --nodiscover console
```

分别查看节点信息

```bash
> net.peerCount
1
> admin.nodeInfo.enode
"enode://173d7b88d3f2b......@192.168.0.118:30301?discport=0"
```

使用admin.addPeer添加节点，建立连接：

```bash
> admin.addPeer("enode://....")
true 
```

#### admin.startRPC

如果在启动节点的时候忘记开启 RPC 服务，可以通过 admin.startRPC() 工具来开启：

```bash
> admin.startRPC("127.0.0.1", 8545)
true
```
