---
layout: post
title: vscode 常用插件配置
categories: [FunnyTools]
tags: [vscode]
status: publish
type: post
published: true
author: blackfox
permalink: /20180821/vscode-plugins.html
keyword:
desc:  vscode 常用插件配置
---

vscode 是微软开发一款非常好用有轻量级的代码编辑器，强大的插件功能可以使它支持各种语言，从 C, C++ 到 java, php, 当然大部分同学认知它是因为它是最好前端编码
工具之一。下面记录一下我常用的一些插件，备忘。

> One Dark Pro 主题

非常漂亮的一款主题

安装命令：<code class="scode">ext install zhuangtongfa.Material-theme</code>

插件地址：https://marketplace.visualstudio.com/items?itemName=zhuangtongfa.Material-theme

切换主题快捷键： ctrl + K and ctrl + T

> css class 自动补全插件, IntelliSense for CSS class names in HTML

安装命令： <code class="scode">ext install Zignd.html-css-class-completion</code>

插件地址: https://marketplace.visualstudio.com/items?itemName=Zignd.html-css-class-completion

> 代码美化插件, Beautify

支持多种文件格式的，css,html,js,c 等主流语言都支持

安装命令： <code class="scode">ext install HookyQR.beautify</code>

插件地址: https://marketplace.visualstudio.com/items?itemName=HookyQR.beautify

> 开启 ES6 语法支持

__JavaScript (ES6) code snippets__

安装命令： <code class="scode">ext install xabikos.JavaScriptSnippets</code>

插件地址： https://marketplace.visualstudio.com/items?itemName=xabikos.JavaScriptSnippets

__ESLint__

安装命令： <code class="scode">ext install dbaeumer.vscode-eslint</code>

插件地址：https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

> Solidity 语法支持

要写 ETH 的智能合约, Solidity 肯定是少不了的。

安装命令: <code class="scode">ext install IoliteLabs.solidity-linux</code>

插件地址：https://marketplace.visualstudio.com/items?itemName=IoliteLabs.solidity-linux

安装命令：<code class="scode">ext install JuanBlanco.solidity</code>

插件地址：https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity

> 开启 Vue2.0 支持

安装命令: <code class="scode">ext install hollowtree.vue-snippets</code>

插件地址：https://marketplace.visualstudio.com/items?itemName=hollowtree.vue-snippets

开启 vue 文件图标美化：<code class="scode">ext install robertohuertasm.vscode-icons</code>

Vue 工具包， 比如内置 http-server 等: <code class="scode">ext install octref.vetur</code>

最后贴上一个配置文档

```javascript
{
	// 基础设置
	"editor.tabSize": 4,
	"editor.fontSize": 15,

	// Controls the font family.
	"editor.fontFamily": "'Droid Sans Mono', 'monospace', monospace, 'Droid Sans Fallback'",
	"workbench.startupEditor": "welcomePage",
	"editor.quickSuggestions": {
		"strings": true
	},

	// vue设置
	"emmet.syntaxProfiles": {
		"vue-html": "html",
		"vue": "html"
	},
	"files.associations": {
		"*.vue": "vue"
	},

	// vetur设置
	"vetur.format.defaultFormatter.html": "js-beautify-html",
	"vetur.format.defaultFormatter.js": "vscode-typescript",

	// eslint设置
	"eslint.autoFixOnSave": true,
	"eslint.validate": [
		"javascript",
	"javascriptreact",
	{
		"language": "html",
		"autoFix": true
	},
	{
		"language": "vue",
		"autoFix": true
	}
	],

	// format设置
	"javascript.format.insertSpaceBeforeFunctionParenthesis": false,

	"workbench.iconTheme": "vscode-icons",

	"solidity.compileUsingRemoteVersion" : "latest",

	"solidity.linter": "solium",
	"solidity.soliumRules": {
		"quotes": ["error", "double"],
		"indentation": ["error", 4]
	},
	"workbench.colorTheme": "One Dark Pro Vivid",
}
```
