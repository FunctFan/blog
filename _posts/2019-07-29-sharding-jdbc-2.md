---
layout: post
title: Sharding-JDBC 系列 02 - 读写分离
categories: [Java, Sharding-JDBC]
tags: [sharding-jdbc,读写分离]
status: publish
type: post
published: true
author: blackfox
permalink: /20190729/sharding-jdbc-02.html
keyword: Sharding-JDBC 快速入门
desc: Sharding-JDBC 读写分离, Sharding-JDBC 快速入门
---

上文我们讲述了如何使用 [Sharding-JDBC 分库分表](/20190728/sharding-jdbc-01.html)

本文我们讲述如何使用 `Sharding-JDBC` 实现读写分离。为了节省时间，我们项目结构仍然沿用上文的，只需要增加读写分离的配置就好了。

# 配置 MySQL 读写分离

请参考我的另一篇博客 [使用 docker 搭建 MySQL 主从同步/读写分离](/20190727/mysql-master-slave-in-docker.html)。这里就不赘述了。

# 创建数据表

分别在 master 和 slave 节点分别执行下面的 SQL

```sql 
CREATE DATABASE demo_ds CHARSET=utf8;
use demo_ds;
DROP TABLE IF EXISTS `t_user_0`;
CREATE TABLE `t_user_0` (
  `user_id` bigint(20) AUTO_INCREMENT,
  `username` varchar(30) NOT NULL,
  `password` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `t_user_1`;
CREATE TABLE `t_user_1` (
  `user_id` bigint(20) AUTO_INCREMENT,
  `username` varchar(30) NOT NULL,
  `password` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

# 配置 Properties

这里我们只需要修改 `application.properties`，其他的项目文件，比如 Mapper, Model, Service 等我们都沿用上个项目的。

```properties
# 所有数据源列表
sharding.jdbc.datasource.names=ds-master,ds-slave-0

# 主数据源
sharding.jdbc.datasource.ds-master.type=com.alibaba.druid.pool.DruidDataSource
sharding.jdbc.datasource.ds-master.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.ds-master.url=jdbc:mysql://localhost:3307/demo_ds
sharding.jdbc.datasource.ds-master.username=root
sharding.jdbc.datasource.ds-master.password=123456

# 从数据源，这里我是用 docker 在本地创建了2个 MySQL 服务容器，数据库名称一样，方便配置 MySQL 主从复制，端口不一样
sharding.jdbc.datasource.ds-slave-0.type=com.alibaba.druid.pool.DruidDataSource
sharding.jdbc.datasource.ds-slave-0.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.ds-slave-0.url=jdbc:mysql://localhost:3308/demo_ds
sharding.jdbc.datasource.ds-slave-0.username=root
sharding.jdbc.datasource.ds-slave-0.password=123456

# 读写分离设置
sharding.jdbc.config.sharding.master-slave-rules.ds0.master-data-source-name=ds-master
sharding.jdbc.config.sharding.master-slave-rules.ds0.slave-data-source-names=ds-slave-0


# 分表配置
#actual-data-nodes：真实数据节点，由数据源名 + 表名组成，以小数点分隔。多个表以逗号分隔，支持inline表达式
sharding.jdbc.config.sharding.tables.t_user.actual-data-nodes=ds0.t_user_${0..1}
# 分表的字段配置
sharding.jdbc.config.sharding.tables.t_user.table-strategy.inline.sharding-column=user_id
# 分表的算法表达式(取模 , HASH , 分块等)
sharding.jdbc.config.sharding.tables.t_user.table-strategy.inline.algorithm-expression=t_user_${user_id.longValue() \
  % 2}
# 配置自动生成主键
sharding.jdbc.config.sharding.tables.t_user.key-generator-column-name=user_id

# open debug mode for mybatis，print SQL in console
logging.level.org.rockyang.shardingjdbc.common.mapper=DEBUG
logging.level.org.springframework=INFO
mybatis.configuration.cache-enabled=false
```

# Application 

```java 
@SpringBootApplication(scanBasePackages={
		// 这里用的是上个项目的 mapper 和 service, 所以需要把扫描路径加入
		"org.rockyang.shardingjdbc.common",
		"org.rockyang.shardingjdbc.rw"
})
@MapperScan("org.rockyang.shardingjdbc.common.mapper")
public class MasterSlaveApplication {

	public static void main(String[] args) {
		SpringApplication.run(MasterSlaveApplication.class, args);
	}

}
```

这里因为项目进行了重构，我把通用的 Mapper, Model, Service 都抽出来放到 `common` 模块了。具体架构请到后面看完整的项目源码。

# 执行单元测试

```java 
@RunWith(SpringRunner.class)
@SpringBootTest
public class MasterSlaveTest {

	private static Logger logger = LoggerFactory.getLogger(MasterSlaveTest.class);

	@Autowired
	private UserService userService;

	@Test
	public void testAdd()
	{
		String username = StringUtil.generateRandomString(20);
		String password = StringUtil.generateRandomString(20);
		User user = new User(username, password);
		userService.add(user);
		logger.info("userId: {}", user.getUserId());
	}

	@Test
	public void testAddBatch()
	{
		String username;
		String password;
		for (int i = 0; i < 100; i++) {
			username = StringUtil.generateRandomString(20);
			password = StringUtil.generateRandomString(20);
			User user = new User(username, password);
			userService.add(user);
			logger.info("userId: {}", user.getUserId());
		}
	}

	@Test
	public void testSelect()
	{
		List<User> users = userService.selectAll();
		logger.info("Total records: {}", users.size());
		for (User user : users) {
			logger.info("{}", user);
		}
	}
}
```

# 验证测试结果

* 执行 `testAddBatch()` 单元测试，往 master 节点插入 100 条数据，然后 slave 节点是否同步了数据
* 在 slave 节点删除一条数据，然后执行 `testSelect()` 单元测试，如果查询出来的数据是 99 条，则说明是从 slave 节点读取的数据。

# 项目源码链接

[sharding-jdbc-spring-boot-demo](https://gitee.com/blackfox/sharding-jdbc-spring-boot-demo)

# 参考链接
* https://shardingsphere.apache.org/document/current/cn/manual/sharding-jdbc/usage/read-write-splitting/

