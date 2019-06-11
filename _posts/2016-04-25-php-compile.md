---
layout: post
title: ubuntu编译安装php5.5.26
categories: [Linux]
tags: [linux,ubuntu,php]
status: publish
type: post
published: true
author: blackfox
permalink: /20160425/php-compile.html
description: ubuntu编译安装php5.5.26
---

安装依赖
=====

```bash
apt-get install -y build-essential gcc g++ make

for packages in bzip2 libzip-dev libperl-dev libc6-dev  
libevent-dev libpcre3 libpcre3-dev libpcrecpp0 zlibc openssl
libsasl2-dev libmcrypt-dev libbz2-1.0 libbz2-dev libpng3
libjpeg62 libjpeg62-dev libpng-dev libpng12-0 libpng12-dev curl
libcurl3 libmhash2 libmhash-dev libpq-dev libpq5 gettext
libncurses5-dev libjpeg-dev libxml2-dev libfreetype6
libfreetype6-dev libssl-dev libcurl3 libcurl4-openssl-dev
libcurl4-gnutls-dev mcrypt;
do
apt-get install -y $packages --force-yes;
apt-get -fy install;
apt-get -y autoremove;
done

```

下载php
====
去 http://php.net/downloads.php下载你想要安装的版本，我下载的是5.5.26

tar xvpzf php-5.5.26.tar.gz


配置php编译选项
========

```bash
cd php-5.5.26
./configure --prefix=/usr/local/php \
	 --with-config-file-path=/usr/local/php/etc \
	 --with-config-file-scan-dir=/usr/local/php/etc/conf.d \
	 --enable-fpm \
	 --with-mhash \
	 --with-fpm-user=www-data \
	 --with-fpm-group=www-data \
	 --with-mysql=mysqlnd \
	 --enable-maintainer-zts \
	 --with-mysqli=mysqlnd \
	 --with-pdo-mysql=mysqlnd \
	 --enable-opcache \
	 --enable-inline-optimization \
	 --enable-sockets \
	 --enable-zip \
	 --with-jpeg-dir \
	 --with-png-dir \
	 --enable-calendar \
	 --with-zlib \
	 --with-bz2 \
	 --with-iconv \
	 --with-gd \
	 --with-libXML-dir=/usr/local/phpdep/libxml2 \
	 --enable-gd-native-ttf \
	 --enable-mbstring \
	 --with-curl \
	 --enable-ftp \
	 --with-mcrypt \
	 --enable-bcmath \
	 --disable-debug \
	 --with-openssl \
	 --disable-fileinfo \
	 --enable-sysvsem --enable-inline-optimization

```

安装
=====

```bash

make ZEND_EXTRA_LIBS='-liconv'
make
make install

```

修改配置文档
======
```bash
cd /usr/local/php/etc
mkdir conf.d
cp php-fpm.con.default php-fpm.conf
cp  php.ini-development php.ini

```

编写启动脚本
====

vim /usr/local/bin/php-fpm

copy 下面代码

```bash

#!/bin/sh
#
# this script starts and stops the php-fpm daemon
# author yangjian
# processname: php-fpm
# config:      /usr/local/php/etc/php-fpm.conf


DESC="php-fpm daemon"
PHP_DIR=/usr/local/php
NAME=php-fpm
DAEMON=$PHP_DIR/sbin/$NAME
PHP_CONFIG_FILE=$PHP_DIR/etc/php.ini
FPM_CONFIG_FILE=$PHP_DIR/etc/php-fpm.conf
PIDFILE=$PHP_DIR/var/run/$NAME.pid

# If the daemon file is not found, terminate the script.
test -x $DAEMON || exit 0

d_start(){
	$DAEMON -y $FPM_CONFIG_FILE -c $PHP_CONFIG_FILE || echo " Faild to start service. \n"
}

d_stop(){
	kill -QUIT `cat $PIDFILE`  || echo -n " no running. \n"
}

d_reload(){
	kill -USR2 `cat $PIDFILE` || echo " could not reload. \n"
}

case "$1" in
start)
echo "Starting $DESC: $NAME OK!\n"
d_start
;;

stop)
echo "Stopping $DESC: $NAME OK!\n"
d_stop
;;

reload)
echo "Reloading $DESC configuration... \n"
d_reload
echo "Reloaded."
;;

restart)
echo -n "Restarting $DESC: $NAME Successfully. \n"
d_stop
sleep 1
d_start
;;

*)
echo "Usage:{start|stop|restart|reload)" >&2
exit 3
;;
esac
exit 0

```

启动php-fpm

> chmod +x /usr/local/bin/php-fpm <br/>
/usr/local/bin/php-fpm start
