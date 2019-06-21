---
layout: post
title: WSL NGINX + PHP-FPM 无法加载 phpinfo 页面
categories: [FunnyTools]
tags: [WSL]
status: publish
type: post
published: true
author: blackfox
permalink: /20190621/wsl-nginx-neterr.html
desc: NGINX + PHP-FPM  net::ERR_INCOMPLETE_CHUNKED_ENCODING
--- 

昨天一个偶然的原因（公司的一个 C 语言产品需要编译 windows 版本），又用了一下好久没用的 windows 系统。发现 windows 10 的 
WSL(Windows Subsystem for Linux)，翻译过来就是：适用于 Linux 的 Windows 子系统，看着挺有趣的，就在上面安装了一个 Ubuntu 子系统体验了一下。

体检结果很不错，发现它确实能做到跟宿主机（windows）无缝对接。结果我就萌生了一个想法，把公司前端之前用的开发环境 docker 容器直接换成 Ubuntu 子系统，
这样能够带来更好的开发体验。Docker 是个好东西，但是不得不说，windows 下的容器真不怎么好用，之前用它也是因为没有更好的选择。

说干就干，安装 Nginx, 安装 php ... 一路流畅务必，所有环境配置好之后，进行测试的时候，开始也很正常，非常流畅，但是在测试 php 压缩 js 方法的时候，
可能是由于输出的内容太多，虽然页面内容已经输出，但是浏览器标题栏还是一直转圈圈，大概 30 秒后浏览器控制台抛出一个异常：

```bash
net::ERR_INCOMPLETE_CHUNKED_ENCODING 
```

然后我又测试一下 phpinfo() 页面，发现也是这样，但是其他好多页面都很正常啊，有鬼。

折腾了好久，发现原来是 FastCGi 缓冲的原因，导致数据迟迟没有发送给 Nginx, 所以 Nginx 里面的日志才会有这样的报错：

```bash
upstream timed out (110: Connection timed out) while reading upstream, client: 127.0.0.1
```

> 解决方案：关闭 FastCGi 缓存

直接在 `nginx.conf` 配置的 `http` 块中添加 `fastcgi_buffering off`，然后 Every thing working well.


# 参考文献
* [https://github.com/Microsoft/WSL/issues/2100](https://github.com/Microsoft/WSL/issues/2100)


