---
layout: post
title: 发行自己的 ERC20 标准代币
categories: [solidity,智能合约]
tags: [众筹, ICO, solidity]
status: publish
type: post
published: true
author: blackfox
permalink: /20180726/create-token.html
keyword: ICO 智能合约
desc: 使用代币进行 ICO
---

> 阅读本文你需要先了解以下知识

1. solidity 语言，点击这里去看[教程](http://solidity-cn.readthedocs.io/zh/develop/index.html)
2. 了解什么是以太坊和智能合约, 不明白的可以看看我的这篇博客 [以太坊开发入门指南](/20180718/ether-develop.html)


什么是代币
======
简单的说，代币其实就是数字货币，跟主链币不同的是，代币是通过智能合约发出的, 也就是说代币是通过智能合约管理的数字货币

我们先来看看以太坊上发的代币是什么样子的：

<img class="img-view" data-src="/images/2018/07/eth-token.png" src="/images/1px.png" />

今天我们就来详细讲一讲怎样创建一个这样的代币。

ERC20 代币 
=======

也许你经常看到ERC20和代币一同出现， ERC20是以太坊定义的一个代币标准。
要求我们在实现代币的时候必须要遵守的协议，如指定代币名称、总量、实现代币交易函数等，只有支持了协议才能被以太坊钱包支持。

其接口如下：

```javascript
contract ERC20Interface {

	string public constant name = "Token Name";
	string public constant symbol = "SYM";
	uint8 public constant decimals = 18;  // 18 is the most common number of decimal places

	function totalSupply() public constant returns (uint);
	function balanceOf(address tokenOwner) public constant returns (uint balance);
	function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
	function transfer(address to, uint tokens) public returns (bool success);
	function approve(address spender, uint tokens) public returns (bool success);
	function transferFrom(address from, address to, uint tokens) public returns (bool success);

	event Transfer(address indexed from, address indexed to, uint tokens);
	event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}
```

简单说明一下：

* name ： 代币名称；
* symbol： 代币符号；
* decimals： 代币小数点位数，代币的最小单位， 18表示我们可以拥有 .0000000000000000001单位个代币；
* totalSupply() : 发行代币总量；
* balanceOf(): 查看对应账号的代币余额；
* transfer(): 实现代币交易，用于给用户发送代币（从我们的账户里）；
* transferFrom(): 实现代币用户之间的交易；
* allowance(): 控制代币的交易，如可交易账号及资产；
* approve(): 允许用户可花费的代币数；

编写代币合约代码
========
我这里就直接使用以太官网的 token 合约模板, 加上了一些注释。想看官方原版模板的请移步这里：

[https://ethereum.org/token](https://ethereum.org/token)

```javascript
pragma solidity ^0.4.16;


interface tokenRecipient { function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) public; }

//noinspection ALL contract TokenERC20 {
string public name;
string public symbol;
uint8 public decimals = 18;  // decimals 可以有的小数点个数，最小的代币单位。18 是建议的默认值
uint256 public totalSupply;

// 用mapping保存每个地址对应的余额
mapping (address => uint256) public balanceOf;
// 存储对账号的控制
mapping (address => mapping (address => uint256)) public allowance;

// 事件，用来通知客户端交易发生
event Transfer(address indexed from, address indexed to, uint256 value);

// 事件，用来通知客户端代币被消费
event Burn(address indexed from, uint256 value);

/**
 * 初始化构造
 */
function TokenERC20(uint256 initialSupply, string tokenName, string tokenSymbol) public {

	totalSupply = initialSupply * 10 ** uint256(decimals);  // 供应的份额，份额跟最小的代币单位有关，份额 = 币数 * 10 ** decimals。
	balanceOf[msg.sender] = totalSupply;                // 创建者拥有所有的代币
	name = tokenName;                                   // 代币名称
	symbol = tokenSymbol;                               // 代币符号
}

/**
 * 代币交易转移的内部实现
 */
function _transfer(address _from, address _to, uint _value) internal {
	// 确保目标地址不为0x0，因为0x0地址代表销毁
	require(_to != 0x0);
	// 检查发送者余额
	require(balanceOf[_from] >= _value);
	// 溢出检查
	require(balanceOf[_to] + _value > balanceOf[_to]);

	// 以下用来检查交易，
	uint previousBalances = balanceOf[_from] + balanceOf[_to];
	// Subtract from the sender
	balanceOf[_from] -= _value;
	// Add the same to the recipient
	balanceOf[_to] += _value;
	Transfer(_from, _to, _value);

	// 用assert来检查代码逻辑。
	assert(balanceOf[_from] + balanceOf[_to] == previousBalances);
}

/**
 *  代币交易转移
 * 从自己（创建交易者）账号发送`_value`个代币到 `_to`账号
 *
 * @param _to 接收者地址
 * @param _value 转移数额
 */
function transfer(address _to, uint256 _value) public {
	_transfer(msg.sender, _to, _value);
}

/**
 * 账号之间代币交易转移
 * @param _from 发送者地址
 * @param _to 接收者地址
 * @param _value 转移数额
 */
function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
	require(_value <= allowance[_from][msg.sender]);     // Check allowance
	allowance[_from][msg.sender] -= _value;
	_transfer(_from, _to, _value);
	return true;
}

/**
 * 设置某个地址（合约）可以创建交易者名义花费的代币数。
 *
 * 允许发送者`_spender` 花费不多于 `_value` 个代币
 *
 * @param _spender The address authorized to spend
 * @param _value the max amount they can spend
 */
function approve(address _spender, uint256 _value) public
returns (bool success) {
	allowance[msg.sender][_spender] = _value;
	return true;
}

/**
 * 设置允许一个地址（合约）以我（创建交易者）的名义可最多花费的代币数。
 *
 * @param _spender 被授权的地址（合约）
 * @param _value 最大可花费代币数
 * @param _extraData 发送给合约的附加数据
 */
function approveAndCall(address _spender, uint256 _value, bytes _extraData)
	public
	returns (bool success) {
		tokenRecipient spender = tokenRecipient(_spender);
		if (approve(_spender, _value)) {
			// 通知合约
			spender.receiveApproval(msg.sender, _value, this, _extraData);
			return true;
		}
	}

/**
 * 销毁我（创建交易者）账户中指定个代币
 */
function burn(uint256 _value) public returns (bool success) {
	require(balanceOf[msg.sender] >= _value);   // Check if the sender has enough
	balanceOf[msg.sender] -= _value;            // Subtract from the sender
	totalSupply -= _value;                      // Updates totalSupply
	Burn(msg.sender, _value);
	return true;
}

/**
 * 销毁用户账户中指定个代币
 *
 * Remove `_value` tokens from the system irreversibly on behalf of `_from`.
 *
 * @param _from the address of the sender
 * @param _value the amount of money to burn
 */
function burnFrom(address _from, uint256 _value) public returns (bool success) {
	require(balanceOf[_from] >= _value);                // Check if the targeted balance is enough
	require(_value <= allowance[_from][msg.sender]);    // Check allowance
	balanceOf[_from] -= _value;                         // Subtract from the targeted balance
	allowance[_from][msg.sender] -= _value;             // Subtract from the sender's allowance
	totalSupply -= _value;                              // Update totalSupply
	Burn(_from, _value);
	return true;
}
}
```

部署代币合约
=======

部署代币合约有两种方式，一种是使用客户端的钱包，一种是使用 Remix + MetaMask 钱包，我们今天采用后者, 如果你还没有安装 MetaMask 钱包。请先到
Chrome 浏览器插件中心去安装, 点击 [这里](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) 直接去到
钱包安装页面。安装完成之后选择 __Ropsten Test Net__ 测试网络。

<img class="img-view" data-src="/images/2018/07/metamask-net.png" src="/images/1px.png" />

然后点击 "Buy" 按钮去免费获取 ETH 

<img class="img-view" data-src="/images/2018/07/metamask-buy.png" src="/images/1px.png" />

> __然后拷贝合约代码到 Remix__，选择测试网络和发币账号，传入参数之后点击 "create"


<img class="img-view" data-src="/images/2018/07/remix-token.png" src="/images/1px.png" />

> 点击创建之后，MetaMask 钱包会弹出一个让你确认的弹框， 你点击 SUBMIT (确认发送交易)

<img class="img-view" data-src="/images/2018/07/metamask-submit.png" src="/images/1px.png" />

> 确认发送交易之后，控制台会有输出，表示你发送了一个交易，右边也出现一条待确认的交易

<img class="img-view" data-src="/images/2018/07/remix-appending.png" src="/images/1px.png" />

> 合约发布成之后会返回合约的 API

<img class="img-view" data-src="/images/2018/07/remix-create-contract.png" src="/images/1px.png" />

> 这里需要提一下的是，测试网络一般返回的快一些，一般一分钟之内会返回创建结果。但是如果你是在主网发布合约的话，堵塞个半天都有可能。

合约创建之后，点击右边的按钮复制和合约地址，然后打开你的 MetaMask 钱包，选择 TOKENS 菜单，添加 TOKEN 

<img class="img-view" data-src="/images/2018/07/metamask-add-token.png" src="/images/1px.png" />

> 在弹出的页面输入刚刚复制的合约地址，然后它会自动加载到你代币的标志(Symbol), 点击添加就 OK 了

<img class="img-view" data-src="/images/2018/07/metamask-add-token2.png" src="/images/1px.png" />

> 再返回到 MetaMask 的 TOKENS 栏，发现已经有代币了。其他两个是我之前测试的时候发的。

<img class="img-view" data-src="/images/2018/07/metamask-add-token3.png" src="/images/1px.png" />

> 最后贴出一张开头的那张图，只不过这个代币是我们自己发的。

<img class="img-view" data-src="/images/2018/07/create-token-fininsh.png" src="/images/1px.png" />

需要说明的是，由于是刚刚创建，所以没有任何代币发送记录，接下来你就可以拿着这代币去 I(割)C(韭)O(菜) 了。

__《完》__



