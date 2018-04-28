---
layout: post
title: vscode 使用 chrome debuger 断点调试
categories: [前端开发]
tags: [vscode, chrome debuger]
status: publish
type: post
published: true
author: blackfox
permalink: /20180428/vscode-chrome-debuger.html
keyword: vscode, chrome debuger, nodejs 断点调试, vue 断点调试
desc: vscode 使用 chrome debuger 断点调试, nodejs 断点调试 
---

&emsp;&emsp;都忘了自己多长时间不做前端开发了，最近想为公司的项目开发搭建一套手脚架，减少前期框架搭建成，约定前后端开发规则，减少沟通成本，
又重新捡起了前端开发，技术进步真是日新月异，我们那个时候用的 seajs 模块化开发早就被甩了 N 条街了。
现在主流用的都是 webpack + vue | angular | react. 所谓的 MVVM 开发框架。前端开发的调试天然就没有后端开发的方便一些，再者由于项目项目文件经过
webpack 各种打包，压缩，传统的 chrome devtool 调试工具已经不好用了. 取而代之的是 nodejs 调试工具。
经过各种测试，发现还是基于 vscode + chrome debuger 插件的调试方法比较方便，好用一些。

下面记录一下 vscode + chrome debuger 调试环境搭建方法。当然在此之前默认你已经安装好了 vscode 编辑器了。如果不使用 vscode 编辑器的请飘过，
不过真心推荐使用，因为 vscode 真是一个 coder 的神器。

> 第一步，下载 chrome debuger 插件 

打开 vscode 的插件安装面板，搜索 chrome debuger, 然后点击 install

<img class="img-view" data-src="/images/2018/04/vscode-debug-01.png" src="/images/1px.png" />


> 第二步，添加配置文档 launch.json，打开 debug 面板，点击 "添加配置"

<img class="img-view" data-src="/images/2018/04/vscode-debug-002.png" src="/images/1px.png" />

将下面配置文档覆盖到你的 launch.json 文件中

```javascript
{
  "version": "0.2.0",
  "configurations": [
      
      {
          "name": "Launch Chrome Instance",
          "type": "chrome",
          "request": "launch",
          "url": "http://127.0.0.1:8080/#/",
          "sourceMaps": true,
          "webRoot": "${workspaceRoot}"
      },
      {
          "name": "Attach to Chrome",
          "type": "chrome",
          "request": "attach",
          "port": 9222,
          "sourceMaps": true,
          "webRoot": "${workspaceRoot}"
      }
  ]
}
```

这里我配置了两个调试配置, "Launch Chrome Instance" 是直接通过 vscode 打开 Chrome 浏览器，也就是本地调试，整个 Chrome 实例都是可以用 vscode 
控制的，"Attach to Chrome" 是调试外部环境的 Chrome 实例，也就是说这个 Chrome 浏览器的窗口是你另外打开的。

其中 9222 是浏览器远程调试的接口，需要在 Chrome 浏览器运行的时候加参数指定，只需可执行程序命令后面添加 --remote-debugging-port=9222 就可以了。
比如我用的 Linux 系统的开发，Chrome 的安装路径是 /opt/google/chrome/ , 那么执行：

```bash
/opt/google/chrome/chrome --remote-debugging-port=9222 
```

> 第三步，配置 webpack 的 config 文件, 把 dev 段配置，修改如下两个配置

```bash
module.exports = {
  dev: {

    //devtool: 'cheap-module-eval-source-map',
    devtool: 'eval-source-map',

    //cacheBusting: true,
    cacheBusting: false,

  },
```

> 第四步，打断点，调试

先启动应用 

```bash
npm install
npm run dev
```

然后打上断点，按 F5, vscode 会弹出当前你的 Chrome 上正在跑的页面，选择你要要调试的那个页面.

<img class="img-view" data-src="/images/2018/04/vscode-debug-02.png" src="/images/1px.png" />

这时你就可以在浏览器进行调试了，非常方便。

<img class="img-view" data-src="/images/2018/04/vscode-debug-03.png" src="/images/1px.png" />

> 当然，你也可以选择在编辑器里面调试，个人认为这个更方便一些.

<img class="img-view" data-src="/images/2018/04/vscode-debug-04.png" src="/images/1px.png" />

至此，vscode + chrome debuger 的断点调试环境就搭建好了.

__Enjoying programing.__ 
