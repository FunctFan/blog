---
layout: post
title: 使用 php-webdriver 实现自动化测试 
categories: [PHP, 小工具]
tags: [php, webdriver, selenium]
status: publish
type: post
published: true
author: blackfox
permalink: /20171109/php-webdriver.html
keyword: webdriver, 自动化测试
desc: php-webdriver 入门教程，php 实现自动化测试
---

本文我们讨论一下如何使用 php 实现自动化测试。

一、技术选型
==========
__php + facebook/webdriver + selenium__

Selenium是一套完整的Web应用程序测试系统，它提供了一系列的操作浏览器的 API

webdriver 是 facebook 开发的一套 selenium API 的客户端组件，使用 composer 作为依赖管理工具。

二、环境搭建
=======
1. php 的开发环境
2. webdriver 使用 composer 做依赖管理，所以需要安装 composer
3. selenium-server 需要 java 运行环境

环境配置自己搞定，很简单，这里就不做赘述了。

三、开始使用
=========

安装 php-webdriver

```bash
composer require facebook/webdriver
```

运行 Selenium 服务， 首先你需要到 selenium 官网去下载 selenium-server-standalone-#.jar，
下载地址请狠狠的 [戳这里](http://selenium-release.storage.googleapis.com/index.html).

如果页面被墙了可以到我的百度云盘下载，[selenium-server-standalone-2.53.0-2.jar](https://pan.baidu.com/s/1jHLTC2a), 密码：__tr3e__.

```bash
java -jar -Dwebdriver.chrome.driver="driver/chromedriver" selenium-server-standalone.jar -port 4444
```

需要指定一个 chromedriver(一个阉割版的 chrome 浏览器) ，[这里是下载地址](https://sites.google.com/a/chromium.org/chromedriver/downloads)
也可以去我的百度网盘下载 [chromedriver](https://pan.baidu.com/s/1gfMqdjl), 密码：__8t4p__.

然后创建一个会话，并指定你的服务器运行的地址和端口。

```php
$host = 'http://localhost:4444/wd/hub'; 
```

启动火狐浏览器，前提是你安装了火狐的 Geckodriver

```php 
$driver = RemoteWebDriver::create($host, DesiredCapabilities::firefox());
```

或者启动 chrome 浏览器

```php 
$driver = RemoteWebDriver::create($host, DesiredCapabilities::chrome());
```

你也可以自定义配置你的浏览器

```php 
$host = 'http://localhost:4444/wd/hub'; 
$capabilities = DesiredCapabilities::chrome();
$driver = RemoteWebDriver::create($host, $capabilities, 5000);
```

更多配置，请参考 [这里](https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities).

> 设置浏览器窗口

```php 
$size = new WebDriverDimension(1280, 900);
$driver->manage()->window()->setSize($size);
```

$driver->manage()->window() 返回的是一个 __WebDriverWindow__, 它提供了以下 API

方法名称 | 方法说明
getPosition(), setPosition() | 获取，设置浏览器的位置
getSize(), setSize() | 获取，设置浏览器大小
maximize() | 最大化窗口

> 发送请求

```php
$driver->get('http://www.jd.com');
```

> 操作 DOM 元素

webdriver 主要提供了 2 个 API 来给我们操作 DOM 元素

1. RemoteWebDriver::findElement(WebDriverBy) 获取单个元素
2. RemoteWebDriver::findElements(WebDriverBy) 获取元素列表

WebDriverBy 是查询方式对象，提供了下面几个常用的方式

* WebDriverBy::id($id) 根据 ID 查找元素
* WebDriverBy::className($className) 根据 class 查找元素
* WebDriverBy::cssSelector($selctor) 根据通用的 css 选择器查询
* WebDriverBy::name($name) 根据元素的 name 属性查询
* WebDriverBy::linkText($text) 根据可见元素的文本锚点查询
* WebDriverBy::tagName($tagName) 根据元素标签名称查询
* WebDriverBy::xpath($xpath) 根据 xpath 表达式查询，这个很强大。
不了解什么是 xpath 的请参考我前面的文章 [XPath 语法](/20171104/xpath.html)

__实例__ 


```php
// id 查询
$input = $driver->findElement(
	 WebDriverBy::id('key')
);
//往输入框填入元素
$input->sendKeys('iPhone 8');
// xpath 查询
$button = $input->findElement(
    WebDriverBy::xpath("../button[1]")
);
$button->click(); //单击按钮
//获取列表的 a 标签
$links = $driver->findElements(WebDriverBy::cssSelector(".goods-list > .p-img > a"));
$aTags = [];
foreach($links as $value) {
    array_push($aTags, array(
        'href' => $value->getAttribute('href'),
        'title' => $value->getAttribute("title")
    ));
}
print_r($aTags);
```

> cookies 操作

```php
// fetch cookies
$cookies = $driver->manage()->getCookies();
// delete cookies
$driver->manage()->deleteAllCookies();
// add cookies
$driver->manage()->addCookie(array(
    'name' => 'cookie_name',
    'value' => 'cookie_value',
));
$cookies = $driver->manage()->getCookies();
```

> 键盘操作

* RemoteKeyboard::sendKeys() 输入内容到当前 focus 的元素
* RemoteKeyboard::pressKey($key) 按下某个键
* RemoteKeyboard::releaseKey($key) 释放某个键

```php
$driver->getKeyboard()->sendKeys("登录");
$driver->getKeyboard()->pressKey(WebDriverKeys::SHIFT); //按下 Shift 键
$driver->getKeyboard()->releaseKey(WebDriverKeys::SHIFT);
```

> 鼠标操作

* WebDriverMouse::click(WebDriverCoordinates) 单击鼠标
* WebDriverMouse::doubleClick(WebDriverCoordinates) 双击鼠标
* WebDriverMouse::mouseDown(WebDriverCoordinates) 触发 mousedown 事件
* WebDriverMouse::mouseUp(WebDriverCoordinates) 触发 mouseup 事件
* WebDriverMouse::click(WebDriverCoordinates, $x, $y) 移动鼠标到指定的位置，触发 mousemove 事件

> 注入 JS 代码

* RemoteWebDriver::executeScript($script, $args) 执行同步js代码
* RemoteWebDriver::executeAsyncScript($script, $args) 执行异步 js 代码

```php 
$driver->executeScript("document.body.scrollTop = 1000; alert(arguments[0])", ["fuck"]);
```

> 截图

```php 
$driver->takeScreenshot("test.png");
```



