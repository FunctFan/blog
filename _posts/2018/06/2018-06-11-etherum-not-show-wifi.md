---
layout: post
title: ubuntu 16.06 LTS 安装以太坊钱包之后不显示 WIFI 列表
categories: [系统运维]
tags: [以太坊]
status: publish
type: post
published: true
author: blackfox
permalink: /20180611/etherum-not-show-wifi.html
keyword: 以太坊 
desc: ubuntu 16.06 LTS 安装以太坊钱包之后不显示 WIFI 列表 
---

&emsp;&emsp;今天安装完以太坊的 mist 钱包之后发现 ubuntu 的网络连接那里都不显示 WIFI 列表了，只显示了一大串的 "Ethernet Network", 虽然网络还是正常连接上
的，但是却不知道自己连了哪个 WIFI, 网上找了好久，最后在一个小的论坛上找到了解决方案，记录下来，以备不时之需。

编辑 NetworkManager.conf 文件：

```bash
sudo vim /etc/NetworkManager/NetworkManager.conf 
```

更改 managed=false 为 managed=true， 然后重启网络管理服务：

```bash
sudo service network-manager restart 
```

重启系统，发现又出现 WIFI 列表了。

Enjoy coding.


