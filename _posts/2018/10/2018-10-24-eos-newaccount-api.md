---
layout: post
title: 使用RPC接口新建EOS账户
categories: [EOS]
tags: [EOS,RPC]
status: publish
type: post
published: true
author: blackfox
permalink: /20181024/newaccount-with-rpc.html
keyword: EOS RPC, RPC 创建 EOS 账户
desc: 使用EOS RPC接口创建账户
---

其实这个问题我很早之前就折腾过一遍，只是当时没有做记录，导致现在要用的时候有部分细节记不清楚了，然后现在又重新调试了一次，赶紧记录下来。

废话不多说，直接上实战代码。

首先启动 EOS node，我的 EOS 钱包节点是搭建在 Docker 容器中的，所以我直接通过容器启动，至于如何安装 EOS 钱包节点，请参考我的另一篇博客
[EOS 本地开发环境搭建](/20180612/build-eos-dev-env.html).

```bash
# 启动 EOS 容器
docker start eosio

# 启动容器的节点脚本
docker exec -d eosio /run.sh
```

这里我提一句，我在容器的根目录新建了一个 run.sh 脚本，里面写了启动节点和 ssh-server 服务的脚本

```bash
#!/bin/bash

# start ssh-server
/etc/init.d/ssh start

# start EOS node
/root/bin/eos_node_start.sh
```

eos_node_start.sh 就是 EOS 节点的启动脚本，内容如下：

```bash
nodeos -e -p eosio \
	   --plugin eosio::wallet_api_plugin \
	   --plugin eosio::wallet_plugin \
	   --plugin eosio::producer_plugin \
	   --plugin eosio::history_plugin \
	   --plugin eosio::chain_api_plugin \
	   --plugin eosio::history_api_plugin \
	   --plugin eosio::http_plugin \
	   -d /data/data \
	   --config-dir /data/config \
	   --http-server-address=0.0.0.0:8888 \
	   --access-control-allow-origin=* --contracts-console
```
> 注意：部分参数比如 -d --config-dir 这些参数可能要根据自己的实际情况配置。

好了节点启动好了，我们先使用 curl 测试一下节点是否正常工作:

```bash
curl http://127.0.0.1:8888/v1/chain/get_info
```
得到类似下面的返回，则说明正常

```
{
    "server_version": "ade08c5d",
    "chain_id": "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
    "head_block_num": 50660,
    "last_irreversible_block_num": 50659,
    "last_irreversible_block_id": "0000c5e39c788cfd805b2400b3b1be0092b8e05f88a90fe42f7b1b7d41eb8db5",
    "head_block_id": "0000c5e4a6c55bde666135b175647ead9b65d0b93dca3fc3bce45333065be89c",
    "head_block_time": "2018-10-24T10:02:14",
    "head_block_producer": "eosio",
    "virtual_block_cpu_limit": 200000000,
    "virtual_block_net_limit": 1048576000,
    "block_cpu_limit": 199900,
    "block_net_limit": 1048576
}
```

接下来我们进入正题，开始实战测试，首先我们需要一个发送 RPC 请求的工具，你可以直接 CURL， 我这里用的是 postman，为什么选它，因为它好用，方便。

> 1、将要发送的交易数据(创建账户)转成 binary data(二进制)

请求接口： POST http://127.0.0.1:8888/v1/chain/abi_json_to_bin

请求参数示例：

```javascript
{
  "code": "eosio",
  "action": "newaccount",
  "args": {
    "creator": "eosio",
    "name": "ppblock",
    "owner": {
      "threshold": 1,
      "keys": [
        {
          "key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
          "weight": 1
        }
      ],
      "accounts": [],   
      "waits": []      
    },
    "active": {
      "threshold": 1,
      "keys": [
        {
          "key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
          "weight": 1
        }
      ],
      "accounts": [],    
      "waits": []        
    }
  }
}
```

这里有几个参数需要解释一下：

__再解释参数之前，先声明一下，EOS 系统中几乎所有的操作都是通过智能合约来完成的，所以你会看到大部分 RPC 接口都有要传入 code, action, args 等这些参数。
其实这些都是智能合约的参数，后面我就不一一介绍了。__

参数名称 | 参数说明
--------|------
code | 智能合约的名称
action | 调用智能合约方法的名称
args | 智能合约参数
args.creator | 账户的创建者(EOS 创建账户是通过合约调用实现的，而合约调用需要抵押CPU和内存等资源，所以必须指定合约调用人)
args.name | 新创建的账户名称
key | 创建账户的公钥，使用哪个公钥创建账户

返回示例:

```javascript
{
    "binargs": "0000000000ea305500000000221a4fad01000000010002c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf0100000001000000010002c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf01000000"
}
```

> 2、获取当前节点信息，得到 EOS 区块链的最新区块号

请求接口：GET http://127.0.0.1:8888/v1/chain/get_info

请求参数： 无

返回报文：

