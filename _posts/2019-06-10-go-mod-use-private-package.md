---
layout: post
title: Go Module 使用私有仓库作为项目依赖包
categories: [Golang]
tags: [Go Module]
status: publish
type: post
published: true
author: blackfox
permalink: /21090611/go-mod-use-private-package.html
desc: Go Module 使用私有仓库作为项目依赖包
--- 

在开发过程中会有一些公司的中间件项目被很多项目依赖引入，但是这项项目很多往往是私有项目，私有项目是无法通过 `god mod` 下载依赖。

本文以码云上的私有项目为例，讲述如何解决这个问题。


# 1. 设置 SSH 公钥

我们首先通过设置 SSH 公钥来解决私有项目授权问题。这样 `go mod` 拉取项的时候就不会有权限问题了。码云设置 SSH 公钥很简单，不会的同学请参考
官方教程 [SSH 公钥设置](https://gitee.com/help/articles/4191#article-header0)。

# 2. 配置 git 将请求从 https 转换为 ssh
git 默认是使用 http 协议 clone 项目的，所以我们需要更改指定项目的请求方式，假设项目名称为 `testmod`:

```bash
git config --global url."git@gitee.com:rockyang/testmod.git".insteadOf "https://gitee.com/rockyang/testmod.git"
```

接下来你就可以试着去拉取你码云私有项目 `testmod` 的代码了。

```bash
go get -u -v gitee.com/rockyang/testmod

Fetching https://gitee.com/rockyang/testmod?go-get=1
Parsing meta tags from https://gitee.com/rockyang/testmod?go-get=1 (status code 200)
get "gitee.com/rockyang/testmod": found meta tag get.metaImport{Prefix:"gitee.com/rockyang/testmod", VCS:"git", RepoRoot:"https://gitee.com/rockyang/testmod.git"} at https://gitee.com/rockyang/testmod?go-get=1
go: finding gitee.com/rockyang/testmod latest
Fetching https://gitee.com/rockyang?go-get=1
Parsing meta tags from https://gitee.com/rockyang?go-get=1 (status code 200)
get "gitee.com/rockyang": found meta tag get.metaImport{Prefix:"gitee.com/rockyang", VCS:"git", RepoRoot:"https://gitee.com/rockyang"} at https://gitee.com/rockyang?go-get=1
Fetching https://gitee.com?go-get=1
Parsing meta tags from https://gitee.com?go-get=1 (status code 200)
```
你会发现，已经可以正常拉取了。


