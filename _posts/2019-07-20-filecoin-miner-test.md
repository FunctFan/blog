---
layout: post
title: Filecoin 0.3.2 挖矿踩坑实录
categories: [Filecoin]
tags: [Filecoin, 挖矿, 区块链]
status: publish
type: post
published: true
author: blackfox
permalink: /20190720/filecoin-miner-test.html
desc: Filecoin 0.3.2 挖矿踩坑实录, Filecoin 时空证明 Bug
---

Filecoin 0.3.2 是 Filecoin 一个里程碑版本，修复了很多 Bug ，而且还上线了时空证明（PoSt）提交功能。
最近忙完 [GammaOS](http://www.xjxh.pro)集成多币种挖矿之后，终于有点时间开始测试一下这个所谓的里程碑版本了。

先说下这几天测试的时候碰到的问题：

> 在启动挖矿之后，尽管我的 Miner 节点完成了几个 sector 的密封，大约有 13GB，但是我在 
https://stats.kittyhawk.wtf/storage/mining 查看我的存储算力的时候，发现只显示了 268 MB,
也就是说，我们只有一个扇区的时空证明（`PoSt`）被接受了。

**造成这个问题的直接原因是（存储）证明集合的更新方式不合理导致的，当前版本只会在提交 PoSt 的时候更新存储算力。**
而由于是空证明生成时间比较长，大约需要 1000 区块（16小时）。所以虽然我的矿工密封了很多数据，但是没有提交 `PoSt` 之前，这些数据并不能转换为存储算力。

```
This actually has to do with the way the proving set is updated. We only update the proving set during a submitPoSt.
```

你可能会问，为什么第一个 sector 密封完成之后马上就显示算力了呢？这个问题官方也给出了解释：

```
There is a special case for the first commitSector where we immediately add that sector to the proving set and start the proving period. This ensures miners get power quicker. This is the first submitPoSt that shows up on chain for any miner.
```
显然，第一个 `commitSector` 只是个特例，能让你快速获得算力，获得及时反馈，让你知道你的节点是正常工作的。

这里有个地方需要解释一下就是，正如白皮书上所说的那样，`PoSt` 的生成真的是串行生成的，所以比较慢，
已经有开发者提交 issue 建议使用并行生成 PoSt，这个为应该会在下个版本修复。

![](/images/1px.png){:data-src="http://blog.img.r9it.com/image-32dc2ae4bc55ba28a3948aa1a0a86bdf.png" class="img-view"}

我通过查询发现我的第一个 `submitPoSt` 是在 [13093](https://explorer.user.kittyhawk.wtf/blocks/zDPWYqFD5tojAeydhYFuRGzttSAHPcQP2Gj35G5mn6t2WRT8W9Mi) 区块。

![](/images/1px.png){:data-src="http://blog.img.r9it.com/image-7ddaa39445b410de4699867d1fa2c5c0.png" class="img-view"}

可以看到这次提交的参数（Parameter） 比较短，只有 268 字节。

```
gljDgVjAq5Tg13sfkQJLfpQbZ2nuPCuDI0zn3CtHjlp4PTwQqkP01CI0THxjfy2LQCWVIZBLmMYWjCRza/CVCH5oybqtgOOSlKU8dLEJq2Xd2JPpTo1xRONOEvQ/HJeAD3ZedNf+BGmM65oX7sOTlI8uUpgyFusQUX/yZyhAkAc2khv/x2fExadr3LX4ysSdTU+fs6FFhh46PPO65BYhX16CJtD2KcZB2sZHqNPf9+0PyWsEPhp+cL7prpdx++FjF6rQfXbWQkH2
```

过了几小时，我发现我的第二个 `submitPoSt` 出现在了 [14150](https://explorer.user.kittyhawk.wtf/blocks/zDPWYqFCzpVYfcrr8JtbtUwRZW1cbRKvY1St3kNZ1N2LaTqrCNZS) 区块。

这次的 `submitPoSt` 参数明显长了很多（2080 Bytes）, 然后我再去 [https://stats.kittyhawk.wtf/](https://stats.kittyhawk.wtf/) 
查询之后发现我的 `Proven Storage` 已经增加到 16.4 GB 了。存储算力也增加到 `16374562816 / 3143916060672` 了。
但是我此时已经完成 24 GB 的数据密封了。所以还是有一部分数据没有提交 `PoSt`。

**事实证明：提交的参数长度越长，增加的存储算力就越大**

另外，值得一提的是，有开发者反馈，如果不能在规定的时间内提交 PoSt（或者是 PoSt 丢失，无法恢复），矿工将被永远从网络中删除。
https://github.com/filecoin-project/rust-fil-proofs/issues/738

![](/images/1px.png){:data-src="http://blog.img.r9it.com/image-dd9bf84eaa8d9427d577232e7e853b95.png" class="img-view"}

所以说，对于不能及时提供 PoSt 的矿工，惩罚还是很严重的，可能比我们之前预想说是扣除抵押还要严重一些。

最后 Github 上有不少同学问我怎么去查询指定的矿工的 `submitPoSt` 在哪些区块。这里给出一个比较笨但是比较使用的方法。

假设我们要查询的矿工地址为 `t2zmkmdccog3da2n5rnmkyrzvvuoklbcpymcapxay`

```bash
minerAddress=t2zmkmdccog3da2n5rnmkyrzvvuoklbcpymcapxay
```

> 第一步，把所有跟当前矿工相关的区块全部找出，过滤掉不包含 `submitPoSt` 的区块

```bash
curl http://127.0.0.1:3453/api/chain/ls |grep t2zmkmdccog3da2n5rnmkyrzvvuoklbcpymcapxay |grep submitPoSt > block.txt
```

> 第二步，使用 `jq` 工具把对应的区块高度（height字段）全部找出来

```bash
$ cat block.txt | jq -r '.[0]["height"]'
20450
19978
19815
19611
19385
19356
19295
18358
17347
16319
15339
15041
14150
14000
13870
13818
13093
13052
```
> 第三步，找到对应高度区块的哈希值，假设我们需要找到 13093 区块的哈希值

```bash
miner@miner-karl:~$ curl http://127.0.0.1:3453/api/chain/ls |grep '"height":"13094"'|jq '.[0]["parents"]'
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  260M    0  260M    0     0  54.7M      0 --:--:--  0:00:04 --:--:-- 54.7M
[
  {
    "/": "zDPWYqFD5tojAeydhYFuRGzttSAHPcQP2Gj35G5mn6t2WRT8W9Mi"
  }
]
```
这里特别要注意， 这里的过滤条件是 `"height":"13094"`，因为区块结构中只有 `parents`，也就是上一个区块的哈希值。

![](http://blog.img.r9it.com/image-4c61a685565c23943a67d9162127e3aa.png)

> 第四步，通过官方的区块浏览器浏览对应的区块详情

https://explorer.user.kittyhawk.wtf/blocks/{blockHash} 这里只需要把对应的 `blockHash` 换成你想要查询的区块哈希的就可以了。

比如 [https://explorer.user.kittyhawk.wtf/blocks/zDPWYqFD5tojAeydhYFuRGzttSAHPcQP2Gj35G5mn6t2WRT8W9Mi](https://explorer.user.kittyhawk.wtf/blocks/zDPWYqFD5tojAeydhYFuRGzttSAHPcQP2Gj35G5mn6t2WRT8W9Mi)

或者你也可以直接使用命令行工具查询区块详情

```bash
go-filecoin show {blockHash}
```

到此，你应该知道如何查询自己的 `submitPoSt` 记录了。

如果你有更好的查询方法，你可以通过下面的有邮箱联系我，非常感谢。

我的邮箱地址是： yangjian102621@gamil.com

