---
layout: post
title: EOS 创建自己的代币
categories: [EOS,区块链]
tags: [EOS]
status: publish
type: post
published: true
author: blackfox
permalink: /20180917/publish-eos-token.html
keyword: EOS
desc: 发布 EOS 代币
---

本文主要介绍如何在 EOS 区块链上发布自己的代币

### 实验环境

* 操作系统：Ubuntu 16.04 LTS 
* EOS 版本：DAWN-2018-05-30

如果你还没搭建 EOS 开发环境，请先移步这里 [EOS 本地开发环境搭建](/20180612/build-eos-dev-env.html)

下面我们开始一步一步发布自己的代币

> 1.首先创建要创建一对秘钥(key)，key 后面用来创建钱包和账户

```bash
root@6a77f4c6289c:~# cleos create key
Private key: 5Je3D9Ddkz2yw5XLiULGnNH77UD5fsMEYVdSXMDTEZdraSbwPuZ
Public key: EOS72F864zF8FZwkHXjZSFjubJoqxbQehDyQe4og1D55PQooUzXbH
```

> 2.创建钱包

```bash
cleos wallet create -n token 

Creating wallet: token
Save password to use in the future to unlock this wallet.
Without password imported keys will not be retrievable.
"PW5KEPJrcYfm4jEiY4hpdU7apWyFNXUBFr5zMfCw51bKU8pRWFyYe"
```
后面返回的是钱包的秘钥，要保存好，后面解锁钱包需要用到.

> 3.导入私钥到钱包

```bash
cleos wallet import -n token 5Je3D9Ddkz2yw5XLiULGnNH77UD5fsMEYVdSXMDTEZdraSbwPuZ

imported private key for: EOS72F864zF8FZwkHXjZSFjubJoqxbQehDyQe4og1D55PQooUzXbH
```
这里的参数 -n 和上面一样，是指钱包的 name(名称)

> 4.创建账户

首先我们用第一步创建的 key 来创建账户 user1

```bash
cleos create account eosio user1 EOS72F864zF8FZwkHXjZSFjubJoqxbQehDyQe4og1D55PQooUzXbH EOS72F864zF8FZwkHXjZSFjubJoqxbQehDyQe4og1D55PQooUzXbH
```
这里的参数的意思是，由 eosio 这个账户来创建 user1 账户，后面传入的是账户的公钥，也就是我们第一步生成的秘钥对中的公钥。

为了简单起见我们这里把 Owner 和 Active 这两种类型的 key 都设置为同一个。实际生产环境操作的时候建议生成2对key, 把 Owner 和 Active 分别设置
为不同的 key.

同样的我们再创建另外两个账户 user2 和 user3, __user1 作为代币合约部署账户, user2 是代币接收账户，user3 是普通账户。__ 

```bash
cleos create account eosio user2 EOS72F864zF8FZwkHXjZSFjubJoqxbQehDyQe4og1D55PQooUzXbH EOS72F864zF8FZwkHXjZSFjubJoqxbQehDyQe4og1D55PQooUzXbH

cleos create account eosio user3 EOS72F864zF8FZwkHXjZSFjubJoqxbQehDyQe4og1D55PQooUzXbH EOS72F864zF8FZwkHXjZSFjubJoqxbQehDyQe4og1D55PQooUzXbH
```

> 5.部署代币合约

首先我们找到 eostoken 合约文件，我的 EOS 的编译路径是 <code class="scode">/opt/eos</code>, 所以合约路径为 

/opt/eos/contracts/eosio.token 

```bash
cleos set contract user1 /opt/eos/contracts/eosio.token -p user1 
```

结果并不顺利，程序抛出了异常

```bash
Reading WAST/WASM from eosio.token/eosio.token.wast...
2829186ms thread-0   main.cpp:2659                 main                 ] Failed with error: Assert Exception (10)
!wast.empty(): no wast file found eosio.token/eosio.token.wast
```
说是找不到 eosio.token.wast 这个文件。我们用下面的命令去生成

```bash
cd /opt/eos/contracts/eosio.token 
eosiocpp -o eosio.token.wast eosio.token.cpp 
```

然后在重新部署合约

```bash
cleos set contract user1 /opt/eos/contracts/eosio.token -p user1
```

输出结果如下

```
Reading WAST/WASM from eosio.token/eosio.token.wasm...
Using already assembled WASM...
Publishing contract...
executed transaction: ff198cabab73e55e3a47cdd7111cb2da7cd957aea444dfaba7e4c878de19ef03  8112 bytes  1323 us
#         eosio <= eosio::setcode               {"account":"user1","vmtype":0,"vmversion":0,"code":"0061736d01000000017e1560037f7e7f0060057f7e7e7f7f...
#         eosio <= eosio::setabi                {"account":"user1","abi":"0e656f73696f3a3a6162692f312e30010c6163636f756e745f6e616d65046e616d65050874...
warning: transaction executed locally, but may not be confirmed by the network yet                 
```

合约部署成功，系统给了善意的 warning, 提示你合约只是在本地部署了，并没有提交到网络。这个是正常的，因为我们本来就是连接到的本地网络。

> 6.发行代币

```bash
cleos push action user1 create '["eosio", "1000000000.0000 EOS", 0, 0, 0]' -p user1
```

得到结果：

```
executed transaction: 31508996812b5d6369c099e30047fab919b294baba12eae434f755a6aef2327a  120 bytes  423 us
user1 <= user1::create          {"issuer":"eosio","maximum_supply":"1000000000.0000 EOS"}
```
这里我们执行了eosio.token 这个合约里面的create方法，这个方法的作用就是创建一个代币。 
这里我们创建了一个叫做 EOS 的代币，发行者为 eosio 这个账户，发行总量为1000000000.0000，使用 user1  这个用户来创建这个代币。


> 7.把代币转给发币账号

```bash
cleos push action user1 issue '[ "user2", "1000000000.0000 EOS", "created by user1" ]' -p eosio
```

这样就把代币全部转给了发币账户 user2 ，现在我们可以查询一下 user2 的余额

```bash
cleos get currency balance user1 user2 EOS 

1000000000.0000 EOS
```
得到的结果是 1000000000.0000 EOS, 代币转移成功。

> 8.测试转账

下面我们从发币账户中发送 10000 个 EOS 给普通账户 user3 

```bash
cleos push action user1 transfer '["user2","user3","10000.0000 EOS","user2 send 1000 EOS to user3"]' -p user2
```

得到结果：

```
executed transaction: c7ceb4a0916665698426eef2ad3b0380c975f6b97f0788273ed2980573343150  160 bytes  621 us
#         user1 <= user1::transfer              {"from":"user2","to":"user3","quantity":"10000.0000 EOS","memo":"user2 send 1000 EOS to user3"}
#         user2 <= user1::transfer              {"from":"user2","to":"user3","quantity":"10000.0000 EOS","memo":"user2 send 1000 EOS to user3"}
#         user3 <= user1::transfer              {"from":"user2","to":"user3","quantity":"10000.0000 EOS","memo":"user2 send 1000 EOS to user3"}
warning: transaction executed locally, but may not be confirmed by the network yet
```

现在我们分别查询 user2 和 user3 的余额

```
cleos get currency balance user1 user2 EOS

999990000.0000 EOS

cleos get currency balance user1 user3 EOS
10000.0000 EOS
```

至此，我们成功的在 EOS 上发布了自己的代币.



