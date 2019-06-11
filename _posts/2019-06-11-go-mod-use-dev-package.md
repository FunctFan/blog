---
layout: post
title: Go Module 引入本地自定义包
categories: [Golang]
tags: [Go Module]
status: publish
type: post
published: true
author: blackfox
permalink: /20190611/go-mod-use-dev-package.html
desc: Go Module 引入本地自定义包, Go Module 使用详解
--- 

最近由于项目要求，需要对 `IPFS` 源码进行修改，由于自己在此之前没有接触过 Go 语言，在使用 `go mod` 导入本地自己开发的工具包的时候折腾了好久才搞定。
记录一下，以备后期查阅。
Go 语言的 Module 新特性是在 go1.11 的发布之后才支持的，这是 Go 语言新的一套依赖管理系统。

文章导读
* TOC
{:toc}

# 1. 启用 Go Module
首先在默认情况下，`$GOPATH` 默认情况下是不支持 go mudules 的，当你执行 `go mod init` 的时候会遇到如下错误：

> go: modules disabled inside GOPATH/src by GO111MODULE=auto; see 'go help modules'

我们需要在执行 `go mod` 命令之前，导出 `GO111MODULE` 环境变量，你可以直接临时一次性导出，
为了后面方便，建议直接在 `~/.bashrc` 文件中导出， 在文件末尾加入：

```shell
export GO111MODULE=on
```
从这也表明了 go 将来是要利用 modules 机制去消灭 `$GOPATH` 的。

# 2. 创建 Go Module

我们现在 `$GOPATH` 下面先创建一个项目，并初始化 module 

```shell
mkdir $GOPATH/src/gitee.com/rockyang/testmod -p
cd $GOPATH/src/gitee.com/rockyang/test-gomod
go mod init gitee.com/rockyang/test-gomod
go: creating new go.mod: module gitee.com/rockyang/testmod
```
这时，我们新建的项目已经成为了一个 module 了，我们可以在项目中随便写几个函数导出测试。

Note: 我这里使用的是[码云](https://gitee.com/)做项目托管，没有使用 github，国内码云确实比 github 快得多。

接下来你可以选择把项目推送到远程仓库，如果你的仓库是公开的话，别人就是可以直接使用 `go get` 命令去下载你的项目了。

如果是私有项目只想给内部使用，则你可以参考我的这篇博客的做法。[Go Module 使用私有仓库作为项目依赖包](/21090611/go-mod-use-private-package.html)

# 3. Go Module 版本规则

go modules 是一个版本化依赖管理系统，版本需要遵循一些规则，打开一个 `go.mod` 文件，你会发现类似下面的依赖规则：

```shell
require (
	github.com/filecoin-project/go-leb128 v0.0.0-20190212224330-8d79a5489543
	github.com/golang/mock v1.2.0 // indirect
	github.com/ipfs/go-bitswap v0.0.2
	github.com/libp2p/go-stream-muxer v0.0.1
	github.com/minio/blake2b-simd v0.0.0-20160723061019-3f5f724cb5b1
	gotest.tools v2.2.0+incompatible // indirect
)
```
依赖规则由两个部分组成，前面一部分是包路径，后面一部分表示的是版本号。
你会发现有两种版本号，一种是我们很熟悉的 git 标签，比如 `v0.0.2`，另一种就比较复杂一些，它是：**版本号 + 时间戳 +hash**
比如：`v0.0.0-20190212224330-8d79a5489543`，它其实是精准的对应着一个 `git log` 记录，后面的哈希是去提交哈希的前 12 位。

比如我当前的提交记录是这样的：

```shell
$ git log 
commit 4c55783279db32be4f02e193713d5a862b96db85 (HEAD -> master, origin/master)
Author: yangjian <yangjian102621@gmail.com>
Date:   Mon Jun 10 18:34:14 2019 +0800
```
则我的最新版本号应该为 `v0.0.0-20190610103414-4c55783279db`

# 4. 引入本地依赖包

前面铺垫了这么多，接下来回到我们的主题，我该怎样使用我们自己开发的工具包呢？ 假设我们有一个新的项目 `testmod-demo`，现在想要在新的项目中使用
testmod 中的工具包，那么首先我们需要使用 `go mod` 初始化该项目：

```shell 
cd testmod-demo
go mod init gitee.com/rockyang/testmod-demo
```
初始化之后会在当前项目根目录生成一个 `go.mod`，接下来我们有两种方式去引入 testmod 包，一种是直接修改 `go.mod` 文件，在 require 配置中添加上

```shell
gitee.com/rockyang/testmod v0.0.0-20190610103414-4c55783279db
```

或者使用 `go mod edit` 命令修改依赖

```shell
go mod edit -require="gitee.com/rockyang/testmod@v0.0.0-20190610103414-4c55783279db"
go mod tidy # 整理依赖包
```

# 5. 使用 replace 将远程包替换为本地包服务

这时如果你执行 `go build` 的时候会报错，提示找不到 `gitee.com/rockyang/testmod`，是因为你没有把仓库推送到远程，所以无法下载。
go module 提供了另外一个方案, 使用 replace, 编辑 go.mod 文件，在最后面添加：
`replace gitee.com/rockyang/testmod => /gopath/src/gitee.com/rockyang/testmod`

```shell
module gitee.com/rockyang/testmod-demo

go 1.12

require (
    github.com/gin-gonic/gin v1.3.0
	gitee.com/rockyang/testmod@v0.0.0-20190610103414-4c55783279db
    golang.org/x/net v0.0.0-20190320064053-1272bf9dcd53 // indirect
)

replace gitee.com/rockyang/testmod => /gopath/src/gitee.com/rockyang/testmod
```

> 这里的 /gopath/src/gitee.com/rockyang/testmod 是本地的包路径

然后再执行 `go build` 你会看到你想要的结果。






