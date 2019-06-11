---
layout: post
title: 如何在以太坊上验证你的智能合约代码
categories: [以太坊]
tags: [合约验证]
status: publish
type: post
published: true
author: blackfox
permalink: /20180827/verify-contract-code.html
keyword: 合约验证
desc: 验证以太坊合约代码
---

我们知道一般来说你如果你要用你在以太坊上发布的 ERC20 代币进行 ICO, 或者需要发布一款如 FOMO3D 这样的 DApp 游戏，你就必须开源你的合约代码。

所谓开源合约代码就是把你的合约代码在以太坊官网 [https://etherscan.io](https://etherscan.io) 进行合约验证(Verify Contract Code).

至于为什么要开源，是因为要想有足够多的人参与你的这个资金游戏(ICO 也是一种资金游戏), 你就必须向公众证明以下两点：

> 1、所有游戏规则都是公开透明的，童嫂无欺 <br />
2、我们不是来割韭菜的

至于是不是真的不割韭菜，那只有天晓得了，因为大佬要割你，有1000种方法，只不过你感觉不出来被割而已。

回到合约验证的问题，我们这里默认你是从0开始，当然如果你已经发完代币了，请直接跳过前两步。

> 第一步，首先你得准备发合约的代码, 简单起见我下面贴一个简单的 ERC20 代币的合约代码

```javascript
pragma solidity ^ 0.4.16;

interface tokenRecipient {
    function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) external;
}

contract TokenERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18; 
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);

    constructor(uint256 initialSupply, string tokenName, string tokenSymbol) public {
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        name = tokenName; 
        symbol = tokenSymbol;
    }

    function _transfer(address _from, address _to, uint _value) internal {
        require(_to != 0x0);
        require(balanceOf[_from] >= _value);
        require(balanceOf[_to] + _value > balanceOf[_to]);

        uint previousBalances = balanceOf[_from] + balanceOf[_to];
        // Subtract from the sender
        balanceOf[_from] -= _value;
        // Add the same to the recipient
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);

        assert(balanceOf[_from] + balanceOf[_to] == previousBalances);
    }

    function transfer(address _to, uint256 _value) public {
        _transfer(msg.sender, _to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success) {
        require(_value <= allowance[_from][msg.sender]); // Check allowance
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public
    returns(bool success) {
        allowance[msg.sender][_spender] = _value;
        return true;
    }

    function approveAndCall(address _spender, uint256 _value, bytes _extraData)
    public
    returns(bool success) {
        tokenRecipient spender = tokenRecipient(_spender);
        if (approve(_spender, _value)) {
            spender.receiveApproval(msg.sender, _value, this, _extraData);
            return true;
        }
    }

    function burn(uint256 _value) public returns(bool success) {
        require(balanceOf[msg.sender] >= _value); // Check if the sender has enough
        balanceOf[msg.sender] -= _value; // Subtract from the sender
        totalSupply -= _value; // Updates totalSupply
        emit Burn(msg.sender, _value);
        return true;
    }

    function burnFrom(address _from, uint256 _value) public returns(bool success) {
        require(balanceOf[_from] >= _value); // Check if the targeted balance is enough
        require(_value <= allowance[_from][msg.sender]); // Check allowance
        balanceOf[_from] -= _value; // Subtract from the targeted balance
        allowance[_from][msg.sender] -= _value; // Subtract from the sender's allowance
        totalSupply -= _value; // Update totalSupply
        emit Burn(_from, _value);
        return true;
    }
}
```

> 第二步, 发布合约

把合约代码拷贝到 remix 编辑器，点击 "Start to compile", 编译合约，然后点击 "detail" 查看合约详情，找到 BYTECODE

<img class="img-view" data-src="/images/2018/08/step-1.png" src="/images/1px.png" />

然后切换到 run 选项卡，设置好网路，填好合约构造函数参数，点击 create

<img class="img-view" data-src="/images/2018/08/step-2.png" src="/images/1px.png" />

在 metamask 钱包弹出的对话框中点击 comfirm (确认)

<img class="img-view" data-src="/images/2018/08/step-3.png" src="/images/1px.png" />

过一会会提示合约发布成功

合约发布成功之后，这时我们可以复制发布合约的 transaction 的 input 字段，后面验证合约的时候用到

<img class="img-view" data-src="/images/2018/08/step-3-3.png" src="/images/1px.png" />

> 第三步，验证合约

合约发布之后，打开以太坊官网，由于我这里选择的是测试网络，我就打开测试网络官网。回到 remix 窗口，复制合约地址。

<img class="img-view" data-src="/images/2018/08/step-3-1.png" src="/images/1px.png" />

粘贴搜索合约地址，点击 code 选项卡

<img class="img-view" data-src="/images/2018/08/step-3-5.png" src="/images/1px.png" />

这时候因为你的合约代码没有验证，因此它会提示你去"Verify And Publish"的链接 , 点击该链接跳转到验证页面，按照如下图片去填写验证信息

<img class="img-view" data-src="/images/2018/08/step-3-2.png" src="/images/1px.png" />

需要说明的是 "Constructor Arguments ABI-encoded " 这个选项，__本人在这里被坑了好久__  这个 Constructor Arguments ABI-encoded 有两种方法可以得到

方法一：对比第一步的 BYTECODE 和 第二步的 input，__其实这两者都是合约的字节码，只不过 input 包含了创建合约时的构造参数__，那么此时 input 后面多出
的一串字节码就是 Constructor Arguments ABI-encoded.

方法二就比较简单了，直接到这个网站 [https://abi.hashex.org/](https://abi.hashex.org/) ，这是一个在线生成 ABI 字节码的工具，把你发布合约时候传入的参数
在这里填入，自动就生成了 Constructor Arguments ABI-encoded.

<img class="img-view" data-src="/images/2018/08/step-3-4.png" src="/images/1px.png" />

> 步骤四，填好这些信息之后直接提交就 OK 了.

最后通过验证之后就是这个样子了

<img class="img-view" data-src="/images/2018/08/step-4.png" src="/images/1px.png" />










