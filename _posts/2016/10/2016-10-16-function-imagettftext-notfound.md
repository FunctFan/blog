---

layout: post
title: "解决Call to undefined function imagettftext()方法"
categories: [php]
tags: [php,imagettftext]
status: publish
type: post
published: true
author: blackfox
permalink: /20161016/imagettftext-notfound.html
keyword : php,imagettftext
desc : 解决 imagettftext not found

---

前几天系统崩溃了，重装系统之后第一件事情就是编译LNMP开发环境，当编译好php之后执行一个验证码生成的程序，结果报错"function imagettftext() not found". 搞的我一脸懵逼，因为我在编译php的时候明明添加了<code class="scode">--enable-gd</code> 这个选项的。

没有办法，那就一步一步排查把，首先打开phpinfo页面，发现gd扩展是确实有安装的。google一下，找到一个答案说是编译的时候没有加上<code class="scode">FreeType</code>. 这里顺便介绍下<code class="scode">FreeType</code>是个什么东西

> FreeType库是一个完全免费（开源）的、高质量的且可移植的字体引擎，它提供统一的接口来访问多种字体格式文件，包括TrueType, OpenType, Type1, CID, CFF, Windows FON/FNT, X11 PCF等。

也就是说gd库需要通过它来调用字体绘图。那闲话不多说，看解决办法：

首先安装 FreeType, 我这里安装的是2.4.0：

```bash
wget http://download.savannah.gnu.org/releases/freetype/freetype-2.4.0.tar.bz2
tar -jxf freetype-2.4.0.tar.bz2
cd freetype-2.4.0
./configure --prefix=/usr/local/freetype
make && make install
```
Ok,FreeType 安装搞定！

那么接下来你有2中方案去选择，第一种是直接编译php，在php configure 编译选项中加上 

```bash
--with-freetype-dir=/usr/local/freetype
```

第二种方案比较简单些，既然是GD库的扩展有问题，那么直接把gd库的扩展重新编译，为它指定freetype的路径就好了。以下假设 {php_source_dir} 为你下载的php源码的目录, {php_install_dir}

```bash
cd {php_source_dir}/ext/gd
phpize
./configure --with-freetype-dir=/usr/local/freetype --with-php-config={php_install_dir}/bin/php-config
make && make install

```
然后再在你的php配置文档中加上

```bash
extension=gd.so
```

重启php-fpm sudo service php-fpm restart

现在打开验证码页面，一切OK，全部搞定。
