---

layout: post
title: "Ubuntu上如何检测某个软件包是否安装"
categories: [系统运维]
tags: [Ubuntu,dpkg]
status: publish
type: post
published: true
author: blackfox
permalink: /20161012/check-soft-installed.html
keyword : ubuntu,dpkg,检测软件包
desc : ubuntu上如何检测某个软件包是否安装

---

记得初学linux的时候，到网上去查找"linux如何查询某个软件包是否安装"， 结果出来90%的都是 <code class="scode">rpm -qa</code>, 然后把这条命令在自己的终端敲出来的时候每次都是很遗憾的命名没有找到。后来才知道，原来我使用的是ubuntu发行版，<code class="scode">rpm</code>是centOS的软件包管理机制。Ubuntu 应该使用 dpkg来查询。

在本篇中，让我们看下如何在基于DEB的系统下检查是否安装了一个包。

要查询特定的安装包，比如说vim是否被安装，使用下面这个命令：

```bash
dpkg -s vim
```
终端输出结果

```bash
Package: vim
Status: install ok installed
Priority: optional
Section: editors
Installed-Size: 2400
Maintainer: Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>
Architecture: amd64
Version: 2:7.4.1689-3ubuntu1.1
Provides: editor
Depends: vim-common (= 2:7.4.1689-3ubuntu1.1), vim-runtime (= 2:7.4.1689-3ubuntu1.1), libacl1 (>= 2.2.51-8), libc6 (>= 2.15), libgpm2 (>= 1.20.4), libpython3.5 (>= 3.5.0~b1), libselinux1 (>= 1.32), libtinfo5 (>= 6)
Suggests: ctags, vim-doc, vim-scripts
Description: Vi IMproved - enhanced vi editor
Vim is an almost compatible version of the UNIX editor Vi.
.
Many new features have been added: multi level undo, syntax
highlighting, command line history, on-line help, filename
completion, block operations, folding, Unicode support, etc.
.
This package contains a version of vim compiled with a rather
standard set of features.  This package does not provide a GUI
version of Vim.  See the other vim-* packages if you need more
(or less).
Homepage: http://www.vim.org/
Original-Maintainer: Debian Vim Maintainers <pkg-vim-maintainers@lists.alioth.debian.org>

```
能输出详细的安装信息，则说明你要查询的软件包已经安装了，否则，如果安装包不存在，则会输出如下内容：

```bash
dpkg-query: package 'vims' is not installed and no information is available
Use dpkg --info (= dpkg-deb --info) to examine archive files,
and dpkg --contents (= dpkg-deb --contents) to list their contents.
```

你还可以使用dpkg-query 命令。这个命令会有一个更好的输出，当然，你可以用通配符

```bash
dpkg-query -l vim
```

输出结果：

```bash

Desired=Unknown/Install/Remove/Purge/Hold
| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend
|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)
||/ Name                     Version           Architecture      Description
+++-========================-=================-=================-=====================================================
ii  vim                      2:7.4.1689-3ubunt amd64             Vi IMproved - enhanced vi editor
```

要列出你系统中安装的所有包，输入下面的命令：

```bash
dpkg --get-selections
```

输出结果类似：

```bash
xinit						install
xinput						install
xkb-data					install
xml-core					install
xorg						install
xorg-docs-core					install
xorg-sgml-doctools				install
xserver-common					install
xserver-xorg					install
xserver-xorg-core				install
xserver-xorg-input-all				install
xserver-xorg-input-evdev			install
xserver-xorg-input-synaptics			install
xserver-xorg-input-vmmouse			install
xserver-xorg-input-wacom			install
xserver-xorg-video-all				install
xserver-xorg-video-amdgpu			install
xserver-xorg-video-ati				install
xserver-xorg-video-fbdev			install
xserver-xorg-video-intel			install
xserver-xorg-video-nouveau			install
xserver-xorg-video-qxl				install
xserver-xorg-video-radeon			install
xserver-xorg-video-vesa				install
xserver-xorg-video-vmware			install
xterm						install
xtrans-dev					install
xul-ext-ubufox					install
xz-utils					install
yelp						install
yelp-xsl					install
zeitgeist-core					install
zeitgeist-datahub				install
zenity						install
zenity-common					install
zip						install
```

你同样可以通过grep来过滤割到更精确的包。比如，我想要使用dpkg命令查看系统中安装的gcc包：

```bash
dpkg --get-selections | grep gcc
```
输出结果类似:

```bash
gcc						install
gcc-5						install
gcc-5-base:amd64				install
gcc-5-base:i386					install
gcc-6-base:amd64				install
gcc-6-base:i386					install
libgcc-5-dev:amd64				install
libgcc1:amd64					install
libgcc1:i386					install
```

此外，你可以使用“-L”参数来找出包中文件的位置。


```bash
dpkg -L vim
```

输出结果类似：

```bash
/.
/usr
/usr/bin
/usr/bin/vim.basic
/usr/share
/usr/share/bug
/usr/share/bug/vim
/usr/share/bug/vim/presubj
/usr/share/bug/vim/script
/usr/share/lintian
/usr/share/lintian/overrides
/usr/share/lintian/overrides/vim
/usr/share/doc
/usr/share/doc/vim
```



