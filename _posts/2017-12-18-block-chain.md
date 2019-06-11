---
layout: post
title: 《区块链技术指南》读书笔记（一）
categories: [读书笔记]
tags: [区块链,比特币]
status: publish
type: post
published: true
author: blackfox
permalink: /20171218/block-chain-1.html
keyword: 区块链,比特币,数字货币
desc: 区块链技术指南，区块链读书笔记
---

&emsp;&emsp;最近在看一本书《区块链技术指南》，写下一点读书笔记，12月底就要离开现在的公司去深圳跟朋友合伙创业，
主要就是做区块链的底层和应用开发，但是目前对区块链还是一无所知，也算提前补充一点区块链的知识。

区块链的定义
=======
&emsp;&emsp;区块链，顾名思义，就是区块的链，区块是指“交易数据块”。简单来说区块链就类似 P2P 网络账本，
交易的数据都是通过 “私钥+交易对象的公钥” 生成一条交易记录，然后数据存储在N个服务器上，
一般服务器都是用户自己的机器或者服务器，每个服务器都会向邻近的服务器同步数据，交易记录就写在自己的区块里面，
然后整个网络一直在疯狂的同步交易数据。

* 交易（Transaction）：一次操作，导致账本状态的一次改变，如添加一条记录；
* 区块（Block）：记录一段时间内发生的交易和状态结果，是对当前账本状态的一次共识；
* 链（Chain）：由一个个区块按照发生顺序串联而成，是整个状态变化的日志记录。

区块链的安全性
========
&emsp;&emsp;因为全部的数据存储在N台服务器中，每个区块的都存储了一份一样的数据，
同步存储，完全是去中心化的，没有数据中心，这就意味着没有人可以控制交易数据。不像我们现有银行系统的账本，
是有中心数据库的，银行是可以修改用户的余额的。

__那么问题来了，那对于区块链创建的分布式账本，是否有可能修改数据呢？__

&emsp;&emsp;答案是可以的，根据区块链的算法规则，如果你控制了50%以上节点，那么你就可以控制交易了。但是事实上在一个个去中心化的系统里面，这几乎不可能，而且网络越大越安全。

比特币
=====
&emsp;&emsp;比特币是利用区块链技术产生的一种电子虚拟货币，是区块链技术的第一个应用。
比特币货币系统是独立存在的，其运行不依赖于中央银行、政府、大型企业的支持或者信用担保。
比特币使用遍布整个 P2P 网络节点的分布式数据库来管理货币的发行、交易和账户余额信息。

比特币钱包
=======
&emsp;&emsp;比特币会为每个用户生成一个公钥和私钥，公钥就是你的钱包地址。别人要给你转钱就输入你的公钥，
然后生成一条交易记录：__交易金额 + 对方钱包的地址 + 你的公钥__，这条记录会加密存储到网络上，然后这条交易记录会同步到全部的在网服务器上（当然也包括你的），然后只有你的私钥才可以解密这条交易记录，然后你就拥有这个钱。
也就是说这条记录属是于你的，这个钱也是属于你的。

&emsp;&emsp;需要注意的是：你的钱包是存在你的硬盘里面的，要是你的钱包丢了，钱也就没有了。这个没有是蒸发了，不会有人捡到，
也不会被回收，跟现实的钱不一样的。所以你要定期给你自己的钱做个备份（钱包是个很小的文件，里面记着你的余额，公钥，私钥）。

&emsp;&emsp;还有，加入有黑客入侵你的电脑，盗走了你的公钥和私钥，他就可以支配你的比特币了，就相当于你的钱包被偷了，
钱包里面的前肯定是由小偷支配了，而你没有权限再支配那些钱了。

挖矿
=====
&emsp;&emsp;挖矿也叫挖币，他是比特币这种电子货币的发行方式。

&emsp;&emsp;当用户发布交易后，需要有人将交易进行确认，写到区块链中，形成新的区块。
在一个互相不信任的系统中，该由谁来完成这件事情呢？比特币网络采用了“挖矿”的方式来解决这个问题。

