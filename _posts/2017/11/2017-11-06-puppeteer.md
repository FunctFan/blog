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

如果你用过 PhantomJS 的话，你会发现她们有点类似，但Puppeteer是Chrome官方团队进行维护的，用俗话说就是”有娘家的人“，前景更好。

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
上面这段代码就实现了网页截图，先大概解读一下上面几行代码：

1. 先通过 puppeteer.launch() 创建一个浏览器实例 Browser 对象
2. 然后通过 Browser 对象创建页面 Page 对象
3. 然后 page.goto() 跳转到指定的页面
4. 调用 page.screenshot() 对页面进行截图
5. 关闭浏览器

是不是觉得好简单？ 反正我是觉得比 PhantomJS 简单，至于跟 selenium-webdriver 比起来，
那更不用说了。下面就介绍一下 puppeteer 的常用的几个 API。


## 3.1 puppeteer.launch(options)
使用 puppeteer.launch() 运行 puppeteer，它会 return 一个 promise，使用 then 方法获取 browser 实例， 当然高版本的
的 nodejs 已经支持 await 特性了，所以上面的例子使用 await 关键字，这一点需要特殊说明一下，__Puppeteer 几乎所有的操作都是
异步的__, 为了使用大量的 then 使得代码的可读性降低，本文所有 demo 代码都是用 __async, await__ 方式实现。这个
也是 Puppeteer 官方推荐的写法。

##### options 参数详解