```bash
{
    "server_version": "ade08c5d",
    "chain_id": "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
    "head_block_num": 50660,
    "last_irreversible_block_num": 50659,
    "last_irreversible_block_id": "0000c5e39c788cfd805b2400b3b1be0092b8e05f88a90fe42f7b1b7d41eb8db5",
    "head_block_id": "0000c5e4a6c55bde666135b175647ead9b65d0b93dca3fc3bce45333065be89c",
    "head_block_time": "2018-10-24T10:02:14",
    "head_block_producer": "eosio",
    "virtual_block_cpu_limit": 200000000,
    "virtual_block_net_limit": 1048576000,
    "block_cpu_limit": 199900,
    "block_net_limit": 1048576
}
```

部分返回参数解读：

参数名称 | 参数说明
-------|--------
server_version | 钱包客户端的版本号
chain_id | 网络 ID，我这个本地测试网络，EOS 主网 ID 是: aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906
head_block_num | 最新区块号
head_block_producer | 出块帐号


> 3、获取最新区块的具体信息

请求接口：POST http://127.0.0.1:8888/v1/chain/get_block

请求参数示例：

```javascript
{
	"block_num_or_id":50174
}
```
这里的 block_num_or_id 就是上面返回的最新区块号 head_block_num

返回报文：

```javascript
{
    "timestamp": "2018-10-24T09:58:11.000",
    "producer": "eosio",
    "confirmed": 0,
    "previous": "0000c3fda119172e5a5ee1a77340220edf65b7d9afc78abaf89dd6e30f5ab7d2",
    "transaction_mroot": "0000000000000000000000000000000000000000000000000000000000000000",
    "action_mroot": "0202b72cff370d0468ed248783f6fa3c190972d971a1c393e15b27bdf115ed5a",
    "schedule_version": 0,
    "new_producers": null,
    "header_extensions": [],
    "producer_signature": "SIG_K1_KBH5MjttdatGy6DADxbedo2Zge8sNeYAYgUZBFFxF1Hx5fKMDWBXBzaZreWS3KQf4GUrUcLE4f29e1yf94ZTNJhKruTpJY",
    "transactions": [],
    "block_extensions": [],
    "id": "0000c3fe106753e86c440c4a07c166a6cdb9f46a9f49957b102162e6d3a7172a",
    "block_num": 50174,
    "ref_block_prefix": 1242317932
}
```
这一步是为了获取 ref_block_prefix, 后面签名的时候需要用到

> 4、解锁钱包，如果你的钱包已经解锁了，这一步可以跳过

请求接口：POST  http://127.0.0.1:8888/v1/wallet/unlock

请求参数示例：

```javascript
["default","PW5J6V6g3jR8NdeNrzPg9PP87z4hWiCEbb8qx2xLqnRFrNhfhZGKx"]
```
这里只有两个参数，第一个是钱包名称，第二个是钱包密码，如果解锁成功会返回空

```javascript
{}
```

> 5、签名交易，生成交易签名

请求参数示例：

```javascript
[
  { "ref_block_num": 50174,
    "ref_block_prefix": 1242317932,
    "expiration": "2018-10-24T10:08:14",
    "actions": [
      {
        "account": "eosio",
        "name": "newaccount",
        "authorization": [
          {
            "actor": "eosio",
            "permission": "active"
          }
        ],
        "data": "0000000000ea305500000000221a4fad01000000010002c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf0100000001000000010002c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf01000000"
      }
    ],
    "signatures": []
  },
  [
    "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"
  ],
  "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f"
]
```

部分请求参数解析：

参数名称 | 参数类型 |  参数说明
------|--------|-----
ref_block_num | number | get_block获得的最新区块号
ref_block_prefix |number | get_block获得的最新区块号相关信息
expiration | string| 签名过期时间，这个可以把第 3 步的 timestamp 加上 一段时间 ，例如1分钟。
account | string | 调用系统智能合约账号名，这里为 eosio
name | string | 智能合约的方法, 这里为 newaccount
authorization.actor | string | 执行操作的用户名
authorization.permission | string | 执行操作的权限
data | string| abi_json_to_bin 序列化后的 值 binargs
EOS6MR...| string | 创建者的公钥
cf057...| string | get_info 获得的网络 ID，__这个非常重要，网上很多教程里面都漏掉这个了，会导致后面发送交易的时候报签名错误__

返回报文：

```javascript
{
    "expiration": "2018-10-24T10:08:14",
    "ref_block_num": 50174,
    "ref_block_prefix": 1242317932,
    "max_net_usage_words": 0,
    "max_cpu_usage_ms": 0,
    "delay_sec": 0,
    "context_free_actions": [],
    "actions": [
        {
            "account": "eosio",
            "name": "newaccount",
            "authorization": [
                {
                    "actor": "eosio",
                    "permission": "active"
                }
            ],
            "data": "0000000000ea305500000000221a4fad01000000010002c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf0100000001000000010002c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf01000000"
        }
    ],
    "transaction_extensions": [],
    "signatures": [
        "SIG_K1_K73PhYL44Jg6FVqbrAUnknGyxveNU1ZpazjG2Swdf8qVmxJJpcVYTA6WibzfZbFXUm2cZuFFxGTECbBvkA2bXs7ZGUWodn"
    ],
    "context_free_data": []
}
```

