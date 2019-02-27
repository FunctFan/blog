---
layout: post
title: IPFS 系列03-搭建 FILECOIN 挖矿节点
categories: [IPFS]
tags: [IPFS,FILECOIN]
status: publish
type: post
published: true
author: blackfox
permalink: /20190227/getstart-with-filecoin.html
keyword: getstart-with-filecoin, 搭建 FILECOIN 挖矿节点

---

本文介绍如何在计算机上安装和运行 Filecoin 节点。后续教程将介绍如何使用您的节点进行 Filecoin 挖矿或存储数据。

# 安装 Filecoin 
Filecoin 目前有两种安装方式，一种是直接下载编译好的可执行文件，另一种是通过编译源码安装。

### 下载可执行文件
官网有直接编译好的 release 版本 v0.0.1
下载地址为: [https://github.com/filecoin-project/go-filecoin/releases](https://github.com/filecoin-project/go-filecoin/releases)

不过遗憾的是，官方编译的0.0.1(写本文时的最新版本)无法正常运行(本人是用 linux 测试)。我自己手动编译了一个版本，基于 commit 
`94b2894473e57c44d60164f89f417694ea3911db`。 下载地址为: [百度云盘](https://pan.baidu.com/s/1Nf9hqqXDfw6u2aP3Lu1xuA)

### 手动编译
手动编译需要比较长的时间(本人花了大概一个半小时)，根据网络的而定。

> 一、安装依赖

> 首先 go-filecoin 是用 GO 语言编写，所以第一步你需要搭建 Go 语言环境

去 Go 官网下载二进制安装包， [https://dl.google.com/go/go1.11.5.linux-amd64.tar.gz]，然后解压：

```bash
tar xvf go1.11.5.linux-amd64.tar.gz -C /usr/local/ 
```

然后配置环境变量 `sudo vim /etc/profile`, 在文件末尾加上

```bash
# golang environment configure
export GOROOT=/usr/local/go
export GOBIN=$GOROOT/bin
export GOPKG=$GOROOT/pkg/tool/linux_amd64
export GOARCH=amd64
export GOOS=linux 
export GOPATH=/golang/
PATH=$PATH:$GOBIN:$GOPKG
```
GOPATH 是你所有 Go 项目的根目录，保存之后重启或者执行 `source /ect/profile` 使配置生效。

> 安装 Rust, cargo

```bash
curl https://sh.rustup.rs -sSf | sh
```

> 安装 jq

```bash
sudo apt-get install jq
```

> 下载 go-filecoin 源码

> 开始编译

由于 Filecoin 项目用来很多第三方的开发包，而这些包通常国内的网络是无法访问的，所以你得保证你的终端是能够翻墙的。

不知道配置终端翻墙的同学请移步[linux 配置终端代理](/20190121/proxy-in-terminal.html)

# 开始运行 Filecoin

# 给你的节点自定义名称

# 激活节点，加入网络统计

# 获取 Filecoin 测试代币(Mock FIL)


