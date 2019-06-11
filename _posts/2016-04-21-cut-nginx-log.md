---
layout: post
title: 切割 nginx 日志
categories: [Linux]
tags: [nginx]
status: publish
type: post
published: true
author: blackfox
permalink: /20160421/cut-nginx-log.html
description:
---

nginx运行时间久了日志会比较大，经常会需要将日志按天切割，方便查看。不多说，直接上脚本

```bash

#!/bin/bash
# this script cut nginx logs

# nginx日志根目录
LOGS_PATH="/var/log/nginx"
PID="/var/run/nginx.pid"

## get the date of yesterday  yyyy-MM-dd
YESTERDAY=$(date -d last-day +%Y-%m-%d)

## 生成路径
DATE_PATH=$(date -d last-day +%Y)/$(date -d last-day +%m)

## 项目日志的路径
APP=${LOGS_PATH}/myapp

## 创建日志路径
mkdir -p ${LOGS_PATH}/${DATE_PATH}/
mkdir -p ${APP}/${DATE_PATH}/

## 移动日志
mv ${LOGS_PATH}/access.log ${LOGS_PATH}/${DATE_PATH}/access_${YESTERDAY}.log
mv ${APP}/access.log ${APP}/${DATE_PATH}/access_${YESTERDAY}.log

## 向 Nginx 主进程发送 USR1 信号。USR1 信号是重新打开日志文件
kill -USR1 `cat ${PID}`

```

这样日志就会按天分割了。
