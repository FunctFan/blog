---
layout: post
title: 《区块链技术指南》读书笔记（二）
categories: [读书笔记]
tags: [区块链,数字货币,比特币,以太坊]
status: publish
type: post
published: true
author: blackfox
permalink: /20180131/block-chain-2.html
keyword: 区块链,数字货币,比特币,以太坊
desc: 区块链技术指南，数字加密货币
---

&emsp;&emsp;最近又陆陆续续的看完了《区块链技术指南》这本书，对区块链知识有了一些新的理解。由于最近区块链市场热度持续升温，越来越多的企业
和行业开始关注区块链技术领域，而且把区块链说的及其神秘，好像什么问题都可以用区块链技术来解决一样。现在一个项目不跟区块链或者人工智能扯上
关系都不好意思拿出来说一样。

&emsp;&emsp;要想真正理解一个事物，最好的方式是从它的本质开始，那区块链的本质是什么呢？

> 区块链的本质是一套 __加密的分布式账本__

接下来我们把这个概念再拆分来解释：加密, 分布式, 账本

一、加密  
=======
&emsp;&emsp;加密是个数学概念，理解起来有点抽象。区块链技术也是一个抽象概念，那我们先不谈区块链，先谈谈它的一个落地的应用-比特币，
比特币是利用区块链技术实现的第一个数字货币，现在玩数字货币的人很多，他们大都数可能不懂区块链到底是什么，但是他们都知道公钥，私钥。
因为公钥和私钥分别代表着他们的钱包地址和打开钱包的钥匙。这里的公钥和私钥就是使用加密算法生成的，由此可见加密是区块链的核心部分。
密码学在信息技术领域的重要地位无序多言，如果没有现在密码学的研究成果，人类社会可能无法进入信息时代。

> 加密在区块链技术当中主要承担两种任务

1. 生成唯一的ID，包括生成公钥，私钥等；
2. 实现信息的安全传输，保证信息的机密性，完整性，认证性和不可抵赖性（如数字证书，数字签名等技术）。

> 区块链中主要的加密算法：

### Hash 算法
&emsp;&emsp;Hash 算法又叫做散列算法，它能将任意长度的字符串明文经过某种计算，得到较短的固定长度的二进制值（Hash值）。
Hash 值又被成为指纹因此可以通常我们认为它可以作为唯一性识别标志。一个优秀的 Hash 算法将能实现：

* 正向快速： 给定的明文和hash算法，在有限的时间（通常要小于毫秒级）和资源内能计算出 hash 值。
* 逆向困难：给定（若干）hash 值，在有限的时间内很难或者说不可能逆推出明文。
* 输入敏感：原始输入信息修改一点点，产生的 Hash 值应该有很大的不同。
* 避免冲突：很难找到两段内容不同的明文，使得他们的 Hash 值一样（hash 冲突）。

常见的经典的 Hash 算法有 MD5，SHA系列hash算法， 这个只要学过计算机的同学都应该使用或者听说过。其中 MD5 和 SHA-1 已经被证明安全性不足以
应用于商业场景。一般来说，Hash 算法都是算力敏感型，意味着计算资源是瓶颈，主频越高的 CPU 进行 Hash 的速度也越快。不过也有一些 Hash 算法
不是算力敏感型，例如 scrypt, 需要大量的内存资源，节点不能通过通过简单的增加更多的CPU 来提高 Hash 的性能。

### 加解密算法
&emsp;&emsp;从上面我们可以看出 Hash 算法其实一种不可逆的加密算法，也就是说只能加密，不能解密。但是在通讯过程中我们肯定还需要一些可逆的
加密算法。

加解密算法体系

算法类型 | 特点 | 优势 | 缺陷| 代表算法
---------|-----|------|----|---------
对称加密 |加密解密秘钥相同或者可以推算|计算效率高，加密强度高|需要提前共享秘钥，易泄露|DES,3DES,AES,IDEA
非对称加密|加密解密的秘钥不相关 | 不需要提前共享秘钥 | 计算效率低,仍存在中间人攻击可能 | RSA,EIGamal,椭圆曲线系列算法

&emsp;&emsp;现代加密算法的典型组件包括：加解密算法、加密密钥、解密密钥。其中，加解密算法自身
是固定不变的，一般是公开可见的；密钥则往往每次不同，并且需要保护起来，一般来说，对同一种算法，密钥长度越长，则加密强度越大。
根据加解密的密钥是否相同，算法可以分为对称加密(symmetric cryptography)和非对称加密(asymmetric cryptography)。

