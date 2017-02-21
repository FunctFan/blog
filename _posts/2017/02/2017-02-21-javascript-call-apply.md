---

layout: post
title: "javascript中call和apply的区别"
categories: [前端开发]
tags: [javascript]
status: publish
type: post
published: true
author: blackfox
permalink: 201702/javascript-call-apply.html
keyword : javascript, call, apply
desc : 

---

javascript
中有2个方法用来调用一个对象的一个方法，但是以另一个对象替换当前对象，也就是替换对象的上下文，更改对象的内部指针，简单来说就是更改<code class="scode">this</code>指向的内容。

这两个方法分别是call和apply,
	他们的作用几乎相同，只是在使用的时候有小小的差别。

首先看下这2个函数的原型

```javascript
call([thisObj[,arg1[, arg2[,   [,.argN]]]]])

apply(thisObj, args);
```

call函数和apply方法的第一个参数都是要传入给当前对象的对象，即函数内部的this。后面的参数都是传递给当前对象的参数。

其实他们的区别就在传参上面：

<strong>call的参数必须一个一个传进去，但是apply的参数可以作为一个数组一次性传进去</strong>

那么很显然使用apply的好处是可以直接将当前函数的arguments对象作为apply的第二个参数传入。


```javascript
function Person(name,age) {
	console.log(name);
	console.log(age);
}

function Teacher(name, age) {

	Person.apply(this, arguments);
	this.name = name;
	this.age = age;
}

function Student(name, age) {
	Person.call(this, arguments);
	this.name = name;
	this.age = age;
}

var t = new Teacher('zhangsan', 30);
var s = new Student('lisi', 10);
//输出
//zhangsan
//30
//{ '0': 'lisi', '1': 10 }
//undefined
```
<strong>《完》</strong>
