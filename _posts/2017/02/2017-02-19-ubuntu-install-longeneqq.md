---

layout: post
title: "ubuntu 安装Wine longene QQ 7.8 和微信"
categories: [操作系统]
tags: [longeneqq]
status: publish
type: post
published: true
author: blackfox
permalink: 20170219/ubuntu-install-qq2013.html
keyword : longene,QQ2013,QQ7.8
desc : "ubuntu 安装Wine longene QQ 7.8"

---

毫无疑问，在linux系统环境下编程是非常愉快的。所以它应该是程序员的首选工作操作系统，但是作为开发人很尴尬的问题就是我们要和其他部门人员沟通总是或多或少要使用QQ这个神奇的聊天工具，而偏偏企鹅公司并没有打算开发linux版本的qq(可能是因为linux软件是开源不收费的原因）。几经折腾，在ubuntu 14.04 LTS上安装成功了，记录一下步骤。
	
1.下载deb安装包
======
直接去longene 官网下载就好了

WineQQ7.8-20151109-Longene：<a href="WineQQ7.8-20151109-Longene：http://www.longene.org/download/WineQQ7.8-20151109-Longene.deb">http://www.longene.org/download/WineQQ7.8-20151109-Longene.deb</a>

下载完之后直接 dpkg -i WineQQ7.8-20151109-Longene.deb 

如果是16.04LTS版本的系统，就执行

```bash
sudo gdebi WineQQ7.8-20151109-Longene.deb
```

安装完之后你会发现无法启动，这是因为你还有依赖没有安装。

2.安装依赖
========

很显然，你首先要安装wine,
因为没有linux版本的qq，所以你要在linux系统下模拟windows运行环境。这里你需要安装1.7以上的版本

```bash
sudo add-apt-repository ppa:ubuntu-wine/ppa
sudo apt-get update
sudo apt-get install wine1.7 winetricks
```

根据官网的教程，如果是64位的系统，那你需要安装32的依赖 <code
class="scode">ia32-libs</code>. 

```bash
sudo apt-get install ia32-libs
```

结果你可能遇到类似的报错

```bash
E: Package 'ia32-libs' has no installation candidate
```

这是因为ia32-libs这个包已经被取消了，直接装对应的32位包就行了：

```bash
sudo apt-get install libgtk2.0-0:i386
```
安装成功就OK了。

接下来就可以启动qq了。

<img data-src="/images/2017/02/qq-01.png" class="img-view" src="/images/1px.png" />


3.显示状态栏
========
一个令人尴尬的问题是，登陆qq之后，在顶部的状态栏并没有显示qq图标，这意味着你关闭qq窗口之后再也找不到它了。这是因为Ubuntu
Unity
添加了软件图标白名单，因此部分软件的图标无法在任务栏中显示。解决办法如下：

```bash
# 安装indicator-systemtray-unity
sudo apt-add-repository ppa:fixnix/indicator-systemtray-unity
sudo apt-get update
sudo apt-get install indicator-systemtray-unity
# 安装图形界面设置工具
sudo apt-get install dconf-editor
```

安装完毕之后，搜索软件Dconf-Editori (或者直接再终端输入 dconf-editor 命令)，在net > launchpad > indicator >
systemtray 中设置显示图标的位置，下面贴出我的配置, 仅供参考:

<img class="img-view" data-src="/images/2017/02/qq-install-02.png" src="/images/1px.png" />

至此，安装过程结束。

重启系统，启动qq，这时你就回发现顶部的状态栏上面出现qq图标了。

本人亲测，这个版本的qq使用起来很流畅，发表情，截图，文件都没有问题，完全可以跟windows系统qq相媲美了。

4.添加微信app
=====
有了qq之后你可能还会想，要是有微信就更好了。这个其实很容易，在google chrome浏览器添加一个微信app就好了。

首先在google应用中心搜索 <code class="scode">wechat</code>, 如图：

<img class="img-view" data-src="/images/2017/02/qq-install-04.png" src="/images/1px.png" />

然后点击微信app旁边的添加按钮。

添加完之后在<code class="scode">App</code> 中心就可以看到微信了，点击打开就好了

<img class="img-view" data-src="/images/2017/02/qq-install-03.png" src="/images/1px.png" />

如果你找不到应用中心的话，那就直接在浏览器地址栏输入：

```bash
chrome://apps/
```

最后，贴上一个我安装完之后的效果图：

<img class="img-view" data-src="/images/2017/02/qq-install-05.png" src="/images/1px.png" />

那么问题来了，看完这篇文章你是不是觉得又多了一个彻底抛弃windows的理由了呢。O(∩_∩)O~

欢迎在留言区写下你的想法.

<strong>《完》</strong>



