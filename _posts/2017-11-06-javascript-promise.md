---
layout: post
title: Javascript Promise 详解
categories: [前端开发]
tags: [javascript, promise]
status: publish
type: post
published: true
author: blackfox
permalink: 20171106/javascript-promise.html 
keyword: SpringBoot
desc: javascript Promise 对象详解
---

1、约定
====
1. 本文的 demo 代码有些是伪代码，不可以直接执行。
2. 没有特殊说明，本文所有 demo 都是基于 ES6 规范。
3. Object.method 代表是静态方法， Object#method 代表的是实例方法。如 Promise#then 代表的是 Promise 的实例方法,
	Promise.resolve 代表的是 Promise 的静态方法.

2、什么是 Promise?
======
首先我们来了解 Promise 到底是怎么一回事

Promise 是抽象的异步处理对象，以及对其进行各种操作的组件。我知道这样解释你肯定还是不明白 Promise 是什么东西，你可以把 Promise 理解成一个
容器，里面装着将来才会结束的一个事件的结果，这个事件通常是一个异步操作。

Promise最初被提出是在 E语言中， 它是基于并列/并行处理设计的一种编程语言。Javascript 在 ES6 之后也开始支持 Promise 特性了，用来解决异步操
的问题。这里顺便解释一下什么是 ES6， ECMAScript 是 Javascript 语言的国际标准，Javascript 是 ECMAScript 的有一个实现， 而ES6（全称 ECMAScript 6）是这个标准的一个版本。

3、Javascript 为什么要引入 Promise?
======
细心的你可能发现了我刚刚说了 Javascript 支持 Promise 实现是为了解决异步操作的问题。谈到异步操作，你可能会说，Javascript 不是可以用回调
函数处理异步操作吗？ 原因就是 Promise 是一种更强大的异步处理方式，而且她有统一的 API 和规范，下面分别看看传统处理异步操作和 Promise 处理
异步操作有哪些不同。

__使用回调函数处理异步操作:__

```javascript
login("http://www.r9it.com/login.php", function(error, result){
    // 登录失败处理
	if(error){
        throw error;
    }
    // 登录成功时处理
});
```

> Node.js等则规定在JavaScript的回调函数的第一个参数为 Error 对象，这也是它的一个惯例。
像上面这样基于回调函数的异步处理如果统一参数使用规则的话，写法也会很明了。 但是，这也仅是编码规约而已，即使采用不同的写法也不会出错。
而Promise则是把类似的异步处理对象和处理规则进行规范化， 并按照采用统一的接口来编写，而采取规定方法之外的写法都会出错。

__使用 Promise 处理异步操作:__

```javascript 
var promise = loginByPromise("http://www.r9it.com/login.php"); 
promise.then(function(result){
    // 登录成功时处理
}).catch(function(error){
    // 登录失败时处理
});
```

通过上面两个 demo 你会发现，有了Promise对象，就可以将异步操作以同步操作的流程表达出来。
这样在处理多个异步操作的时候还可以避免了层层嵌套的回调函数（后面会有演示）。
此外，Promise对象提供统一的接口，必须通过调用 <code class="scode">Promise#then</code> 和 <code class="scode">Promise#catch</code> 
这两个方法来结果，除此之外其他的方法都是不可用的，这样使得异步处理操作更加容易。

4、基本用法
======
在 ES6 中，可以使用三种办法创建 Promise 实例(对象)

> (1). 构造方法

```javascript
let promies = new Promise((resolve, reject) => {
	resolve(); //异步处理		
});
```

Promise 构造函数接受一个函数作为参数，该函数的两个参数分别是 resolve 和 reject。它们是两个函数，由 JavaScript 引擎提供，不用自己部署。

> (2). 通过 Promise 实例的方法，Promise#then 方法返回的也是一个 Promise 对象

```javascript
promise.then(onFulfilled, onRejected);
```

> (3). 通过 Promise 的静态方法，Promise.resolve()，Promise.reject()

```javascript
var p = Promise.resolve();
p.then(function(value) {
	console.log(value);		
});
```

## 4.1 Promise 的执行流程
1. new Promise构造器之后，会返回一个promise对象;
2. 为 promise 注册一个事件处理结果的回调函数(resolved)和一个异常处理函数(rejected);

## 4.2 Promise 的状态
实例化的 Promise 有三个状态： 

__Fulfilled:__ has-resolved, 表示成功解决，这时会调用 onFulfilled.

__Rejected:__ has-rejected, 表示解决失败，此时会调用 onRejected.

