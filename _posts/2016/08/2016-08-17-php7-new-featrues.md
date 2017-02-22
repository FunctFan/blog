---

layout: post
title: "简单了解php7的新特性"
categories: [php]
tags: [php]
status: publish
type: post
published: true
author: blackfox
permalink: /20160817/php7-new-feature.html
keyword : php7新特性,php7,php7性能的优化

--- 
截止到目前为止，PHP官方已经发布了php7的7.0.9版本，现在来说php7的重大特性肯定已经是定型了，不会再有什么变动了。后续一些版本的迭代主要也就是修修bug，优化之类的。下面就来说话我们一直期待的php7会有那些主要的变化了。。。

1.标量数据类型
====
string, int, float, bool，会按照定义的类型自动进行数据类型的转换, 也就是说php7已经逐步支持强类型了。

```php
function addUser(string name, int age) {
	echo "add user {$name}, {$age} years old.";
}
```
这样看起来是不是代码的语义化也更强一些。

2.函数返回类型的定义支持
====
php7支持返回类型定义，用于返回类型的自动标准和自动转换

```php
function login(string username, string password) : bool {
	return false;
}
login("root", "123456");
```

3.null的快捷合并操作
====
这个特性不错，可以节省不少代码，替换三目运算符

```php
$username = $_GET['user'] ?? 'nobody';
//来代替之前的：
$username = isset($_GET['user']) ? $_GET['user'] : 'nobody';
//甚至还可以这么用：
$username = $_GET['user'] ?? $_POST['user'] ?? 'nobody';
```

4.新增Spaceship（飞船）操作符号
===

```php
$a <=> $b
//来代替：
if ($a > $b ) return 1;
else if ( $a == b ) return 0;
else return -1;
```
这个特性对于数据的比较又可以省去不少代码了

5.define可以定义常量数组了
====

这个不粗，在PHP5.6，它们只能使用 const 关键字定义. 这样就可以方便define定义的常量的统一管理，也解决了常量命名冲突的问题。如果是这样的话，也不需要每次定义常量之前都用<code>defined</code>函数检查了

```php
define('ANIMALS', [
    'dog',
    'cat',
    'bird'
]);
print(animals[1]);

//以上将输出cat
```


6.支持匿名类的使用
====
在php7以后开始支持匿名类，匿名类像普通类一样传递参数到匿名类的构造器，也可以扩展（extend）其他类、实现接口（implement interface），以及像其他普通的类一样使用 trait

不过一直觉得匿名类除了用来创建一次性的简单对象之外没啥卵用，不过一般支持匿名类的语言，基本可以支持闭包，这个对于后期重复操作代码的减少很有用，闭包理解为：实现某种业务的逻辑代码，可以理解为微型函数，不同在于，可以动态的绑定到执行环境进行调用！

```php
$getX = function() {return $this->x;};
echo $getX->call(new A);
//将getX闭包，绑定到new A对象上执行！
```
这个特性很棒！


7.快捷进行除法并且放回取整结果
===

```php
int a = intdiv(10, 3);
a = 3
//来代替：(int) 10/3或者floort(10/3)
//这个主要是运行速度上的优化！
```

8.dirname()函数增加了第二个参数
===
第二个参数表示剔除的层数，免去<code>dirname(dirname(__FILE__))</code>这种嵌套的调用！

```php 
$dir = dirname(dirname(dirname(__FILE__)))
//等价于：
$dir = dirname(__FILE__, 3);
```

9.对unicode有更好的支持了
====

例如如下，可以输出一个emoji表情：

```php
echo "\u{1F60D}"; // outputs 
```

10.便于引入相同的命名空间的类和函数
====

```php
// 新语法写法
use FooLibrary\Bar\Baz\{ ClassA, ClassB, ClassC, ClassD as Fizbo };

// 以前语法的写法

use FooLibrary\Bar\Baz\ClassA;
use FooLibrary\Bar\Baz\ClassB;
use FooLibrary\Bar\Baz\ClassC;
use FooLibrary\Bar\Baz\ClassD as Fizbo;
```

11.可以捕获系统内核异常了
====
这个貌似是个坑，亲测发现，虽然可以抛出异常了，但是并不能捕获

```php 
try {
	test_func();
} catch(EngineException $e) {
	echo "Exception: {$e->getMessage()}\n";
} finally {
	echo "undefined function…";n
}   
```
这段代码在php5中只会输出错误，不会抛出异常，如下

```
PHP Fatal error:  Call to undefined function test_func() in test.php on line 4
```

但是在php7中就会抛出异常，而不是简单的抛出错误信息，如下

```
undefined function…PHP Fatal error:  Uncaught Error: Call to undefined function test_func() in /home/yangjian/test.php:4
Stack trace:
#0 {main}
thrown in /home/yangjian/test.php on line 4

Fatal error: Uncaught Error: Call to undefined function test_func() in /home/yangjian/test.php:4
Stack trace:
#0 {main}
thrown in /home/yangjian/test.php on line 4

```

12.php7弃用的一些功能
====

php7中也放弃了一些过时的功能，这里列出2点
1. PHP4式构造函数，它与类的名称相同，因为它们是在所定义类的方法，现在已过时，并且将在未来被移除。
2. 非静态方法静态调用已被弃用，并且可能在将来被移除。也就是说非静态方法已经不能用<code>Class::method();</code>的形式调用了

总结 
====

<strong>总结来说，php7性能的优化，是来自多部分的小细节优化叠加的效果！</strong>
php7采用了PHP NG – Zend Engine ，最大的改变，在于运行速度上面，测试了，确实比老版本快了１倍，php7对于速度的主要优化在两个方面：

1. 优化了编译是得到的运行指令排序更适合现代CPU的cache line，充分利用cpu的多级缓存！
2. 运行过程中减少了很多内存的搬运，例如用于存储变了的zval结构体从24为减少为16位，用户类存储和数组存储的HashTable结构体从72位减少为56位！
3. 有意识的将zval的二级指针变成了一级，也就是把部分变量了从堆空间变成了栈空间存储，对于变量的操作和内存的释放上面，充分利用运行栈的优势！


