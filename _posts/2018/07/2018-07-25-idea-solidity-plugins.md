---
layout: post
title: idea,webstrom,phpstorm solidity 插件配置
categories: [小工具, solidity]
tags: [idea, phpstorm,webstrom, solidity]
status: publish
type: post
published: true
author: blackfox
permalink: /20180725/idea-solidity-plugins.html
keyword: idea,webstrom,phpstorm solidity 
desc: IDE对solidity语法的支持
---

> __本文地址:__ [http://r9it.com/20180725/idea-solidity-plugins.html](/20180725/idea-solidity-plugins.html)

&emsp;&emsp;入坑 solidity 智能合约开发以来，一直在纠结用啥编辑器，从 vim 到 vscode, atom, 最后还是没有 webstrom 用起来顺手. 因为如果要做前端开发，webstrom
无疑是最好的选择之一。 但是 webstrom 默认是不支持 solidity 语法高亮，也不能编译 .sol 文件。需要安装 Solidity Solhint 和 Intellij-Solidity 两个插件。

直接通过 IDE 的插件管理器安装
=======

通常这无疑是最好安装方式，简单，方便。直接在插件管理器中搜索 __solidity__ 

<img class="img-view" data-src="/images/2018/07/idea-plug-install.png" src="/images/1px.png" />

然后点击右边的 "install" 按钮 Ok 了。

手动下载安装
======

通常通过 IDE 的插件管理器安装的过程不会那么流畅，一般表现为：安装时间太长，或者干脆下载失败. 

这个时候你就需要自己手动安装了，首先去这两个插件的官网分别下载安装文件，下面贴出了下载地址:

Solidity Solhint : [https://plugins.jetbrains.com/plugin/10177-solidity-solhint](https://plugins.jetbrains.com/plugin/10177-solidity-solhint)

Intellij-Solidity : [https://plugins.jetbrains.com/plugin/9475-intellij-solidity](https://plugins.jetbrains.com/plugin/9475-intellij-solidity) 

打开页面直接拉到下面的下载列表, 然后下载你所需要的版本

<img class="img-view" data-src="/images/2018/07/plug-download.png" src="/images/1px.png" /> 

这里注意两个插件的安装方式不一样， Intellij-Solidity 下载完之后是一个 zip 文件，解压后得到的是一个 lib 文件夹，里面有很多个 jar 包，你直接把这些 jar 包
拷贝到你的 IDE 的 lib 目录就好了。比如我的 webstrom 的安装目录是 /opt/webstrom2018, 那我就直接把 jar 全部拷贝到 /opt/webstrom2018/lib 目录下。

Solidity Solhint 下载完之后是一个单独的 jar 文件，这是个 安装文件， 你打开 IDE 的插件管理面板，选择 "install plugin from disk" 按钮，如下图所示,
然后选择安装包，点击确定就安装完成了.

<img class="img-view" data-src="/images/2018/07/solhint-install.png" src="/images/1px.png" />

至此，插件就全部安装完成，接下来你就可以享受智能合约的 solidity 代码高亮和提示了, 贴上一张效果图:

<img class="img-view" data-src="/images/2018/07/plug-install-complete.png" src="/images/1px.png" />