__Pending:__ unresolve, 表示待解决，既不是resolve也不是reject的状态。也就是promise对象刚被创建后的初始化状态.

上面我们提到 Promise 构造函数接受一个函数作为参数，该函数的两个参数分别是 resolve 和 reject.

<code class="scode">resolve</code>函数的作用是，将 Promise 对象的状态从 __未处理__ 变成 __处理成功__ (unresolved => resolved)， 
在异步操作成功时调用，并将异步操作的结果作为参数传递出去。

<code class="scode">reject</code>函数的作用是，将 Promise 对象的状态从 __未处理__ 变成 __处理失败__ (unresolved => rejected),
在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。


Promise 实例生成以后，可以用 then 方法和 catch 方法分别指定 resolved 状态和 rejected 状态的回调函数。

以下是 Promise 的状态图

<img src="/images/2017/11/promise-states.png" />


## 4.3 Promise 的基本特性

> 【1】 __对象的状态不受外界影响__ Promise 对象代表一个异步操作，有三种状态：pending（进行中）、fulfilled（已成功）和rejected（已失败）。
只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。
这也是Promise这个名字的由来，它的英语意思就是“承诺”，表示其他手段无法变。

> 【2】 __一旦状态改变，就不会再变，任何时候都可以得到这个结果__
Promise对象的状态改变，只有两种可能：从 pending 变为 fulfilled 和从 pending 变为 rejected。
只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 resolved（已定型）。
如果改变已经发生了，你再对 Promise 对象添加回调函数，也会立即得到这个结果。
这与事件（Event）完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。

例如以下代码, reject 方法是无效的

```Javascript
var promise = new Promise((fuck, reject) => {
	resolve("xxxxx");
	//下面这行代码无效，因为前面 resolve 方法已经将 Promise 的状态改为 resolved 了
	reject(new Error()); 
});

promise.then((value) => { 
	console.log(value);
})
```

下图是 Promise 的状态处理流程图

<img src="/images/2017/11/promise-resolve-reject.png" />


5、Promise 的执行顺序
========
我们知道 Promise 在创建的时候是立即执行的，但是事实证明 __Promise 只能执行异步操作__，即使在创建 Promise 的时候就立即改变它状态。

```Javascript
var p = new Promise((resolve, reject) => {
	console.log("start Promise");
	resolve("resolved");		
});

p.then((value) => {
	console.log(value);
}) 

console.log("end Promise");
```

打印的结果是：

```bash
start Promise
end Promise
resolved
```

或许你会问，这个操作明明是同步的，定义 Promise 里面的代码都被立即执行了，那么回调应该紧接着 resolve 函数执行，那么应该先打印
"resolved" 而不应该先打印 "end Promise". 

__这个是 Promise 规范规定的，为了防止同步调用和异步调用同时存在导致的混乱__ 

6、Promise 的链式调用(连贯操作)
=====
前面我们讲过，Promise 的 then 方法以及 catch 方法返回的都是新的 Promise 对象，这样我们可以非常方便的解决嵌套的回调函数的问题，
也可以很方便的实现流程任务。

```javascript
var p = new Promise(function(resolve, reject) {
    resolve();
});
function taskA() {
    console.log("Task A");
}
function taskB() {
    console.log("Task B");
}
function taskC() {
    console.log("Task C");
}
p.then(taskA())
.then(taskB())
.then(taskC())
.catch(function(error) {
    console.log(error);
});
```

上面这段代码很方便的实现了从 taskA 到 taskC 的有序执行。

当然你可以把 taskA - taskC 换成任何异步操作，如从后台获取数据：

```javascript
var getJSON = function(url, param) {
	var promise = new Promise(function(resolve, reject){
		var request = require('ajax-request');
		request({url:url, data: param}, function(err, res, body) {
			if (!err && res.statusCode == 200) {
				resolve(body);
			} else {
				reject(new Error(err));
			}
		});
	});

	return promise;
};
var url = "login.php";
getJSON(url, {id:1}).then(result => {
	console.log(result);
	return getJSON(url, {id:2})
}).then(result => {
	console.log(result);
	return getJSON(url, {id:3});
}).then(result => {
	console.log(result);
}).catch(error => console.log(error));
```
这样用起来似乎很爽，但是有个问题需要注意，我们说过每个 then() 方法都返回一个新的 Promise 对象，那既然是 Promise 对象，那肯定就有注册 
onFulfilled 和 onRejected， 如果某个任务流程的 then() 方法链过长的话，前面的任务抛出异常，会导致后面的任务被跳过。

