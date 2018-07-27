---
layout: post
title: 给自己的代币编写 ICO 众筹合约
categories: [solidity,智能合约]
tags: [众筹, ICO, solidity]
status: publish
type: post
published: true
author: blackfox
permalink: /20180727/crowd-by-token.html
keyword: ICO 智能合约
desc: 使用代币进行 ICO
---

> 阅读本文你需要先了解以下知识

1. solidity 语言，点击这里去看 [solidtiy 中文教程](http://solidity-cn.readthedocs.io/zh/develop/index.html)
2. 了解什么是以太坊和智能合约, 不明白的可以看看我的这篇博客 [以太坊开发入门指南](/20180718/ether-develop.html)
3. 如果还不知到怎么发自己的代币的同学请移步这里 [发行自己的 ERC20 标准代币](/20180726/create-token.html)


什么是代币众筹
======
简单的说，代币其实就是数字货币，跟主链币不同的是，代币是通过智能合约发出的。
在众筹之前，你得先有个代币，也就是 __token__. 不然你拿什么来 ICO (卖代币给投资者). 简单来说，代币其实就是你参与一个项目 ICO 的凭证。
举个栗子，我想发起一个项目，需要筹集 100w 的资金，那如何证明你给了我投资了呢，很简单，你给我投入多少资金，我返还给你一定比例的代币，等我项目
成功上线之后你就可以凭借代币来分享项目分红，你拥有的代币数量越多，分红也就越多。
传统的众筹不仅操作手续复杂，而且在参与之后通常不容易交易（参与之后无法转给其他人），而通过用代币来参与众筹，
则很容易进行交易，众筹的参与人可随时进行买卖，待众筹项目实施完成的时候，完全根据代币持有量进行回馈。

众筹智能合约代码
========

首先导入一些数字运算安全库，这样在进行 uint 的加减乘除的时候能够避免溢出而给黑客留下攻击的漏洞

```javascript
library SafeMath {

	/* 加法 */
	function add(uint a, uint b) internal pure returns (uint) {
		uint256 c = a + b;
		assert(c >= a);
		return c;
	}

	/* 减法 */
	function sub(uint a, uint b) internal pure returns (uint) {
		assert(b <= a);
		return a - b;
	}

	/* 乘法 */
	function mul(uint a, uint b) internal pure returns (uint) {
		if (a == 0) {
			return 0;
		}
		uint c = a * b;
		assert(c / a == b);
		return c;
	}

	/* 除法 */
	function div(uint a, uint b) internal pure returns (uint) {
		uint c = a / b;
		return c;
	}

}

```

> 然后在声明 Token 的接口

```javascript
// 声明 token 合约接口
interface token {
	function transfer(address receiver, uint amount) external;
	function decimals() external returns(uint);
}
```

这里我们声明了两个方法：

* transfer(address, amount), 代币转账方法
* decimals(), 获取代币的精确位数

> 最后加上众筹的合约代码

```javascript
/**
 * crowd funds contract
 */
contract CrowdFunds {

    /* 导入安全运算库 */
    using SafeMath for uint;

    // 受益人地址
    address public beneficiary;
    // 众筹的目标金额，单位为 1 ehter
    uint public targetFunds;
    // 募资截止日期
    uint public deadline;
    // 代币价格，单位为 1 ether
    uint public price;
    // 预售代币合约地址
    token public tokenReward;
    // 是否完成众筹目标
    bool public reachedGoal = false;
    // 众筹是否结束
    bool public isCrowdClosed = false;
    // 已经募集的资金数量
    uint public fundsRaisedTotal = 0;
    // 记录每个投资者贡献了多少资金，单(wei)
    mapping(address => uint) public balanceOf;

    /**
    * 事件可以用来跟踪信息
    **/
    event GoalReached(address recipient, uint totalAmountRaised);
    event FundTransfer(address investor, uint amount, bool isContribution);
    event InvestorWithdraw(address investor, uint amount, bool success); // 投资人提现事件
    event BeneficiaryWithdraw(address beneficiary, uint amount, bool success); // 受益人提现事件



    modifier afterDeadline {
        require(now > deadline);
        _;
    }

    modifier beforeDeadline {
        require(now <= deadline);
        _;
    }

    constructor(
        address _beneficiary,
        uint _targetFunds,
        uint _duration,
        uint _price,
        address _tokenAddress
    ) public {

        beneficiary = _beneficiary;
        targetFunds = _targetFunds * 1 ether;
        deadline = now + _duration * 1 minutes;
        price = _price * 1 finney;
        tokenReward = token(_tokenAddress);
    }

    /**
     * 无函数名的Fallback函数，这里必须在众筹截止日期之前充值才有效
     * 在向合约转账时，这个函数会被调用
     */
    function () payable beforeDeadline public {
        require(!isCrowdClosed); // 判断众筹是否结束
        require(!reachedGoal); // 判断众筹是否达标

        // 计算购买的 token 数量
        uint amount = msg.value;
        // 这里需要注意要乘以 token 的 decimals, 否则会发现众筹得到的代币数量不对
        uint tokenDecimal = tokenReward.decimals();
        uint tokenNum = (amount / price) * 10 ** tokenDecimal;
        balanceOf[msg.sender] = balanceOf[msg.sender].add(amount);
        fundsRaisedTotal = fundsRaisedTotal.add(amount);

        // 众筹达标
        if (fundsRaisedTotal >= targetFunds) {
            reachedGoal = true;
            isCrowdClosed = true; //关闭众筹
            // 发送事件，记录日志
            emit GoalReached(beneficiary, fundsRaisedTotal);
        }
        // 发送代币
        tokenReward.transfer(msg.sender, tokenNum);
        emit FundTransfer(msg.sender, amount, true);
    }


    /**
     * 提现
     */
    function withdraw() afterDeadline public {

        //众筹没有成功，则把投资人款项退还
        if (!reachedGoal) {
            uint amout = balanceOf[msg.sender];

            if (amout > 0 && msg.sender.send(balanceOf[msg.sender])) {
                balanceOf[msg.sender] = 0;
                emit InvestorWithdraw(msg.sender, amout, true);
                // 发送事件, 记录日志
            } else {
                balanceOf[msg.sender] = amout;
                emit InvestorWithdraw(msg.sender, amout, false);
            }
        } else { //众筹成功 ，受益人把钱提走

            if (msg.sender == beneficiary && beneficiary.send(fundsRaisedTotal)) {
                emit BeneficiaryWithdraw(beneficiary, fundsRaisedTotal, true);
            } else {
                emit BeneficiaryWithdraw(msg.sender, fundsRaisedTotal, false);
            }

        }

    }

}
```

合约代码比较简单，而且我又都加了注释，我这里就不多做解释了，但是有个地方需要额外注意一下，就是在 Fallback 函数里面计算投资人兑换代币数量的时候要注意
单位换算：

```javascript
// 计算购买的 token 数量
uint amount = msg.value;
// 这里需要注意要乘以 token 的 decimals, 否则会发现众筹得到的代币数量不对
uint tokenDecimal = tokenReward.decimals();
uint tokenNum = (amount / price) * 10 ** tokenDecimal;
balanceOf[msg.sender] = balanceOf[msg.sender].add(amount);
fundsRaisedTotal = fundsRaisedTotal.add(amount);
```

> 这里需要乘以你的代币的精确度，否则你就会发现你命名是购买了 1000 个 token, 到最后发现是 0.0000000000000001 个，__所以如果你的代币有精度的话，这里计算代币
数量的时候就需要加上精度。__ 

写好合约代码之后我们就可以开始测试了。

由于线上的测试环境比较卡，所以我就使用 ganache 在本地启动了一个模拟环境，里面有10个账号，每个账号有 100 ETH, 足够测试了。

> 先用第一个账户创建一个代币合约，发行一个代币，代币名称 PPB, 这一步略过，不知道怎么操作的同学请移步这里 [发行自己的 ERC20 标准代币](/20180726/create-token.html)

> 第二步，发布众筹合约，需要传入 5 个参数

* address _beneficiary, 受益人，我们这里设置为第一账号，也就是发布众筹合约的人, 0x2eabca3c9ee38a3896cba2e2e74e613f80332194
* uint _targetFunds, 募资金额, 我们这里设置为 3
* uint _duration, 募资周期，由于是本地环境，我们设置为 10 分钟就够了
* uint _price, 代币价格，我们这里默认 1 EHT = 1000 PPB
* address _tokenAddress 代币合约地址，把我们刚刚创建的代币合约地址传入就可以了

本人使用的参数为: "0x2eabca3c9ee38a3896cba2e2e74e613f80332194",3,10,1,"0x13e59dbcc6c962db73ee4dcf1ec41da1a7c1752b", 仅供参考，不过地址要替换成你的。

<img class="img-view" data-src="/images/2018/07/27/create-contract.png" src="/images/1px.png" />

给合约充入代币
=========

下一步，需要给众筹合约充入代币，否则调用 token.transfer() 转移代币的方法就会出错，因为此时合约拥有的代币数为0, 就没法转移代币给投资人.

这里我们使用 https://www.myetherwallet.com 这个以太坊官方的轻钱包来进行充值操作，myetherwallet 默认是连接主网的，所以首先你需要添加一个本地网络，让
它连接我们 ganache 提供的私有网络 127.0.0.1:8545

> 点击右上角的网络选项，选择下面的 add custom net

<img class="img-view" data-src="/images/2018/07/27/add-custom-net.png" src="/images/1px.png" />

> 然后在接下来的弹框中填入本地网络的参数信息

<img class="img-view" data-src="/images/2018/07/27/add-custom-net2.png" src="/images/1px.png" />

> 添加完网络之后，导入私钥解锁账户，在 ganache 复制第一账户(发币账户)的私钥

<img class="img-view" data-src="/images/2018/07/27/ico-copy-privatkey.png" src="/images/1px.png" />

> 在 myetherwallet 网页上选择发送代币，然后选择下面的通过私钥解锁账户

<img class="img-view" data-src="/images/2018/07/27/unlock-account.png" src="/images/1px.png" />

> 解锁账户之后发送代币，复制众筹合约的地址，转入 3000 代币 

<img class="img-view" data-src="/images/2018/07/27/token-recharge.png" src="/images/1px.png" />

> 如果发现没发选择你的代币，或者看不到你的代币，先在右边添加

<img class="img-view" data-src="/images/2018/07/27/add-custom-token.png" src="/images/1px.png" />

> 创建完之后，在转账那里你就能选择你的代币了，接下来我们需要众筹，在 remix 调用 fallback 函数，__注意需要附加以太币__, 因为你要向合约打币，
然后合约就会自动向你发送代币

我们先检查一下看看代币充值是否成功，在 ERC20 这个合约中调用 balanceOf() 方法，传入合约地址

<img class="img-view" data-src="/images/2018/07/27/check-recharge.png" src="/images/1px.png" />

> 然后我们就可以开始通过向合约地址打入 ETH 来参与众筹了。你可以通过钱包, myetherwallet, 我是直接通过 remix 调用　fallback 函数来实现。先切换账号，因为不能
自己给自己众筹，我们选择第二个账号

<img class="img-view" data-src="/images/2018/07/27/do-crowd.png" src="/images/1px.png" />

然后调用函数　

<img class="img-view" data-src="/images/2018/07/27/do-crowd2.png" src="/images/1px.png" />

返回调用结果

<img class="img-view" data-src="/images/2018/07/27/crowd-success.png" src="/images/1px.png" />

> 检验众筹是否成功，第一是查询打款人的代币余额，应该是 2000 (如果你打了2个 ETH), 第二个是看看众筹的资金是否有增加

<img class="img-view" data-src="/images/2018/07/27/crowd-success2.png" src="/images/1px.png" />

> 也可以通过 myetherwallet 查看(这里采用同样的方法，先到 ganache 复制私钥)

<img class="img-view" data-src="/images/2018/07/27/crow-success3.png" src="/images/1px.png" />

> 接下来就等众筹结束之后，受益人提款了。受益人直接调用合约的 withdraw() 方法就可以提走众筹募集的资金了

<img class="img-view" data-src="/images/2018/07/27/withdraw.png" src="/images/1px.png" />

至此，整个 ICO 流程就跑完了，多看无益，赶紧去自己实操一下把.