这一步我们主要是要获取签名(signatures 字段里面的内容)

> 6、发送交易，执行智能合约，创建账户

请求接口：POST http://127.0.0.1:8888/v1/chain/push_transaction

请求参数示例：

```javascript
{
  "compression": "none",
  "transaction": {
    "ref_block_num": 50174,
    "ref_block_prefix": 1242317932,
    "expiration": "2018-10-24T10:08:14",
    "actions": [
      {
        "account": "eosio",
        "name": "newaccount",
        "authorization": [
          {
            "actor": "eosio",
            "permission": "active"
          }
        ],
        "data": "0000000000ea305500000000221a4fad01000000010002c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf0100000001000000010002c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf01000000"
      }
    ]
  },
  "signatures": ["SIG_K1_K73PhYL44Jg6FVqbrAUnknGyxveNU1ZpazjG2Swdf8qVmxJJpcVYTA6WibzfZbFXUm2cZuFFxGTECbBvkA2bXs7ZGUWodn"]
}
```
发送交易请求的参数几乎跟签名的请求参数一样，就多了一个签名字段(signatures)

如果执行成功，就会返回以下类似报文：

```javascript
{
    "transaction_id": "0400904fbdd29b949b6404a4d6a9fca78b05c9ff72aecd5f2ec5599c306b14b1",
    "processed": {
        "id": "0400904fbdd29b949b6404a4d6a9fca78b05c9ff72aecd5f2ec5599c306b14b1",
        "receipt": {
            "status": "executed",
            "cpu_usage_us": 8956,
            "net_usage_words": 25
        },
        "elapsed": 8956,
        "net_usage": 200,
        "scheduled": false,
        "action_traces": [
            {
                "receipt": {
                    "receiver": "eosio",
                    "act_digest": "b52aed28f45c698133e0ea781b05aa03317c2cfdf4594232124a5f378c3c36e1",
                    "global_sequence": 50982,
                    "recv_sequence": 50982,
                    "auth_sequence": [
                        [
                            "eosio",
                            50982
                        ]
                    ],
                    "code_sequence": 0,
                    "abi_sequence": 0
                },
                "act": {
                    "account": "eosio",
                    "name": "newaccount",
                    "authorization": [
                        {
                            "actor": "eosio",
                            "permission": "active"
                        }
                    ],
                    "data": {
                        "creator": "eosio",
                        "name": "ppblock",
                        "owner": {
                            "threshold": 1,
                            "keys": [
                                {
                                    "key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
                                    "weight": 1
                                }
                            ],
                            "accounts": [],
                            "waits": []
                        },
                        "active": {
                            "threshold": 1,
                            "keys": [
                                {
                                    "key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
                                    "weight": 1
                                }
                            ],
                            "accounts": [],
                            "waits": []
                        }
                    },
                    "hex_data": "0000000000ea305500000000221a4fad01000000010002c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf0100000001000000010002c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf01000000"
                },
                "elapsed": 53,
                "cpu_usage": 0,
                "console": "",
                "total_cpu_usage": 0,
                "trx_id": "0400904fbdd29b949b6404a4d6a9fca78b05c9ff72aecd5f2ec5599c306b14b1",
                "inline_traces": []
            }
        ],
        "except": null
    }
}
```

返回的报文参数比较多，包括各种交易 hash，区块hash 等。

下面我们来测试一下看看账号是否创建成功，进入 Docker 容器，使用下面命令查看我们创建的账号

```bash
cleos get accounts EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
```

输出信息：

```javascript
{
  "account_names": [
    "ppblock",
    "xiaoyang333"
  ]
}
```
返回两个账号，其中就有我们刚刚新创建的 <code class="scode">ppblock</code>

再查看一下详细信息

```bash
cleos get account ppblock --json
```

输出信息：

```javascript
{
  "account_name": "ppblock",
  "privileged": false,
  "last_code_update": "1970-01-01T00:00:00.000",
  "created": "2018-10-24T10:04:54.000",
  "ram_quota": -1,
  "net_weight": -1,
  "cpu_weight": -1,
  "net_limit": {
    "used": -1,
    "available": -1,
    "max": -1
  },
  "cpu_limit": {
    "used": -1,
    "available": -1,
    "max": -1
  },
  "ram_usage": 2724,
  "permissions": [{
      "perm_name": "active",
      "parent": "owner",
      "required_auth": {
        "threshold": 1,
        "keys": [{
            "key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
            "weight": 1
          }
        ],
        "accounts": [],
        "waits": []
      }
    },{
      "perm_name": "owner",
      "parent": "",
      "required_auth": {
        "threshold": 1,
        "keys": [{
            "key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
            "weight": 1
          }
        ],
        "accounts": [],
        "waits": []
      }
    }
  ],
  "total_resources": null,
  "self_delegated_bandwidth": null,
  "voter_info": null
}

```

至此，我们已经成功的使用 RPC 接口创建了 EOS 帐号。