```javascript
function taskA() {
    console.log("Task A");
    throw new Error("throw Error @ Task A");
}
function taskB() {
    console.log("Task B");
}
function onRejected(error) {
    console.log(error);
}
function finalTask() {
    console.log("Final Task");
}
var promise = Promise.resolve();
promise
    .then(taskA)
    .then(taskB)
    .catch(onRejected)
    .then(finalTask);
```

执行的结果是：

```shell
Task A
Error: throw Error @ Task A
Final Task
```

显然， 由于 A 任务抛出异常（执行失败），导致 .then(taskB) 被跳过，直接进入 .catch 异常处理环节。

## 6.1 promise chain 中如何传递参数
上面我们简单阐述了 Promise 的链式调用，能够非常有效的处理异步的流程任务。

但是在实际的使用场景中，任务之间通常都是有关联的，比如 taskB 需要依赖 taskA 的处理结果来执行，这有点类似 Linux 管道机制。
Promise 中处理这个问题也很简单，那就是在 taskA 中 return 的返回值，会在 taskB 执行时传给它。
                    
```javascript
function taskA() {
    console.log("Task A");
    return "From Task A";
}
function taskB(value) {
	console.log(value);
    console.log("Task B");
    return "From Task B";
}
function onRejected(error) {
    console.log(error);
}
function finalTask(value) {
	console.log(value);
    console.log("Final Task");
}
var promise = Promise.resolve();
promise
    .then(taskA)
    .then(taskB)
    .catch(onRejected)
    .then(finalTask);
```

搞定，就这么简单！

## 6.2 resolve 和 reject 参数

reject函数的参数通常是Error对象的实例，表示抛出的错误；resolve函数的参数除了正常的值以外，还可能是另一个 Promise 实例，
比如像上面的 getJSON() 方法一样。

```javascript
var p1 = new Promise(function (resolve, reject) {
  setTimeout(() => reject(new Error('fail')), 3000)
})

var p2 = new Promise(function (resolve, reject) {
  setTimeout(() => resolve(p1), 1000)
})

p2
  .then(result => console.log(result))
  .catch(error => console.log(error))
```

> 注意，这时p1的状态就会传递给p2，也就是说，p1的状态决定了p2的状态。<br />
> 如果p1的状态是 pending，那么p2的回调函数就会等待p1的状态改变；<br />
> 如果p1的状态已经是 resolved 或者 rejected，那么p2的回调函数将会立刻执行。

7、Promise 基本方法
========

ES6的Promise API提供的方法不是很多，下面介绍一下 Promise 对象常用的几个方法.

## 7.1 Promise.prototype.catch()  
Promise.prototype.catch方法是.then(null, rejection)的别名，用于指定发生错误时的回调函数。

```javascript
p.then((val) => console.log('fulfilled:', val))
  .catch((err) => console.log('rejected', err));

// 等同于
p.then((val) => console.log('fulfilled:', val))
  .then(null, (err) => console.log("rejected:", err));
```

__Promise 对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个catch语句捕获。__
所以通常建议使用 catch 方法去捕获异常，而不要用 then(null, function(error) {}) 的方式，因为这样只能捕获当前 Promise 的异常

```javascript
p.then(result => {console.log(result)})
  .then(result => {console.log(result)})
  .then(result => {console.log(result)})
  .catch(error => {
  	//捕获上面三个 Promise 对象产生的异常
  	console.log(error);
  });
```

跟传统的try/catch代码块不同的是，如果没有使用catch方法指定错误处理的回调函数，Promise 对象抛出的错误不会传递到外层代码，即不会有任何反应。

__通俗的说法就是“Promise 会吃掉错误”。__ 

比如下面的代码就出现这种情况

```javascript
var p = new Promise(function(resolve, reject) {
    // 下面一行会报错，因为x没有声明
    resolve(x + 2);
 });
p.then(() => {console.log("every thing is ok.");});
// 这行代码会正常执行，不会受 Promise 里面报错的影响
console.log("Ok, it's Great.");
```

## 7.2 Promise.all()
Promise.all方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。用来处理组合 Promise 的逻辑操作。

```javascript
var p = Promise.all([p1, p2, p3]);  
```

#### 上面代码 p 的状态由p1、p2、p3决定，分成两种情况。

1. 只有p1、p2、p3的状态都变成fulfilled，p的状态才会变成fulfilled，此时p1、p2、p3的返回值组成一个数组，传递给p的回调函数。
2. 只要p1、p2、p3之中有一个被rejected，p的状态就变成rejected，此时第一个被reject的实例的返回值，会传递给p的回调函数。