&emsp;&emsp;参与者根据上一个区块的 hash 值，10 分钟内的验证过的交易内容，再加上自己猜测的一个随机数 X，让新区块的 hash 值小于比特币网络中给定的一个数。

&emsp;&emsp;区块链的数据是通过区块来存储的，不同的区块通过 256 hash 地址来标识。然后不同的块之间相互连接，然后数据是一块
一块的存储，存满了就存下一块，当已有的区块都存满了就要产生新的区块来存储了，那么谁猜对了下一个区块的 256 hash地址，谁就可以获得对应区块的比特币奖励，最早每个区块可以产生50个比特币，每四年减半，现在是12.5个。

__具体的过程是这样的：__

&emsp;&emsp;参与者根据上一个区块的 hash 值，10 分钟内的验证过的交易内容，再加上自己猜测的一个随机数 X，让新区块的 hash 值小于比特币网络中给定的一个数。这个数越小，计算出来就越难。系统每隔两周（即经过 2016 个区块）会根据上一周期的挖矿时间来调整挖矿难度（通过调整限制数的大小），来调节生成区块的时间稳定在 10 分钟左右。为了避免震荡，每次调整的最大幅度为 4 倍。

数字货币的交易
=======
&emsp;&emsp;目前国内比较有名的数字火币交易平台有2个，[火币网](https://www.huobi.pro/zh-cn/) 和 [CoinCola](https://www.coincola.com/). 火币网是大陆的交易平台，CoinCola 是香港的场外交易平台。可以使用支付宝，微信，银行转账等方式购买比特币，以太坊等。

&emsp;&emsp;个人比较喜欢 CoinCola 的交易模式，比较方便。
尤其是如果你要在火币网上购买以太币(ETH)，那就比较麻烦，你需要先到火币的"法币交易市场"购买 USDT, USDT是Tether公司推出的基于稳定价值货币美元（USD）的代币Tether USD（简称USDT），1 USDT=1美元。
然后再把你购买的 USDT 转入的火币网的 “币币交易”市场，再使用 USDT 购买以太坊。
而在 CoinCola 你可以直接购买。

&emsp;&emsp;再一个就是国内的交易市场比较容易受政策的影响，不稳定，反正我就经历过2次火币网给用户发通知说 USDT 暂时不能充值和提币的情况。然后我就果断把币提到了 CoinCola.

&emsp;&emsp;不过火币网可以交易的币种比较多，目前市面上主流的币种都有，而 CoinCola 目前只有 BTC, ETH, BCH。而且有K线图，这个工具比较好用，可以让你很方便的看到某个币最近的涨势。

分叉币
======
&emsp;&emsp;分差币是在当前的区块链上通过UAHF（用户激活的硬分叉）或者UASF（用户激活的软分叉）的方式来分叉出一个新的区块链。
比如目前市面上的 BCH(比特币现金) 就是一种分叉币。
比特币的区块大小为1M，现在每个区块大概都接近这个大小，已经快达到了区块容量的上限。
如果比特币网络的转账越来越多，很多交易就不会在交易发生后的第一个发生的区块被打包和确认，可能要等好几个区块，甚至更久。
比特币交易的拥堵导致了转账速度变慢，手续费也越来越高。

&emsp;&emsp;简单来说，就是区块链的带宽太窄了，每次矿工转移数据都要排队，浪费时间，所以需要扩容。而针对如何扩容这个问题，
“矿工派”和“比特币核心派”（也就是开发比特币的人）产生了分期。如果把当前的区块链当做一条单车道的高速公路的话，
“矿工派”的扩容方案是把这条路加宽，变成2车道，4车道，8车道... 而“比特币核心派”主张从主干道上另外修一条分叉道路，
专门用来过一些小车分流，这样可以让主道快速流通。

&emsp;&emsp;具体详细的关于比特币分叉的形成可以参考知乎大神的分享，写的非常浅显易懂，形象生动。
[https://www.zhihu.com/question/35970198](https://www.zhihu.com/question/35970198)