---
layout: post
title: Solidity 的全局变量
categories: [以太坊]
tags: [solidity]
status: publish
type: post
published: true
author: blackfox
permalink: /20180619/solidity-global-var.html
keyword: solidity
desc: solidity 的全局变量
---

&emsp;&emsp;在用 solidity 编写智能合约的时候，有些特殊变量和函数永远存在于全局中，整体来说分为一下几类。

### 1.区块和交易属性

* block.blockhash(unit blockNumber) returns (bytes32). 给定区块的哈希值，只支持最近的256个区块。
* block.coinbase(address) 当前区块旷工的地址
* block.difficulty(unit) 当前的区块的难度值
* block.gaslimit(unit) 当前区块的 gas 上限
* block.number(unit) 当前区块的序号(高度)
* block.timestamp(unit) 当前区块的时间戳
* msg.data(bytes) 完整的调用数据里存储的函数以及其实参
* msg.gas(unit) 当前剩余的 gas 
* msg.sender(address) 当前调用发起人的地址
* msg.sig(bytes4) 调用数据的前4个字节
* msg.value(unit) 这个消息所附带的货币量，单位为 wei
* now(unit) 当前区块的时间戳，等同于 block.timestamp
* tx.gasprice(unit) 交易的gas价格
* tx.origin(address) 交易的发起人(完整的调用链)

### 2.地址相关

* <address>.balance(unit256) 地址余额，单位为 wei
* <address>.send(unit256 amount) returns(bool) 发送指定数量的 wei 到地址，失败时返回 false.
__不过这里发送是低级对等的转账。 如果执行失败，当前合约将不会以异常方式停止__

### 3.合约相关

* this: 当前合约，可以显式的转换成地址
* selfdestruct(address recipient) 销毁当前合约，把其中的资金发送到指定的地址。



