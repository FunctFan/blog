---
layout: post
title: "使用存储过程删除字段和索引"
date: 2015-05-19
categories: 数据库技术
tags: [存储过程,删除字段,删除索引,mysql]
status: publish
type: post
published: true
author: blackfox
permalink: /2015-05-19/delete-index-by-procedure.html
description: 'ubuntu 安装 flashplayer'
---

今天对公司OA系统的数据表进行了一些重构，需要删除很多字段和索引，但是发现有两个问题

第一个就是：删除字段的语句要些很多变，好麻烦的说

第二个就是：当字段或者索引不存在时会报错，这样下面sql语句就会被中断执行，这个更麻烦

所以第一时间就想到了使用mysql的存储过程就可以解决这个问题，这里记录一下sql语句，以便以后借鉴

删除字段
===

```mysql
DROP PROCEDURE IF EXISTS Del_Col;  
-- 创建删除字段的存储过程

create procedureDel_Col (IN p_tablename VARCHAR(200), IN p_col VARCHAR(200)) 

BEGIN 



  if exists (select * from information_schema.columns WHERE table_name = p_tablename AND column_name = p_col) then

     alter table p_tablename drop column p_col;

  end if; 


END $$


DELIMITER ;

CALL Del_Col ('user', 'country_id');

```

删除索引
===

```mysql
-- 删除已经存在的存储过程
DROP PROCEDURE IF EXISTS Del_idx; 
DELIMITER $$
-- 创建删除索引的存储过程 
create procedure Del_idx(IN p_tablename VARCHAR(200), IN p_idxname VARCHAR(200)) 
BEGIN 

     DECLARE str VARCHAR(250); 

  set @str=concat(' drop index ',p_idxname,' on ',p_tablename);  

  select count(*) into @cnt from information_schema.statistics where table_name=p_tablename and index_name=p_idxname ; 

  if @cnt > 0 then  

    PREPARE stmt FROM @str; 

    EXECUTE stmt ; 

  end if; 

END $$

DELIMITER ;
-- 删除文章索引
CALL Del_idx('article', 'userid');

```