__对称加密__

&emsp;&emsp;顾名思义，加密和解密的秘钥是相同的，优点是加解密效率高，速度快，占用内存小，加密强度高。缺点是一旦有一方泄露秘钥，则安全性
就被破坏了，另外在不去安全的通道下分发秘钥也是个问题。代表算法包括 DES、3DES、AES、IDEA	等。

__非对称加密__
&emsp;&emsp;顾名思义，加密秘钥和解密秘钥是不同的，分别被成为公钥和私钥。
非对称加密是现在密码学历史上的伟大发明，可以很好的解决对称加密需要提前分发秘钥的问题。
公钥一般是公开的，可以暴露出去，被别人加密所使用，私钥一般是个人自己持有，不能被他人获取，就像你比特币的钱包的私钥不能被人获取一样。

### 数字证书
&emsp;&emsp;数字证书用来证明某个公钥是谁的，并且内容是正确的。上面我们说过，对于非对称加密来说，存在的安全隐患就是中间人攻击，即公钥被人
替换，则整个安全系统将被破坏掉。怎样确保一个公钥确实是某个人的原始公钥？通过数字证书就可以解决这个问题，通过权威的
证书认证机构（Certification	Authority，CA）来签发。数字证书内容可能包括版本、序列号、签名算法类型、签发者信息、有效期、被签发人、
签发的公开密钥、CA 数字签名、其它信息等。所以数字证书就像实体证书一样，证明信息的合法性。

### 同态加密
&emsp;&emsp;同态加密是一种特殊的加密方法，它允许重复加密，也就是说你对密文加密之后得到的仍然是加密的结果，简单来说就是你对密文直接处理，跟对明文
进行处理再加密，得到的结果相同。这种特性从代数的角度上讲，叫做同态性，故以此为名。

&emsp;&emsp;同态性在代数上包括：加法同态，乘法同态，减法同态和除法同态。同时满足加法同态和乘法同态，被称为 __全同态__，同时满足四种
同态性，则被称为 __算术同态__

二、分布式
=======
&emsp;&emsp;区块链首先是一个分布式系统，中央式结构改成分布式系统，碰到的第一个问题就是一致性的保障。如果一个分布式集群系统无法保证处理
结果的一致性的话，那任何建立于其上的业务系统都无法正常工作，因此通常分布式系统在网络模块的开销都是比较大的。
&emsp;&emsp;在区块链中，通过共识算法来保证各个节点对处理的结果达成一致。这里需要注意的是，一致性并不代表结果的正确与否，它是一种异或逻辑
，表示系统对外呈现的状态是否一致，例如，所有的节点都达成失败状态也是符合一致性的。

> 在实际的计算机集群系统中，存在如下问题：

* 节点之间的网络通讯是不可靠的，包括任意延迟和内容故障；
* 节点的处理可能是错误的，甚至节点自身随时可能宕机；
* 同步调用会让系统变得不具备可扩展性。

为了解决这些挑战，工程师想出了各种解决办法，包括我们在解决分布式事务的时候采用的经典的两阶段提交算法(2PC)，
即<code class="scode">参与者将操作成败通知协调者，再由协调者根据所有参与者的反馈情报决定各参与者是否要提交操作还是中止操作。</code>


> 通常来说，理想的分布式系统一致性应该满足：

* 可终止性(Termination) : 一致性的结果在有限的时间内能完成；
* 共识性(Consensus) : 不同节点最终完成决策的结果应该相同；
* 合法性(Vaildity) : 决策的结果必须是其他进程提出的提案。

第一点跟第二点都比较容易理解，第三点理解起来有点犯迷糊，其实就是最终达成的结果必须是节点执行操作的结果。拿卖票来说，假设有两个节点在
卖同一种票，总共有1000张票，第一个节点卖出100张，第二个节点卖出300张，那么达成的结果就是还剩下600张，而不能是卖光了。

