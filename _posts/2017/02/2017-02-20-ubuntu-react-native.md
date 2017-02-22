---

layout: post
title: "linux react native开发原生app"
categories: [nodejs]
tags: [react-native, react, nodejs]
status: publish
type: post
published: true
author: blackfox
permalink: 20170220/react-native.html
keyword : react-native, react, nodejs
desc : react-native 开发原生APP

---

&nbsp;&nbsp;&nbsp;&nbsp;前段时间一直想开发一个记录时间开销的app，但是又不想去学android开发，于是就是想使用facebook开源的React-Native 来尝试开发。在自学过程中踩过一些坑，记录下来。

1.搭建环境
========
这个比较简单，先安装nodejs，然后再安装react-native-cli，
具体步骤可以参考官方的文档<a
href="http://reactnative.cn/docs/0.41/getting-started.html#content">搭建开发环境</a>, 这篇文档写的很清楚

2.编写Hello World
=======
搭建好环境之后，就可以建一个项目测试一下了。

```bash
react-native init test
cd test
react-native run-android
```

很遗憾，在你按照官网的教程运行<code class="scode">react-native run-android</code> 可能会遇到类似下面的报错

```bash
FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':app:installDebug'.
> com.android.builder.testing.api.DeviceException: No connected
> devices!

```

找不到模拟器设备，而官网上并没有告诉你怎么去启动模拟器。首先，你需要添加环境变量, <code class="scode">vim ~/.profile</code>, 加上如下代码（如果已经添加请略过此步）

```bash
# ～/Android 是你Android SDK的根目录，如果你的目录不是这样的请自行更改。
PATH="~/Android/Sdk/tools:~/Android/Sdk/platform-tools:${PATH}"
export PATH
```

当然你需要注销重新登陆系统或者执行

```bash
source ~/.profile 
```
来使配置生效。接下来，执行

```bash
android avd
```
进入模拟器管理界面，如下：

<div style="text-align:left;"><img src="/images/2017/02/react-native-01.png" /> </div>

点击 <code class="scode">Create</code>
按钮创建一个新的模拟器，然后再点击 <code class="scode">Start</code>
按钮启动就好了。

然后再切换到 test 项目目录，执行 <code class="scode">react-native run-android</code> 就可以在模拟器中测试项目了。

我的测试项目启动预览图如下

<div style="text-align:left;"><img src="/images/2017/02/react-native-02.png" /> </div>

3.打包APK项目
=======
在项目开发完成之后就要将项目打包成APK了，这个react-native官方也有详细的教程
<a href="http://reactnative.cn/docs/0.41/signed-apk-android.html">打包APK</a>

<strong>《完》</strong>
