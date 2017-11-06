---
layout: post
title: jekyll 环境的搭建
categories: [小工具]
tags: [jekyll,ruby]
status: publish
type: post
published: true
author: blackfox
permalink: /20160302/jekyll-install.html
description: liquid学习笔记
---

jekyll是一个不可思议的博客系统，优雅，简单。
jekyll不需要数据库支持。但是可以配合第三方服务,例如Disqus搭建功能丰富的博客。最关键的是jekyll可以免费部署在Github上，而且可以绑定自己的域名。
有了她之后你可以在vim编辑器中愉快的写博客，然后push到github去发布博客，这种感觉总结来说就一个词：很吊！

安装ruby
=====

由于jekyll的运行依赖于 ruby, 所以你必须先安装 ruby

```bash
sudo apt-get install ruby ruby-dev
```

如果你用的ubuntu 14.01 LTS desktop版， 也许会出现找不到软件包 ruby-dev 的报错
没有关系，是你的系统缺少ruby开发环境的源，给它加上就好了

```bash
sudo apt-add-repository ppa:brightbox/ruby-ng
sudo apt-get update
sudo apt-get install ruby ruby-dev  //注意，这里的ruby版本你可以指定如：ruby2.2
```

接下来你就可以使用gem安装jekyll了

```bash
sudo gem install jekyll
```

如果安装过程中出现如下报错

<blockquote>
ERROR:  While executing gem ... (Gem::RemoteFetcher::FetchError)
    Errno::ECONNRESET: Connection reset by peer - SSL_connect (https://api.rubygems.org/quick/Marshal.4.8/jekyll-3.1.2.gemspec.rz)
</blockquote>

这是因为ruby的镜像被墙了，改用taobao镜像

```bash
gem sources --r https://rubygems.org/
gem sources --r http://rubygems.org/
gem sources -a https://ruby.taobao.org/
```

安装必备组件

```bash
sudo gem install pygments.rb
sudo gem install redcarpet.rb
```


这样就把jekyll安装完成了。

好了，你接下来可以创建你的blog了，切换到你要创建博客的目录

```bash
jekyll new blog
```

如果不幸的出现如下报错信息，那么恭喜你，你中奖了。

{% raw %}
/usr/lib/ruby/1.9.1/rubygems/custom_require.rb:36:in `require': iconv will be deprecated in the future, use String#encode instead.
WARNING: Could not read configuration. Using defaults (and options).
	No such file or directory - new/_config.yml
Building site: new -> blog
/usr/lib/ruby/vendor_ruby/jekyll/site.rb:126:in `chdir': No such file or directory - /home/yangjian/new/ (Errno::ENOENT)
	from /usr/lib/ruby/vendor_ruby/jekyll/site.rb:126:in `read_directories'
	from /usr/lib/ruby/vendor_ruby/jekyll/site.rb:98:in `read'
	from /usr/lib/ruby/vendor_ruby/jekyll/site.rb:38:in `process'
	from /usr/bin/jekyll:250:in `<main>'
yangjian@yangjian-desktop:~$ ruby custom_require.rb install
ruby: No such file or directory -- custom_require.rb (LoadError)
{% endraw %}

出现这个问题原因很简单，报错信息也提示的很清楚，那就是你安装的ruby版本和jekyll需要的版本不一样
原因是系统本身已经安装了ruby1.9.1
所以你现在要做的就是把老版本的ruby卸载掉

```bash
sudo apt-get remove ruby1.9.1 ruby1.9.1-dev
```

再查看ruby版本 ruby -v, 如果出现类似

ruby 2.2.4p230 (2015-12-16 revision 53155) [x86_64-linux-gnu]

那么恭喜你，你的老的ruby版本删除了，默认使用的是新的版
现在再执行

```bash
jekyll new blog
```

出现 New jekyll site installed in /home/user/blog. 那么恭喜你安装成功了，接下来你可以愉快玩耍 jekyll了。