&emsp;&emsp;在一个分布式的系统中，绝对一致性是不可能达到的，所以一般来说一致性可分为强一致性和弱一致性（又叫最终一致性）。区块链中的共识算法也是一种
弱一致性，它主要解决对某个提案(Proposal，任何需要达成一致的信息都可以算作一个提案)，大家达成一致意见的过程。
一般来说，把不响应的情况叫做”非拜占庭错误“，把恶意响应的情况称为”拜占庭错误“(对应的节点叫拜占庭节点)。

#### FLP 不可能性原理

> 在网络可靠，存在节点失败(即便只有一个)的最小化异步模型系统中，不存一个可以解决一致性问题的确定性算法。

#### CAP 原理

> 分布式计算系统不可能同时确保一致性(Consistency)、可用性(Availablity)和分区容忍性(Partition)，设计中往往需要弱化对某个特性的保证。
* 一致性(Consistency)：任何操作应该都是原子的，发生在后面的事件能看到前面事件发生导致的结果，注意这里指的是强一致性；
* 可用性(Availablity)：在有限时间内，任何非失败节点都能应答请求；
* 分区容忍性(Partition)：网络可能发生分区，即节点之间的通信不可保障。

比较直观的理解是，网络可能出现分区的时候，系统是无法同时保证一致性和可用性的。要么，节点收到请求后因为没有得到其他人的确认就不应答，
要么节点只能应答非一致的结果。

#### ACID 原则
ACID 原则描述了对分布式数据库的一致性需求，同时付出了可用性的代价。

* Atomicity : 每次操作是原子的，要么成功，要么失败；
* Consistency : 数据库的状态是一致的，无中间状态；
* Isolation : 独立的，各种操作彼此互不影响；
* Durablility : 状态的改变是持久的，不会失效。

值得一提的是与 ACID 相对的原则是 BASE( Basic Availablity Soft state Eventually Consistency)，牺牲掉对一致性的约束(最终一致性),
来换取一定的可用性。

### 常见的共识算法

> 1、Paxos 算法

Paxos 算法的理论基础是：分布式系统中存在故障节点，但是不存在恶意节点，即消息可能重复或者丢失，但是不存在假消息。
Paxos 算法可以解决在这种条件下的共识达成问题。它的原理是基于两阶段提交(2PC)并进行扩展。
算法将节点分成三种类型：

* proposer : 提出一个提案，等待大家批准座位结案，往往是客户端承担该角色；
* acceptor : 负责对提案进行投票，往往是服务端承担该角色；
* learner : 被指告知提案结果，并与之统一，不参与投票过程，可能是客户端或者服务端。

并且算法需要满足 safety 和 liveness 两方面的要求：

* safety : 保证决议结果是对的，无歧义的，不会出错的情况
* liveness : 保证决议过程必须在有限的时间内完成。

基本过程包括 proposer 提出提案，先争取大多数 acceptor 的支持，超过一半支持时，则发送结案结果给所有人进行确认。
一个潜在的问题是 proposer 在此过程中出现故障，可以通过超时机制来解决。
极为凑巧的情况下，每次新的一轮提案的 proposer 都恰好故障，系统则永远无法达成一致(概率很小)。

Paxos 能保证在超过50%的正常节点存在时,系统能达成共识。

> 2、Raft 算法

Raft 算法是对 Paxos 的重新设计和实现，它对 Paxos 算法做了一些简化。包括三种角色：Leader, Candidate 和 Follower，其基本过程为：

* Leader 选举：每个 Candidate 随机经过一定的时间都会提出选举方案，最近阶段中得票最多者被选为 Leader;
* 同步 log : Leader 会找到系统中最新的log（各种事件的发生记录），并强制所有的 Follower 来刷新到这个记录。

> 3、拜占庭算法和PoW

&emsp;&emsp;拜占庭算法是一个经典的解决共识问题的算法，它主要是解决叛徒的问题。首先我们来了解这个算法的故事背景：

拜占庭是古代东罗马帝国的首都，由于地域宽广，守卫边境的多个将军(系统中的多个节点)需要通过信使来传递消息，达成某些一致的决定。
但由于将军中可能存在叛徒(系统中节点出错)，这些叛徒将努力向不同的将军发送不同的消息，试图会干扰一致性的达成。

__解决思路：__

