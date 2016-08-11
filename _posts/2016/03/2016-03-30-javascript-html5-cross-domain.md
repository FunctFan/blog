---
layout: post
title: javascript 通过发送http头信息跨域
categories: [前端开发]
tags: [javascript,跨域]
status: publish
type: post
published: true
author: blackfox
permalink: /20160330/javascript-cross-domain.html
description: 通过发送http头信息来解决javascript跨域问题
---

&nbsp;&nbsp;&nbsp;&nbsp;从古至今，javascript ajax跨域问题一直是比较纠结的一个问题，虽然说网上有各种解决方案，包括设置域名，和jsonp方案，但是始终觉得实现起来有点小麻烦，html5出来之后就有一种新的解决方案，简单，粗暴，我喜欢。

到底是怎么回事呢，简单来说就是通过后端发送http头信息来解决前端的跨域操作。在网上搜索了一下这个跨域的头信息，几乎90%的都是：

```bash
Access-Control-Allow-Origin:*
```

哥一下兴喜万分啊，于是赶紧试了一下，结果发现病没什么卵用，还是提示：

```bash
XMLHttpRequest cannot load http://www.test.my/cross-domain/post.php.
Request header field X-Requested-With is not allowed by Access-Control-Allow-Headers.
```
显然，跨域是没有成功的。于是赶紧又去google了一下 “javascript 跨域头信息”， 结果发现有有篇博客上有写到需要加上以下头信息

```bash
Access-Control-Allow-Headers:x-requested-with,content-type
```

测试了以下，果然是可以跨域的，没有问题。下面贴上测试代码

<strong>前端代码：</strong>

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>js跨域请求测试</title>

	<script src="jquery.js"></script>
</head>
<body>
<script>

	$.post("http://www.test.my/cross-domain/post.php", {
		username : "zhangsan",
		password : "123456"
	}, function(data) {
		console.log(data);
	},  "json");

</script>
</body>
</html>
```

<strong>后端代码（别问我为什么用php，因为php是最好的语言O(∩_∩)O~）</strong>

```php
<?php
//发送跨域头信息,指定允许其他域名访问
header('Access-Control-Allow-Origin:*');
// 响应类型,这里可以指定，也可以不指定，不过个人觉得还是指定好一些
header('Access-Control-Allow-Methods:POST');
// 响应头设置
header('Access-Control-Allow-Headers:x-requested-with,content-type');
echo  json_encode($_POST);

```

浏览器输出的相应

Object {username: "zhangsan", password: "123456"}
