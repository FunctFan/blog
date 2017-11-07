---
layout: post
title: Puppeteer 入门教程
categories: [前端开发]
tags: [nodejs, Puppeteer, webdriver]
status: publish
type: post
published: true
author: blackfox
permalink: 20171106/puppeteer.html
keyword: SpringBoot
desc: google headerless chrome nodejs API, puppeteer 入门教程
---

1、Puppeteer 简介
=======
Puppeteer 是一个node库，他提供了一组用来操纵Chrome的API, 通俗来说就是一个 headerless chrome浏览器
(当然你也可以配置成有UI的，默认是没有的)。既然是浏览器，那么我们手工可以在浏览器上做的事情 Puppeteer 都能胜任,
另外，Puppeteer 翻译成中文是"木偶"意思，所以听名字就知道，操纵起来很方便，你可以很方便的操纵她去实现：

> 1） 生成网页截图或者 PDF <br/>
2） 高级爬虫，可以爬取大量异步渲染内容的网页 <br />
3） 模拟键盘输入、表单自动提交、登高网页等，实现 UI 自动化测试
4） 捕获站点的时间线，以便追踪你的网站，帮助分析网站性能问题

如果你用过 PhantomJS 的话，你会发现她们有点类似，但Puppeteer是Chrome官方团队进行维护的，前景更好。

2、运行环境
=========
查看 Puppeteer 的官方 API 你会发现满屏的 async, await 之类，这些都是 ES7 的规范，所以你需要：
1. Nodejs 的版本不能低于 v7.6.0, 需要支持 async, await.
2. 需要最新的 chrome driver, 这个你在通过 npm 安装 Puppeteer 的时候系统会自动下载的

```shell
npm install puppeteer --save
```

3、基本用法
========
先开看看官方的入门的 DEMO

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({path: 'example.png'});

  await browser.close();
})();
```
上面这段代码就实现了网页截图，是不是觉得好简单？ 反正我是觉得比 PhantomJS 简单，至于跟 selenium-webdriver 比起来，
那更不用说了。下面就介绍一下 puppeteer 的常用的几个 API。

## 2.1 puppeteer.launch(options)
使用 puppeteer.launch() 运行 puppeteer，它会 return 一个 promise，使用 then 方法获取 browser 实例， 当然高版本的
的 nodejs 已经支持 await 了，所以上面的例子使用 await 关键字，这一点需要特殊说明一下，__Puppeteer 几乎所有的操作都是
异步的__, 为了使用大量的 then 使得代码的可读性降低，本文所有 demo 代码都是用 __async, await__ 方式实现。这个
也是 Puppeteer 官方推荐的写法。

##### options 参数详解

参数名称 | 参数说明
ignoreHTTPSErrors | 在请求的过程中是否忽略 Https 报错信息，默认为 false
headless | 是否以"无头"的模式运行 chrome, 也就是不显示 UI， 默认为 true



参考链接
======
[Puppeteer 官方API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md)

__《THE END》__










