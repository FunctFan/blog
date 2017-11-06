---
layout: post
title: liquid学习笔记
categories: [小工具]
tags: [liquid, jekyll]
status: publish
type: post
published: true
author: blackfox
permalink: /20160309/liquid-study-note.html
description: liquid学习笔记
---

jekyll是一个不可思议的博客系统，优雅，简单。有了她之后你可以在vim编辑器中愉快的写博客，然后push到github去发布博客。
但是在愉快玩耍之前你必须要了解Liquid语法，因为jekyll的模板使用的是Liquid语法的标签。网上关于Liquid的学习资料比较多，但是很多的都不全面
要么就是讲得太简单了，要么就讲的太多了。但是对于我们这种只想玩转jekyll博客的来说，搞懂一些基本的够写博客用就可以了。所以特地整理了
一套容易学习的教程，给需要的人使用。

Liquid语法是相当强大的，特别是她的过滤器操作（管道操作的格式），总体来说分为一下几部分

Output
======

简单来说就是输出变量， eg:

> {% raw %}
{{ name }} <br />
  {{ "Hello world" }} //输出 "Hello world" <br />
  {{ user.name }}
{% endraw %}

高级Output: Filters
=======

简单来说就是过滤器，对变量的数据进行过滤（处理）， 她的语法原理类似linux系统的shell脚本的管道操作，也就是把前一个操作的计算结果作为后一个操作的参数
不多说，直接看 eg:

> {% raw %}
{{ post.author \| capitalize }} //将博客的作者的首字母转大写 <br />
{{ user.name \| upcase }} //用户名转大写 <br />
{{ post.date \| date: "%Y-%m-%d" }} //转换日期的格式
{% endraw %}


### 标准过滤器

* date - 格式化时间
* capitalize - 输出字符串，字符串（句子）首字母大写
* downcase - 转换小写
* upcase - 转换大写
* first - 获取数组的第一个元素
* last - 获取数组的最后一个元素
* join - 用指定的字符拼接数组元素
* sort - 排序数组
* map - 映射或收集给定属性的数组
* size - 返回数组大小
* escape - 转移字符串
* strip_html - 除去字符串中的html标签?
* strip_newlines - 除去字符串中的回车?
* newline_to_br - 将所有的回车"\n" 转换成"\<br />"
* replace - 替换所有匹配内容
* replace_first - 替换第一个匹配内容
* remove - 移除所有匹配内容
* remove_first - 移除第一个匹配内容
* prepend - 在字符串前面加上内容
* append - 字符串后面加上内容
* minus - 减法
* plus - 加法
* times - 乘法
* divided_by - 除法
* split - 分割字符串
* modulo - 取余

<strong>好了，闲话不多说，下面我们看demo</strong>

> {% raw %}
{{ "abcdswe" \| replace:"s", "w" }}  //输出 abcdwwe <br />
{{ "ming" | prepend:"xiao" }} //输出 xiaoming <br />
{{ 10 | divided_by:2}} //输出 5 <br />
{{ "\<span>xiaoming</span>" | strip_html }} //输出 xiaoming
{% endraw%}

### Tags

模板中的逻辑处理通常通过使用tags来完成， 目前Liquid支持的tags有：

* assign - 定义变量
* capture - Block tag为变量赋值
* case - Block tag its the standard case...when block
* comment - Block tag 注释
* cycle - 循环列举, 类似数据结构中的枚举.
* for - for循环block
* if - 判断block
* include - 引入模板
* raw - 转义内容tag, 这个非常有用否则你要想再jekyll输出 Liquid标签就要添加很多\\来输出标签代码， 本文就是用到了这个标签
* unless - Mirror of if statement

<strong>赋值操作：e.g:</strong>

{% raw %}
```html
{% capture username %}{{ name }}{% endcapture %} //将 name 的值赋给 username
{% assign date = page.date | date: "%Y" %}
```
{% endraw%}

If / Else
=======

{% raw %}
```html
{% if user %}
  Hello {{ user.name }}
{% endif %}

{% if user != null %}
  Hello {{ user.name }}
{% endif %}

{% if user.name == 'tobi' %}
  Hello tobi
{% elsif user.name == 'bob' %}
  Hello bob
{% endif %}

{% if user.name == 'tobi' or user.name == 'bob' %}
  Hello tobi or bob
{% endif %}

{% if user.name == 'bob' and user.age > 45 %}
  Hello old bob
{% endif %}

# Same as above
{% unless user.name == 'tobi' %}
  Hello non-tobi
{% endunless %}

# Check for the size of an array
{% if user.payments == empty %}
   you never paid !
{% endif %}

{% if user.payments.size > 0  %}
   you paid !
{% endif %}

{% if user.age > 18 %}
   Login here
{% else %}
   Sorry, you are too young
{% endif %}

# array = 1,2,3
{% if array contains 2 %}
   array includes 2
{% endif %}

# string = 'hello world'
{% if string contains 'hello' %}
   string includes 'hello'
{% endif %}
```
{% endraw %}

Case 语句
=====

如果你需要多的条件判断，那么你可以使用case语句:

{% raw %}
```html
{% case condition %}
{% when 1 %}
hit 1
{% when 2 or 3 %}
hit 2 or 3
{% else %}
... else ...
{% endcase %}

//Another Example:
{% case template %}

{% when 'label' %}
     // {{ label.title }}
{% when 'product' %}
     // {{ product.vendor | link_to_vendor }} / {{ product.title }}
{% else %}
     // {{page_title}}
{% endcase %}
```
{% endraw %}

 Cycle
=====

默认循环
{% raw %}
```html
{% cycle 'one', 'two', 'three' %}
{% cycle 'one', 'two', 'three' %}
{% cycle 'one', 'two', 'three' %}
{% cycle 'one', 'two', 'three' %}

//结果为：
one
two
three
one

//当然你也可以指定分组来轮询
{% cycle 'group 1': 'one', 'two', 'three' %}
{% cycle 'group 1': 'one', 'two', 'three' %}
{% cycle 'group 2': 'one', 'two', 'three' %}
{% cycle 'group 2': 'one', 'two', 'three' %}

//那么对应的结果为：
one
two
one
two
```
{% endraw %}

for 循环
=======

{% raw %}
```html
//最普通的循环
{% for post in site.posts %}
  {{ post.title }}
{% endfor %}

//限制循环次数
# array = [1,2,3,4,5,6]
{% for item in array limit:2 offset:2 %}
  {{ item }}
{% endfor %}
# results in 3,4

//反向循环
{% for item in collection reversed %}
  {{item}}
{% endfor %}
```
{% endraw %}

参考资料：<span>https://github.com/Shopify/liquid/wiki/Liquid-for-Designers</span>