---
layout: post
title: Async/Await 更好的异步编程解决方案
categories: [前端开发]
tags: [Async,Await,ES7]
status: publish
type: post
published: true
author: blackfox
permalink: /20171108/async-await.html
keyword: Async,Await,异步操作
desc: 另一种异步解决方案 Async/Await 
---

一、异步编程的终极解决方案
=============

前几天写过关于 javascript 异步操作的文章[《Javascript Promise 详解》](/20171106/javascript-promise.html). 最近在学习 
[Puppeteer](/20171106/puppeteer.html) 的时候又发现另一种异步编程解决方案：Async/Await.

异步操作是 JavaScript 编程的麻烦事，麻烦到一直有人提出各种各样的方案，试图解决这个问题。
从最早的回调函数，到 Promise 对象，再到 Generator 函数，每次都有所改进，但又让人觉得不彻底。
它们都有额外的复杂性，都需要理解抽象的底层运行机制。

在 Async 函数出来之后，有人认为它是异步编程的最终解决方案。因为有了 Async/Await 之后，你根本就不用关心是它是不是异步编程。

二、基本用法
==========
async 函数返回一个 Promise 对象，可以使用 then 方法添加回调函数。
当函数执行的时候，一旦遇到 await 就会先返回，等到触发的异步操作完成，再接着执行函数体内后面的语句。

下面是一个栗子：

```javascript
var sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    })
};

var start = async function () {
    // 在这里使用起来就像同步代码那样直观
    console.log('start');
    await sleep(3000);
    console.log('end');
};

start();
```
执行上面的代码，你会发现，控制台先输出start，稍等3秒后，输出了end。


三、注意事项
========
> 1、await 命令只能用在 async 函数之中，如果用在普通函数，就会报错。

```javascript
async function dbFuc(db) {
  let docs = [{}, {}, {}];

  // 报错
  docs.forEach(function (doc) {
    await db.post(doc);
  });
}
```

> 2、await 表示在这里等待promise返回结果了，再继续执行。

```javascript
var sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            // 返回 ‘ok’
            resolve('ok');
        }, time);
    })
};

var start = async function () {
    let result = await sleep(3000);
    console.log(result); // 收到 ‘ok’
};
```

> 3、await 后面跟着的应该是一个promise对象。

如果是同步执行的代码没有必要使用 await 修饰了。

> 4、await 只能使用在原生语法中，比如在 forEeach 结构中使用 await 是无法正常工作的，必须使用 for 循环的原生语法。

```javascript
async function dbFuc(db) {
  let docs = [{}, {}, {}];

  // 可能得到错误结果
  docs.forEach(async function (doc) {
    await db.post(doc);
  });
}
```

如果确实希望多个请求并发执行，可以使用 Promise.all 方法。

```javascript
async function dbFuc(db) {
  let docs = [{}, {}, {}];
  let promises = docs.map((doc) => db.post(doc));

  let results = await Promise.all(promises);
  console.log(results);
}
```

四、错误捕获
==========
既然.then(..)不用写了，那么.catch(..)也不用写，可以直接用标准的try catch语法捕捉错误。

```javascript
var sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            // 模拟出错了，返回 ‘error’
            reject('error');
        }, time);
    })
};

var start = async function () {
    try {
        console.log('start');
        await sleep(3000); // 这里得到了一个返回错误
        
        // 所以以下代码不会被执行了
        console.log('end');
    } catch (err) {
        console.log(err); // 这里捕捉到错误 `error`
    }
};
```

__《THE END》__