参数名称 | 参数类型 | 参数说明
ignoreHTTPSErrors | boolean | 在请求的过程中是否忽略 Https 报错信息，默认为 false
headless | boolean | 是否以"无头"的模式运行 chrome, 也就是不显示 UI， 默认为 true
executablePath | string | 可执行文件的路劲，Puppeteer 默认是使用它自带的 chrome webdriver, 如果你想指定一个自己的 webdriver 路径，可以通过这个参数设置
slowMo  | number | 使 Puppeteer 操作减速，单位是毫秒。如果你想看看 Puppeteer 的整个工作过程，这个参数将非常有用。
args | Array(String) | 传递给 chrome 实例的其他参数，比如你可以使用"--ash-host-window-bounds=1024x768" 来设置浏览器窗口大小。更多参数参数列表可以参考[这里](https://peter.sh/experiments/chromium-command-line-switches/)
handleSIGINT | boolean | 是否允许通过进程信号控制 chrome 进程，也就是说是否可以使用 CTRL+C 关闭并退出浏览器.
timeout | number | 等待 Chrome 实例启动的最长时间。默认为30000（30秒）。如果传入 0 的话则不限制时间
dumpio | boolean | 是否将浏览器进程stdout和stderr导入到process.stdout和process.stderr中。默认为false。
userDataDir | string | 设置用户数据目录，默认linux 是在 ~/.config 目录，window 默认在 C:\Users\{USER}\AppData\Local\Google\Chrome\User Data, 其中 {USER} 代表当前登录的用户名
env | Object | 指定对Chromium可见的环境变量。默认为process.env。
devtools | boolean | 是否为每个选项卡自动打开DevTools面板， 这个选项只有当 headerless 设置为 false 的时候有效

## 3.2 Browser 对象

当 Puppeteer 连接到一个 Chrome 实例的时候就会创建一个 Browser 对象，有以下两种方式：

Puppeteer.launch 和 Puppeteer.connect.

下面这个 DEMO 实现断开连接之后重新连接浏览器实例

```javascript
const puppeteer = require('puppeteer');

puppeteer.launch().then(async browser => {
  // 保存 Endpoint，这样就可以重新连接  Chromium
  const browserWSEndpoint = browser.wsEndpoint();
  // 从Chromium 断开连接
  browser.disconnect();

  // 使用endpoint 重新和 Chromiunm 建立连接
  const browser2 = await puppeteer.connect({browserWSEndpoint});
  // Close Chromium
  await browser2.close();
});
```

##### Browser 对象 API

方法名称 | 返回值 | 说明
browser.close() | Promise |  关闭浏览器
browser.disconnect() | void | 断开浏览器连接
browser.newPage() | Promise(Page) | 创建一个 Page 实例
browser.pages() | Promise(Array(Page)) | 获取所有打开的 Page 实例
browser.targets() | Array(Target) | 获取所有活动的 targets
browser.version() | Promise(String) | 获取浏览器的版本
browser.wsEndpoint() | String | 返回浏览器实例的 socket 连接 URL, 可以通过这个 URL 重连接 chrome 实例

好了，Puppeteer 的API 就不一一介绍了，官方提供的详细的 API， [戳这里](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md)

4、Puppeteer 实战
========
了解 API 之后我们就可以来一些实战了，在此之前，我们先了解一下 Puppeteer 的设计原理，简单来说 Puppeteer 跟 webdriver 以及 PhantomJS 最大的
的不同就是它是站在用户浏览的角度，而 webdriver 和 PhantomJS 最初设计就是用来做自动化测试的，所以它是站在机器浏览的角度来设计的，所以它们
使用的是不同的设计哲学。举个栗子，加入我需要打开京东的首页并进行一次产品搜索，分别看看使用 Puppeteer 和 webdriver 的实现流程：

__Puppeteer 的实现流程：__

1. 打开京东首页
2. 将光标 focus 到搜索输入框
3. 键盘点击输入文字
4. 点击搜索按钮

__webdriver 的实现流程：__

1. 打开京东首页
2. 找到输入框的 input 元素
3. 设置 input 的值为要搜索文字
4. 触发搜索按钮的单机事件

个人感觉 Puppeteer 设计哲学更符合任何的操作习惯，更自然一些。

下面我们就用一个简单的需求实现来进行 Puppeteer 的入门学习。这个简单的需求就是： 

> 在京东商城抓取10个手机商品，并把商品的详情页截图。

首先我们来梳理一下操作流程

1. 打开京东首页
2. 输入“手机”关键字并搜索
3. 获取前10个商品的 A 标签，并获取 href 属性值，获取商品详情链接
4. 分别打开10个商品的详情页，截取网页图片

要实现上面的功能需要用到查找元素，获取属性，键盘事件等，那接下来我们就一个一个的讲解一下。

## 4.1 获取元素
Page 对象提供了2个 API 来获取页面元素

(1). Page.$(selector) 获取单个元素，底层是调用的是 document.querySelector() , 所以选择器的 selector 格式遵循 [css 选择器规范](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)

```javascript
let inputElement = await page.$("#search", input => input);
//下面写法等价
let inputElement = await page.$('#search');
```

(2). Page.$$(selector) 获取一组元素，底层调用的是 document.querySelectorAll(). 返回 Promise(Array(ElemetHandle)) 元素数组.

```javascript
const links = await page.$$("a");
//下面写法等价
const links = await page.$$("a", links => links);
```

最终返回的都是 ElemetHandle 对象

## 4.2 获取元素属性
Puppeteer 获取元素属性跟我们平时写前段的js的逻辑有点不一样，按照通常的逻辑，应该是现获取元素，然后在获取元素的属性。但是上面我们知道
获取元素的 API 最终返回的都是 ElemetHandle 对象，而你去查看 ElemetHandle 的 API 你会发现，它并没有获取元素属性的 API.

事实上 Puppeteer 专门提供了一套获取属性的 API， Page.$eval() 和 Page.$$eval()

(1). Page.$$eval(selector, pageFunction[, ...args]), 获取单个元素的属性，这里的选择器 selector 跟上面 Page.$(selector) 是一样的。

```javascript
const value = await page.$eval('input[name=search]', input => input.value);
const href = await page.$eval('#a", ele => ele.href);
const content = await page.$eval('.content', ele => ele.outerHTML);
```

__《THE END》__