&emsp;&emsp;拜占庭问题之所以难解，在于任何时候系统中都可能存在多个提案(因为提案成本很低)，并且要完成最终的一致性确认过程十分困难,容易受干扰。
但是一旦确认,即为最终确认。
比特币的区块链网络在设计时提出了创新的 PoW(Proof of Work) 算法思路。一个是限制一段时间内整个网络中出现提案的个数(增加提案成本)，
另外一个是放宽对最终一致性确认的需求，约定好大家都确认并沿着已知最长的链进行拓宽。系统的最终确认是概率意义上的存在。
这样，即便有人试图恶意破坏，也会付出很大的经济代价(付出超过系统一半的算力)。

后来的各种 PoX 系列算法，也都是沿着这个思路进行改进，采用经济上的惩罚来制约破坏者。

* Pow : Proof of Work, __采用全民公投的形式来投票__，根据工作量来评估算力，它的有点是可靠，
因为它是目前唯一接受了实践检验的公有链算法，包括比特币，以太坊。缺点是存在算力浪费，对于51%攻击有潜在隐患，
攻击者并不需要拥有比特币，所以如果要做51%攻击，所需要的花费跟挖矿难度相关而不是直接跟比特币价格相关，所以，如果挖矿公司的市值不如比特币的价格的话，比特币面临51%攻击的风险就会变大。
* Pos : Proof of State, __使用选举人的形式来投票__，大的节点作为代理人(选举人）去投票。这样做的优点是需要浪费算力，
同时，进行51%攻击的代价更高，因为想要进行51%攻击的话，你得拥有51%的货币。也就是说，这东西越值钱，攻击的成本就越高。
但是缺点也很明显，__就是这个选举人该怎么选?__ 一般来说算力大的节点容易被选为大节点(选举人节点), 这样会快速拉大贫富差距，
导致"富则越富". 说以说 PoW 和 PoS 有点像社会主义和资本主义的对决。

三、账本
======
&emsp;&emsp;在说账本之前，我们先来看看区块链到底有什么特性，区块链的特性可以从技术上和业务上来区分

> 区块链的技术特性

* 分布式容错性：网络容错性强，可以容错三分之的故障节点。
* 不可以篡改性：一致提交后的数据会一致存在，不可能被销毁或者修改。
* 隐私保护性：密码学保证了未经授权者能访问到数据，但是无法解析。

> 区块链的业务特性

* 可信任性：区块链技术可以提供天然可信的分布式账本平台，不需要额外第三方中介机构。
* 降低成本：跟传统技术相比，区块链技术可能带来更短的时间，更少的人力和维护成本。
* 增强安全：区块链技术将有利于安全可靠的审计管理和账目清算，减少犯罪可能性，和各种风险。

那其实我们说区块链具有账本的特性其实是指区块链具有不可篡改性。

这我们就要讲到账本和数据库的区别了，通常我们谈到数据库的操作，做过程序的人都知道：增,删,查,改.

但是对于账本我们通常只能做两种操作：入账(增), 查账. 删账和改账都是非法的操作。
区块链既能记录数据，又有不可篡改的特性，也就意味它是天然的账本。

#### 区块的数据结构：
* 区块大小信息（4个字节）
* 区块头信息（80个字节）
* 交易个数计数器：（1-9个字节）
* 交易内容（可变长）

#### 区块头信息的数据结构
* 版本号（4个字节）
* 上个区块的 SHA256 hash 值，链接到一个合法的区块上（32个字节）
* 包含了所有已经验证过的交易的 Merkle 树根节点的 hash 值（32个字节）
* 时间戳（4个字节）
* 难度指标（4个字节）
* Nonce，也就是 PoW 问题的答案（4个字节）

#### 比特币的交易数据结构
* 付款方的签名
* 付款方的资金来源的交易ID(也即上一个入账区块ID)
* 交易金额
* 收款人地址（合法的地址）
* 付款人的公钥
* 时间戳（交易时生效的时间）

四、扩展阅读
========
&emsp;&emsp;读这本书的过程中的其他收获（在读的过程中碰到的一些不是很理解的概念，然后自己去补充了一些知识）：

> 1、以太坊的主要特点

1. 单独为智能合约指定编程语言 Solidity
2. 使用了内存需求较高的哈希函数：避免出现算力矿机;
3. uncle 块（无效区块）激励机制：降低矿池的优势，减少区块产生间隔为 15 秒;
4. 难度调整算法：一定的自动反馈机制;
5. gas 限制调整算法：限制代码执行指令数,避免循环攻击;
6. 记录当前状态的哈希树的根哈希值到区块：某些情形下实现轻量级客户端;
7. 为执行智能合约而设计的简化的虚拟机EVM。

> 2、以太坊的核心概念

1. EVM:以太坊虚拟机,轻量级虚拟机环境,是以太坊中智能合约的运行环境。
2. Account:账户,分两类:合约账户存储执行的合约代码;外部账户为以太币拥有者账户,对应到某公钥。
3. Transaction:交易,从一个账户到另一个账户的消息,包括以太币或者合约执行参数。
4. Gas:燃料,每执行一条合约指令会消耗一定的燃料,当某个交易还未执行结束,而燃料消耗完时,合约执行终止并回滚状态。但是燃料耗费的无法回滚。

> 3、关于图灵机

&emsp;&emsp;图灵是计算机和密码学的神人，也是计算机的老祖宗，他阐述了计算的本质这个终极问题，提出了图灵机的概念，并且为计算机设定了边界。

__图灵机的设计理念：__

1. 世界上是否所有的数学问题都有明确的答案？
2. 如果有明确的答案，是否可以通过有限的步骤计算得到答案？
3. 对于那些有可能在有限步骤计算出来的数学问题，能否有一种假想的机械，让它不断运动，最后当机械停下来的时候，最后问题就解决了？

__图灵机的模型：__

1. 一条无限长的纸带，纸带被分割成一个个相邻的格子，每个格子都可以写至多一个字符。
2. 一个字符集合，它包含纸带上可能出现的所有字符。其中包含一个特殊的空白字符。
3. 一个读写头，类似于一个指针，它可以读取，擦除，和写入当前的格子的内容，此外可也可以每次向左或者向右移动一个格子
4. 一个状态寄存器，它追踪着每一步运算的过程中，整个机器所处的状态（运行或者终止），当这个状态从运行变为终止的时候，
则运算结束，机器停止运行并交回控制权。
5. 一个有限的指令集合，用来控制读写头的行为，其实这些就是程序指令

__图灵完备:__

指一个机器或装置能用来模拟图灵机的功能，图灵完备的机器在可计算性上等价。
通常我们说某种语言是否是图灵完备也指的是能否实现实现图灵机的所有功能。

> 4、其他的领悟

&emsp;&emsp;记得刘润老师在《5分钟商学院》讲创意营销的时候曾说，创新本质其实就是就旧元素的新组合。仔细想想其实区块链技术也没有什么创新，
密码学(加密)，博弈论(共识)，记账技术，分布式系统，控制论等这些都是老技术，但是区块链把他们结合起来了，却能够产生巨大的威力，解决了陌生
个体之间的信任问题。

&emsp;&emsp;其次，对于区块链的应用，就像吴军老师在《硅谷之谜》一书中讲的一样，我们不需要去模仿硅谷，只要搞清楚硅谷背后成功的因素，
然后因地制宜，建立符合我们自己的环境和文化的硅谷。区块链也一样，应该在了解区块链技术的原理和优势之后，然后灵活的应用解决现实问题，
295 而不是一味地的模仿，炒概念。而事实是从第一个应用比特币之后，出了一堆类似比特币的东西，但是到现在几乎没人知道，都失败了，
有少部分人看到比特币成功背后的一些因素，并且发现了比特币的缺点，比如交割时间长等，他们潜心改进区块链技术，
就取得了别人没有取得的成绩，这一类的核心代表就是以太坊。

&emsp;&emsp;但是在以太坊出现之后，很多基于以太坊的只能合约技术，发行代币圈钱的公司出现了，这些都是第二代的模仿者。区块链有这么多的特性和优势，
它应该可以解决很多现实问题的，而不只是停留在虚拟货币上。也不要思维定势，比如我们一谈到区块链就说去中心化，好像区块链的应用一定是
去中心化的一样，其实不然。比如美国的 Skuchain 公司，他们成功的利用区块链跟踪合同的执行，贷款和付款的流程，利用的是区块链的可跟踪技术，
他们的系统就是部署在IBM的云计算上面的，是中心化的，效率要比去中心化的高得多。这一点再次证明了技术只是手段，不是目的，真正的目的应该
是解决现实问题。

&emsp;&emsp;最后总结：__区块链是生产关系，人工智能是生产力。__ 这是最好的时代，整个社会的生产力和生产关系都将得到很大的发展，
世界将会变得更加美好。
