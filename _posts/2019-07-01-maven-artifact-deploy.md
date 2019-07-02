---
layout: post
title: 发布 Maven 构件到中央仓库
categories: [FunnyTools]
tags: [maven, oss]
status: publish
type: post
published: true
author: blackfox
permalink: /20190701/maven-artifact-deploy.html
desc: 如何发布 Maven 构件到中央仓库
---

我们经常会在公司内部写一些 Java 组件/工具，通过安装到本地或者发布到公司的 maven 私服，其他同事就可以在 `pom.xml` 文件引入你的组件了。
但是如果你想把这个组件（工具）开源，给更多的小伙伴使用，那你就得把你的构件发布到 Maven 中央仓库。

本文详细介绍如何发布自己的 maven 构件到中央仓库。

文章导读
* TOC
{:toc}

# 注册Sonatype的账户
maven 中央仓库是有一个叫做 Sonatype 的公司在维护的，在发布构件之前需要 注册一个账号， 记住自己的用户名和密码，以后要用。

注册地址：[https://issues.sonatype.org/secure/Signup!default.jspa](https://issues.sonatype.org/secure/Signup!default.jspa)

同时，还要记住一个地址，将来在查询自己所发布构件状态和进行一些操作的时候要使用

[https://oss.sonatype.org/](https://oss.sonatype.org/)


# 提交发布申请

提交申请，在这里是创建一个issue的形式，创建地址：

[https://issues.sonatype.org/secure/CreateIssue.jspa?issuetype=21&pid=10134](https://issues.sonatype.org/secure/CreateIssue.jspa?issuetype=21&pid=10134)

在填写issue信息的时候，有一些需要注意的地方：

1. "group id" 就是别人在使用你的构件的时候在 pom.xml 里面进行定位的坐标的一部分，最好是自己的域名倒序，如: org.rockyang，
如果自己没有域名就填写自己在 github 的域名：io.github + {你在 github 的用户名}，如：io.github.yangjian102621
2. "project url" 是这个项目站点，填写你的 github 项目地址即可。
3. "SCM url" 这个一般就是你的项目的 clone 地址，比如我的是 [https://github.com/yangjian102621/mybatis-kits.git](https://github.com/yangjian102621/mybatis-kits.git) 

提交之后需要等工作人员离开确认。如果你填写的是自己的域名，工作人员会问你是不是真的是自己的域名，你需要向他证明你确实拥有这个域名。
一般就是让你做个 `TXT ` 解析或者做个重定向到你的 `github Pages` 页面。

下面是我的 issue 地址，不知道怎么填的同学请直接参考我的：

[https://issues.sonatype.org/browse/OSSRH-49428](https://issues.sonatype.org/browse/OSSRH-49428)

需要说明的是，由于我用是 `.org` 域名，在国内自 2018年起，`org` 域名无法实名认证，也不能备案，导致我的域名无法解析，所以我不得不提供
域名证书，解析证明这些，工作人员才给我审核通过。

**所以，如果你也是 org 域名，建议你先从阿里云这些地方转出到国外的域名运营商。否则你也会无法解析**

审核通过以后，你会收到如下回复：

![](/images/1px.png){:data-src="http://blog.img.r9it.com/image-e2ea4639a9c134bd5c4837dd66ecdad8.png" class="img-view"}

# 准备 GPG 秘钥

上传构件的时候需要 GPG 秘钥进行签名，所以我们需要先生成 GPG 秘钥:

```bash
gpg --gen-key

gpg (GnuPG) 2.2.4; Copyright (C) 2017 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Note: Use "gpg --full-generate-key" for a full featured key generation dialog.

GnuPG needs to construct a user ID to identify your key.

Real name: yangjian
Email address: rock@qq.com
You selected this USER-ID:
    "yangjian <rock@qq.com>"

Change (N)ame, (E)mail, or (O)kay/(Q)uit? O

generator a better chance to gain enough entropy.
gpg: key 9E81A728737D0E7F marked as ultimately trusted
gpg: directory '/home/rock/.gnupg/openpgp-revocs.d' created
gpg: revocation certificate stored as '/home/yangjian/.gnupg/openpgp-revocs.d/52433C774B2B9FFEFB722F269E81A728737D0E7F.rev'
public and secret key created and signed.

pub   rsa3072 2019-06-16 [SC] [expires: 2021-06-15]
      52433C774B2B9FFEFB722F269E81A728737D0E7F
uid                      yangjian <rock@qq.com>
sub   rsa3072 2019-06-16 [E] [expires: 2021-06-15]
```

需要输入姓名、邮箱等字段，其它字段可使用默认值，此外，还需要输入一个 Passphase，相当于一个密钥库的密码， 一定不要忘了，也不要告诉别人，
最好记下来，因为后面发布构件的时候会用到。

> Note: 生成秘钥后你需要把你公钥发布到公钥服务器托管，`sonatype` 支持很多服务器，如 `ubuntu`, `keyservers` 等。

```bash
gpg --keyserver hkp://keyserver.ubuntu.com --send-keys 9E81A728737D0E7F
```

发布之后你可以使用下面的命令验证是否发布成功

```bash
gpg --keyserver hkp://keyserver.ubuntu.com --recv-keys 9E81A728737D0E7F
```

如果看到类似下面的输出，则说明已经发布成功了

```bash
gpg: key 9E81A728737D0E7F: "RockYang <yangjian102621@gmail.com>" not changed
gpg: Total number processed: 1
gpg:              unchanged: 1
```

# 配置 settings.xml

# 修改项目的 pom.xml 文件

# 上传构件到 OSS

# 在 OSS 中发布构件

# 通知 sonatype 关闭 issue 

![](/images/1px.png){:data-src="http://blog.img.r9it.com/image-dd5c09811cad418528df69536ecd653a.png" class="img-view"}

# 搜索并使用构件

# 下次再发布

# 添加自动发布构建 maven 插件

# 参考链接
* [https://www.xncoding.com/2018/01/27/tool/maven-central.html](https://www.xncoding.com/2018/01/27/tool/maven-central.html)

