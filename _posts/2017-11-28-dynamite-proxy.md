---
layout: post
title: Java 的动态代理
categories: [Java]
tags: [动态代理,JAVA，理解编程]
status: publish
type: post
published: true
author: blackfox
permalink: /20171128/dynamite-proxy.html
keyword: java 动态代理
desc: java 动态代理
---
一、什么是代理模式
======
&emsp;&emsp; 在讲动态代理之前，我先梳理一下什么是代理模式。代理模式就是 __给委托对象提供一个代理对象，并由代理对象控制对委托对象的引用__
简单来说就是客户端 A 想要调用服务提供方 B 的某个服务，但是 A 又不直接调用 B， 而是调用代理方 C， 然后 C 再调用 B，将调用结果返回给 A。
说的比较绕，我们先分析一下代理模式中涉及到的几个对象：
* 客户端(Client)： 也就是服务调用方
* 委托对象（RealSubject）：也就是真实的服务提供方，它把服务委托给代理方
* 代理对象（Proxy）： 代理对象持有“委托对象”的引用，相当与“委托对象”的封装
* 抽象接口(Subject)： Proxy 和 RealSubject 共同实现的接口

调用流程： 客户端 -> 代理对象 -> 委托对象

UML 图如下：

<img class="img-view" data-src="/images/2017/11/proxy.png" src="/images/1px.png" />

话不多说，直接上代码，使用代理模式实现支付功能。

> 步骤一：  创建抽象接口，申明真实委托对象和代理对象提供的服务(支付)

```java
public interface Subject {
	void pay(BigDecimal amount);
}
```

> 步骤二： 创建委托类

```java
public class RealSubject implements Subject {
	@Override
    public void pay(BigDecimal amount) {
        System.out.println("支付成功，支付金额为￥"+amount.doubleValue());
    }
}
```

> 步骤三： 创建代理类

```java
public class StaticProxy implements Subject {
	RealSubject subject;
	StaticProxy(RealSubject subject) {
		this.subject = subject;
	}
	@Override
	public void pay(BigDecimal amount) {
		this.subject.pay(amount);
	}
}
```

> 步骤四： 测试代码，客户端代理调用

```java
/**
 * @author yangjian
 * @since 17-11-23.
 */
public class ProxyTest {
	@Test
    public void staticProxy() {
        RealSubject realSubject = new RealSubject();
        StaticProxy staticProxy = new StaticProxy(realSubject);
        staticProxy.pay(new BigDecimal(100));
    }
}
```

输出结果
```html
支付成功，支付金额为￥100.0
```
&emsp;&emsp;这就实现了代理模式，很简单。使用代理模式的好处很明显，一个是降低了服务调用者（客户端）和服务提供者（委托对象）之间的耦合，另一个就是有效的保护
委托对象，这样客户端就不需要知道委托对象的结构和实现，只有委托对象暴露给代理方的服务客户端才可以调用，而其他服务则不允许客户端调用的。

代理模式的缺点就是，在客户端和服务端之间增加了代理端，增加了调用，所以会性能方面肯定不如直接调用高效一些，还有就是需要写额外的代码，
比如新增代理端（Proxy）的实现。

二、动态代理
=======
&emsp;&emsp;上面在讲代理模式的特点的时候，说道代理模式的一个缺陷就是需要额外实现代理类这样会增加系统的复杂性。Java 中引入了动态代理机制，
很好的解决这个问题了。所谓动态代理就是那个代理类（Proxy class）是动态生成的，不需要你额外再创建。

> 静态代理：代理类是在编译时就实现好的。也就是说 Java 编译完成后代理类是一个实际的 class 文件。<br />
动态代理：代理类是在运行时生成的。也就是说 Java 编译完之后并没有实际的 class 文件，而是在运行时动态生成的类字节码，并加载到JVM中。

Java 实现动态代理需要定义一个 ”调用处理器类“ 并实现 InvocationHandler 接口，这个类的目的是指定运行时生成的代理类需要完成的具体任务，
有点类似定义代理类的一个切面（拦截器），即代理类调用任何方法都会经过这个调用处理器类。

Java 实现动态代理主要涉及以下几个类：
* java.lang.reflect.Proxy: 这是生成代理类的主类，通过 Proxy 类生成的代理类都继承了 Proxy 类。
* java.lang.reflect.InvocationHandler: 即"调用处理器"，是一个接口，该接口中仅定义了一个方法，
public Object invoke(Object obj, Method method, Object[] args)，这个抽象方法在代理类中动态实现。
    * obj：代理类，
    * method: 被代理方法
    * args: 被代理方法的参数

Java 动态代理的实现和静态代理差不多，抽象接口(Subject) 和委托对象(RealSubject) 是必须的，现在还需要添加如下步骤：

> 步骤三： 创建“代理调用处理器”类， ProxyHandler

```java
public class ProxyHandler implements InvocationHandler {
	private Subject subject;
	ProxyHandler(Subject subject) {
		this.subject = subject;
	}
	@Override
	public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
		System.out.println("===== Before Invoker =====");
		Object result = method.invoke(subject, args);
		System.out.println("===== After Invoker =====");
		return result;
	}
}
```

接下来测试：

```java
@Test
public void dynamiteProxy() {
    //创建委托对象
    RealSubject realSubject = new RealSubject();
    //创建调用处理器对象
    ProxyHandler proxyHandler = new ProxyHandler(realSubject);
    //创建代理对象
    Subject subject = (Subject) Proxy.newProxyInstance(RealSubject.class.getClassLoader(), RealSubject.class.getInterfaces(), proxyHandler);
    //通过代理对象调用方法
    subject.pay(new BigDecimal(200));
}
```

__Proxy.newProxyInstance() 主要完成了以下工作：__

```java
static Object newProxyInstance(ClassLoader loader,Class<?>[] interfaces,InvocationHandler handler)
{
    //1. 根据类加载器和接口创建代理类
    Class clazz = Proxy.getProxyClass(loader, interfaces);
    //2. 获得代理类的带参数的构造函数
    Constructor constructor = clazz.getConstructor(new Class[] { InvocationHandler.class });
    //3. 创建代理对象，并制定调用处理器实例为参数传入
    Interface Proxy = (Interface)constructor.newInstance(new Object[] {handler});
}
```

动态生成的代理类具有几个特点：

1. 继承 Proxy 类，并实现了在Proxy.newProxyInstance()中提供的接口数组。
2. 都使用 public final 修饰。
3. 命名方式为 $ProxyN，其中N会慢慢增加，一开始是 $Proxy1，接下来是$Proxy2...
4. 有一个参数为 InvocationHandler 的构造函数。

在上述的动态代理过程中，生成的代理类大致如下：

```java
public final class $Proxy1 extends Proxy implements Subject{
    private InvocationHandler h;
    private $Proxy1(){}
    public $Proxy1(InvocationHandler h){
        this.h = h;
    }
    public void pay(BigDecimal amount){
        //创建method对象
        Method method = Subject.class.getMethod("pay", new Class[]{BigDecimal.class});
        //调用了invoke方法
        h.invoke(this, method, new Object[]{amount});
    }
}
```

__THE END__