下面是一个具体的例子

```javascript
// 生成一个Promise对象的数组
var promises = [1,2,3,4,5,6].map(function (id) {
  return getJSON('/post/' + id + ".json");
});

Promise.all(promises).then(function (posts) {
  // ...
}).catch(function(reason){
  // ...
});
```

上面代码中，promises 是包含6个 Promise 实例的数组，只有这6个实例的状态都变成 fulfilled，或者其中有一个变为 rejected，
才会调用 Promise.all 方法后面的回调函数。

## 7.3 Promise.race()
Promise.race方法同样是将多个Promise实例，包装成一个新的Promise实例。
与 Promise.all 不同的是，只要有一个 promise 对象进入 FulFilled 或者 Rejected 状态的话，Promise.rece 就会继续进行后面的处理

```javascript
var p = Promise.race([p1, p2, p3]);
```

> 上面代码中，只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给p的回调函数。
Promise.race 方法的参数与 Promise.all 方法一样，如果不是 Promise 实例，就会先调用 __Promise.resolve__ 方法，
将参数转为 Promise 实例，再进一步处理。

下面是一个具体的例子

```javascript
// `delay`毫秒后执行resolve
function timerPromisefy(delay) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(delay);
        }, delay);
    });
}
// 任何一个promise变为resolve或reject 的话程序就停止运行
Promise.race([
    timerPromisefy(1),
    timerPromisefy(32),
    timerPromisefy(64),
    timerPromisefy(128)
]).then(function (value) {
    console.log(value);    // => 1
});
```

## 7.4 Promise.resolve()
Promise.resolve 方法有2个作用，一个就是前面我们说的，它是通过静态方法创建 Promise 实例的渠道之一，
另一个作用就是将 Thenable 对象转换为 Promise 对象。

那么什么是 Thenable 对象呢？ES6 Promises里提到了Thenable这个概念，简单来说它就是一个非常类似promise的东西。
就像我们有时称具有 .length 方法的非数组对象为 Array like 一样，Thenable 指的是一个具有 .then 方法的对象。

这种将 Thenable对象转换为 Promise 对象的机制要求thenable对象所拥有的 then 方法应该和Promise所拥有的 then 方法具有同样的功能和处理过程，
在将 Thenable 对象转换为 Promise 对象的时候，还会巧妙的利用 Thenable 对象原来具有的 then 方法。

到底什么样的对象能算是 Thenable 的呢，最简单的例子就是 jQuery.ajax()，它的返回值就是 Thenable 的。

__将 Thenable 对象转换为 Promise 对象__

```javascript
var promise = Promise.resolve($.ajax('/json/comment.json'));// => promise对象
promise.then(function(value){
   console.log(value);
});
```

除了上面的方法之外，Promise.resolve方法的参数还有以下三种情况。
> (1). 参数是一个 Promise 实例

如果参数是Promise实例，那么Promise.resolve将不做任何修改、原封不动地返回这个实例。

> (2). 参数不是具有then方法的对象，或根本就不是对象

如果参数是一个原始值，或者是一个不具有then方法的对象，则Promise.resolve方法返回一个新的Promise对象，状态为resolved。

```javascript
var p = Promise.resolve('Hello');
p.then(function (s){
  console.log(s)
});
```
上面代码生成一个新的Promise对象的实例p。由于字符串Hello不属于异步操作（判断方法是字符串对象不具有then方法），
返回Promise实例的状态从一生成就是resolved，所以回调函数会立即执行。
Promise.resolve方法的参数，会同时传给回调函数。

> (3). 不带有任何参数

Promise.resolve方法允许调用时不带参数，直接返回一个resolved状态的Promise对象。这个我们在上面讲创建 Promise 实例的三种方法的时候就讲过了

```javascript
var p = Promise.resolve();
p.then(function () {
  // ...
});
```

## 7.5 Promise.reject()
Promise.reject(reason)方法也会返回一个新的 Promise 实例，该实例的状态为rejected。
需要注意的是，Promise.reject()方法的参数，会原封不动地作为 reject 的理由，变成后续方法的参数。这一点与 Promise.resolve 方法不一致。

```javascript
const thenable = {
  then(resolve, reject) {
    reject('出错了');
  }
};

Promise.reject(thenable)
.catch(e => {
  console.log(e === thenable)
})
// true
```
上面代码中，Promise.reject 方法的参数是一个 thenable 对象，执行以后，后面 catch 方法的参数不是 reject 抛出的“出错了”这个字符串，
而是 thenable 对象。


__《THE END》__










