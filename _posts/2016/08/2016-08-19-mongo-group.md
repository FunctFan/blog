---

layout: post
title: "细说mongodb 分组查询"
categories: [Database]
tags: [mongodb,php]
status: publish
type: post
published: true
author: blackfox
permalink: /20160819/mongodb-group.html
keyword : mongodb分组查询

---

最近在给<code>herosphp</code>框架添加mongodb支持，考虑到后期可能要切换模型，所以就把Model层把mysql和mongodb的查询语法做了兼容，屏蔽差异性。简单的增删查改都没有问题，可以很方便的做兼容，但是在处理分组查询的时候，发现mongodb的分组查询跟mysql的差别还是蛮大的。

mongodb的原生查询shell语法是这样的

```bash
db.collection.group({keys, initial, reduce, conditions })
```

包含四个参数

参数名 | 参数说明
-------|---------
keys | 分组字段
initial | 分组初始条件
reduce | 分组计算方式，是一个javascript函数表达式
conditions | 分组条件，相当与mysql中的having

下面看php的demo

```php
$address = array('东莞','深圳','广州','北京','上海','杭州');
for ( $i = 0; $i < 100; $i++ ) {
	$data = array(
		"id" => uniqid()+$i,
		"name" => "user_{$i}",
		"age" => $i,
		"address" => $address[mt_rand(0,5)]
	);

	$collection->insert($data);
}

$keys = array("address" => 1);
$initial = array("items" => array());
$reduce = "function (obj, prev) { prev.items.push({id:obj.id, name:obj.name, age:obj.age}); }";
$conditions = array('age' => '>30');
$items = $collection->($keys, $initial, $reduce, $conditions);
print_r($items);
```

类似输出

```html
Array
(
    [0] => Array
        (
            [address] => 广州
            [items] => Array
                (
                    [0] => Array
                        (
                            [id] => B21A-57B2EA6F-02773128-DD27-721CC2CD
                            [name] => user_31
                            [age] => 31
                        )

                    [1] => Array
                        (
                            [id] => B21A-57B2EA6F-02DBC660-7DDB-C88F1629
                            [name] => user_44
                            [age] => 44
                        )

                    [2] => Array
                        (
                            [id] => B21A-57B2EA6F-02EAB698-A2FC-C18B29C7
                            [name] => user_48
                            [age] => 48
                        )


                )

        )

    [1] => Array
        (
            [address] => 深圳
            [items] => Array
                (
                    [0] => Array
                        (
                            [id] => B21A-57B2EA6F-027ED43C-C635-8614CA6F
                            [name] => user_32
                            [age] => 32
                        )

                    [1] => Array
                        (
                            [id] => B21A-57B2EA6F-0286BECC-A1FA-83664B53
                            [name] => user_33
                            [age] => 33
                        )

                    [2] => Array
                        (
                            [id] => B21A-57B2EA6F-02FCC0F4-1068-CA3956FA
                            [name] => user_53
                            [age] => 53
                        )

                    [3] => Array
                        (
                            [id] => B21A-57B2EA6F-0305C334-74E8-FEAED1C5
                            [name] => user_56
                            [age] => 56
                        )

                    [4] => Array
                        (
                            [id] => B21A-57B2EA6F-03A1C194-C9E2-7DA08D30
                            [name] => user_83
                            [age] => 83
                        )

                    [5] => Array
                        (
                            [id] => B21A-57B2EA6F-03BAEBC4-1D32-DAE7B6F6
                            [name] => user_91
                            [age] => 91
                        )

                    [6] => Array
                        (
                            [id] => B21A-57B2EA6F-03C5C8A0-756F-4431B377
                            [name] => user_94
                            [age] => 94
                        )

                    [7] => Array
                        (
                            [id] => B21A-57B2EA6F-03CC3BCC-5369-5640621D
                            [name] => user_96
                            [age] => 96
                        )

                )

        )

    [2] => Array
        (
            [address] => 东莞
            [items] => Array
                (
                    [0] => Array
                        (
                            [id] => B21A-57B2EA6F-028EAAEC-F943-739CB194
                            [name] => user_34
                            [age] => 34
                        )

                    [1] => Array
                        (
                            [id] => B21A-57B2EA6F-02964824-991A-02042310
                            [name] => user_35
                            [age] => 35
                        )

                    [2] => Array
                        (
                            [id] => B21A-57B2EA6F-02A5AD28-7FC6-E3467535
                            [name] => user_37
                            [age] => 37
                        )

                    [3] => Array
                        (
                            [id] => B21A-57B2EA6F-02AD62FC-C660-1041D78D
                            [name] => user_38
                            [age] => 38
                        )

                    [4] => Array
                        (
                            [id] => B21A-57B2EA6F-02D396AC-065B-C482232D
                            [name] => user_43
                            [age] => 43
                        )

                )

        )


)
```

令人眼前一亮的是mongodb的分组计算方式 reduce, 是一个javascript函数表达式，这样我们可以很方便的自定义分组方式，并且得到我们想要的数据。不像mysql一样要先查出分组，然后再根据分组查询，麻烦不说，而且效率也很低。
