---
layout: post
title: Sharding-JDBC 系列 03 - 自定义分片算法
categories: [Java, Sharding-JDBC]
tags: [sharding-jdbc]
status: publish
type: post
published: true
author: blackfox
permalink: /20190729/sharding-jdbc-03.html
keyword: Sharding-JDBC 自定义分片算法
desc: Sharding-JDBC 自定义分片算法, Sharding-JDBC 快速入门
---


本文我们讲述如何使用 `Sharding-JDBC` 实现自定义分表分库算法。

### 相关文章

* [Sharding-JDBC 系列 01 - 分库分表](/20190728/sharding-jdbc-01.html)
* [Sharding-JDBC 系列 02 - 读写分离](/20190729/sharding-jdbc-02.html)

还是老规矩，我这里就不重新演示怎么建项目了，项目结构仍然沿用上文的，如果想看项目构建流程的请移步
[这里](/20190728/sharding-jdbc-01.html)。

# 分片算法
Sharding-JDBC 目前提供4种分片算法。由于分片算法和业务实现紧密相关，因此并未提供内置分片算法，而是通过分片策略将各种场景提炼出来，
提供更高层级的抽象，并提供接口让应用开发者自行实现分片算法。

> 1.精确分片算法

对应PreciseShardingAlgorithm，用于处理使用单一键作为分片键的=与IN进行分片的场景。需要配合StandardShardingStrategy使用。

> 2.范围分片算法

对应RangeShardingAlgorithm，用于处理使用单一键作为分片键的BETWEEN AND进行分片的场景。需要配合StandardShardingStrategy使用。

> 3.复合分片算法

对应ComplexKeysShardingAlgorithm，用于处理使用多键作为分片键进行分片的场景，包含多个分片键的逻辑较复杂，
需要应用开发者自行处理其中的复杂度。需要配合ComplexShardingStrategy使用。

> 4.Hint分片算法 

对应HintShardingAlgorithm，用于处理使用Hint行分片的场景。需要配合HintShardingStrategy使用。

我们在前面 `Sharding-JDBC` 系列第一篇的时候用到过系统内置的分表分库算法，配置起来非常简单，
直接使用 [行表达式](https://shardingsphere.apache.org/document/current/cn/features/sharding/other-features/inline-expression/) 就可以
搞定。但是它的功能比较简单，只能进行简单的取模，哈希运算等，对于需要根据业务逻辑进行复杂的分片规则，这个根本实现不了。
这个需要用到我们接下来要实践的复合分片算法。

# 创建数据表
```sql
CREATE DATABASE demo_ds_0 CHARSET=utf8;
use demo_ds_0;
DROP TABLE IF EXISTS `t_order_0`;
CREATE TABLE `t_order_0` (
  `order_id` bigint(20) AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `status` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `t_order_1`;
CREATE TABLE `t_order_1` (
  `order_id` bigint(20) AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `status` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE DATABASE demo_ds_1 CHARSET=utf8;
use demo_ds_1;
DROP TABLE IF EXISTS `t_order_0`;
CREATE TABLE `t_order_0` (
  `order_id` bigint(20) AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `status` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `t_order_1`;
CREATE TABLE `t_order_1` (
  `order_id` bigint(20) AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `status` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

# 修改配置

```properties
server.port=9002

# 数据库连接池配置变量
initialSize=5
minIdle=5
maxIdle=100
maxActive=20
maxWait=60000
timeBetweenEvictionRunsMillis=60000
minEvictableIdleTimeMillis=300000

####################################
# configuration of DataSource
####################################
sharding.jdbc.datasource.names=ds0,ds1

sharding.jdbc.datasource.ds0.type=com.alibaba.druid.pool.DruidDataSource
sharding.jdbc.datasource.ds0.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.ds0.url=jdbc:mysql://localhost:3306/demo_ds_0
sharding.jdbc.datasource.ds0.username=root
sharding.jdbc.datasource.ds0.password=123456
# 初始连接数
sharding.jdbc.datasource.ds0.initialSize=${initialSize}
# 最小连接数
sharding.jdbc.datasource.ds0.minIdle=${minIdle}
# 最大连接池数量
sharding.jdbc.datasource.ds0.maxActive=${maxActive}
# 配置获取连接等待超时的时间
sharding.jdbc.datasource.ds0.maxWait=${maxWait}
# 用来检测连接是否有效的sql
sharding.jdbc.datasource.ds0.validationQuery=SELECT 1 FROM DUAL
# 配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒
sharding.jdbc.datasource.ds0.timeBetweenEvictionRunsMillis=${timeBetweenEvictionRunsMillis}
# 配置一个连接在池中最小生存的时间，单位是毫秒
sharding.jdbc.datasource.ds0.minEvictableIdleTimeMillis=${minEvictableIdleTimeMillis}

sharding.jdbc.datasource.ds1.type=com.alibaba.druid.pool.DruidDataSource
sharding.jdbc.datasource.ds1.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.ds1.url=jdbc:mysql://localhost:3306/demo_ds_1
sharding.jdbc.datasource.ds1.username=root
sharding.jdbc.datasource.ds1.password=123456
# 初始连接数
sharding.jdbc.datasource.ds1.initialSize=${initialSize}
# 最小连接数
sharding.jdbc.datasource.ds1.minIdle=${minIdle}
# 最大连接池数量
sharding.jdbc.datasource.ds1.maxActive=${maxActive}
# 配置获取连接等待超时的时间
sharding.jdbc.datasource.ds1.maxWait=${maxWait}
# 用来检测连接是否有效的sql
sharding.jdbc.datasource.ds1.validationQuery=SELECT 1 FROM DUAL
# 配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒
sharding.jdbc.datasource.ds1.timeBetweenEvictionRunsMillis=${timeBetweenEvictionRunsMillis}
# 配置一个连接在池中最小生存的时间，单位是毫秒
sharding.jdbc.datasource.ds1.minEvictableIdleTimeMillis=${minEvictableIdleTimeMillis}

####################################
# 分库分表配置
####################################
#actual-data-nodes：真实数据节点，由数据源名 + 表名组成，以小数点分隔。多个表以逗号分隔，支持inline表达式
sharding.jdbc.config.sharding.tables.t_order.actual-data-nodes=ds${0..1}.t_order_${0..1}

# 自定义分库分表算法
sharding.jdbc.config.sharding.tables.t_order.databaseStrategy.complex.shardingColumns=order_id,user_id
sharding.jdbc.config.sharding.tables.t_order.databaseStrategy.complex.algorithmClassName=org.rockyang.shardingjdbc\
  .cusalgo.algorithm.DbShardingAlgorithm

## 自定义分表算法
sharding.jdbc.config.sharding.tables.t_order.tableStrategy.complex.shardingColumns=order_id,user_id
sharding.jdbc.config.sharding.tables.t_order.tableStrategy.complex.algorithmClassName=org.rockyang\
  .shardingjdbc.cusalgo.algorithm.TableShardingAlgorithm

# open debug mode for mybatis，print SQL in console
logging.level.org.rockyang.shardingjdbc.common.mapper=DEBUG
logging.level.org.springframework=INFO
mybatis.configuration.cache-enabled=false
```

配置很简单，我都写了详细的注释，因此这里就不再解释了。**需要注意的是这里我使用了两个分片字段： user_id 和 order_id。**

由于我们这里用的是自定义的分布式主键，自定义分布式主键工具使用的也是雪花算法(Snowflake)，所以这里我们需要配置一下 
`snowflake.properties`。

```properties
# 工作进程ID(0~31)
snowflake.workId=1
# 数据中心ID(0~31)
snowflake.dataCenterId=1
```

# 编写 Mapper, Model 以及 Service

**OrderMapper**

```java
@Mapper
public interface OrderMapper {

	/**
	 * add a new order
	 * @param model
	 * @return
	 */
	Integer insert(Order model);

	/**
	 * select all orders
	 * @return
	 */
	List<Order> selectAll();
}
```

**OrderMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="org.rockyang.shardingjdbc.common.mapper.OrderMapper">
	<!-- not use generate key of sharding-jdbc -->
	<insert id="insert" parameterType="org.rockyang.shardingjdbc.common.model.Order">
        INSERT INTO t_order (order_id, user_id, title) VALUES (#{orderId}, #{userId}, #{title})
    </insert>
	
	<select id="selectAll" resultType="org.rockyang.shardingjdbc.common.model.Order">
        select
            t.user_id as userId,
            t.order_id as orderId,
            t.title as title
        from t_order t
	</select>
</mapper>
```

**Order Model**

```java 
public final class Order {

	private Long orderId;

	private Long userId;

	private String title;

	public Order() {
	}

	public Order(long orderId, long userId) {
		this.orderId = orderId;
		this.userId = userId;
	}

	public Long getOrderId() {
		return orderId;
	}

	public void setOrderId(Long orderId) {
		this.orderId = orderId;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	@Override
	public String toString() {
		return "Order{" +
				"orderId=" + orderId +
				", userId=" + userId +
				", title='" + title + '\'' +
				'}';
	}
}
```

**OrderService interface**

```java 
public interface OrderService {

	/**
	 * add a new order
	 * @param order
	 * @return update affect rows
	 */
	Integer add(Order order);

	/**
	 * select all orders
	 * @return
	 */
	List<Order> selectAll();
}
```

**OrderService implements**

```java 
@Service
public class OrderServiceImpl implements OrderService {

	@Resource
	OrderMapper orderMapper;

	@Override
	public Integer add(Order order)
	{
		return orderMapper.insert(order);
	}

	@Override
	public List<Order> selectAll() {
		return orderMapper.selectAll();
	}
}
```

# 自定义分库分表算法实现

> 自定义分库算法，这里实现一个最简单的分库算法。(orderId.hashCode() + userId.longValue()) % db.size() 

```java 
public class DbShardingAlgorithm implements ComplexKeysShardingAlgorithm {

    private static Logger logger = LoggerFactory.getLogger(DbShardingAlgorithm.class);
    // 取模因子
    public static final Integer MODE_FACTOR = 1331;

    @Override
    public Collection<String> doSharding(Collection<String> availableTargetNames, Collection<ShardingValue> shardingValues) {

        List<String> shardingResults = new ArrayList<>();
        Long shardingIndex = getIndex(shardingValues) % availableTargetNames.size();
        // loop and match datasource
        for (String name : availableTargetNames) {
            // get logic datasource index suffix
            String nameSuffix = name.substring(2);
            if (nameSuffix.equals(shardingIndex.toString())) {
                shardingResults.add(name);
                break;
            }
        }

        logger.info("DataSource sharding index ： {}", shardingIndex);
        return shardingResults;
    }

    /**
     * get datasource sharding index <p>
     * sharding algorithm : shardingIndex = (orderId + userId.hashCode()) % db.size
     * @param shardingValues
     * @return
     */
    private long getIndex(Collection<ShardingValue> shardingValues)
    {
        long shardingIndex = 0L;
        ListShardingValue<Long> listShardingValue;
        List<Long> shardingValue;
        for (ShardingValue sVal : shardingValues) {
            listShardingValue = (ListShardingValue<Long>) sVal;
            if ("order_id".equals(listShardingValue.getColumnName())) {
                shardingValue = (List<Long>) listShardingValue.getValues();
                shardingIndex += Math.abs(shardingValue.get(0)) % MODE_FACTOR;
            } else if ("user_id".equals(listShardingValue.getColumnName())) {
                shardingValue = (List<Long>) listShardingValue.getValues();
                // 这里  % 1313 仅仅只是防止溢出
                shardingIndex += Math.abs(shardingValue.get(0).hashCode()) % MODE_FACTOR;
            }
        }
        return shardingIndex;
    }
}
```

> 自定义分表算法，在这里可以设计自己的任意算法。
我们这里也做了一个最简单的实现：(OrderId.hashCode() + userId.hashCode()) % 1331 % db.size()

```java 
public class TableShardingAlgorithm implements ComplexKeysShardingAlgorithm {

    private static Logger logger = LoggerFactory.getLogger(TableShardingAlgorithm.class);
    // 取模因子
    public static final Integer MODE_FACTOR = 131;

    @Override
    public Collection<String> doSharding(Collection<String> availableTargetNames, Collection<ShardingValue> shardingValues) {

        List<String> shardingResults = new ArrayList<>();
        Long shardingIndex = getIndex(shardingValues) % availableTargetNames.size();
        // loop and match datasource
        for (String name : availableTargetNames) {
            // get logic datasource index suffix
            String nameSuffix = name.substring(name.length() - 1, name.length());
            if (nameSuffix.equals(shardingIndex.toString())) {
                shardingResults.add(name);
                break;
            }
        }
        logger.info("Table sharding index ： {}", shardingIndex);
        return shardingResults;
    }

    /**
     * get table sharding index <p>
     * @param shardingValues
     * @return
     */
    private long getIndex(Collection<ShardingValue> shardingValues)
    {
        Long shardingIndex = 0L;
        ListShardingValue<Long> listShardingValue;
        List<Long> shardingValue;
        for (ShardingValue sVal : shardingValues) {
            listShardingValue = (ListShardingValue<Long>) sVal;
            shardingValue = (List<Long>) listShardingValue.getValues();
            shardingIndex += (Math.abs(shardingValue.get(0).hashCode()) % MODE_FACTOR);
        }
        return shardingIndex;
    }
}
```

# 单元测试

我们照样使用单元测试代码来测试自定义算法是否生效。

```java 
@RunWith(SpringRunner.class)
@SpringBootTest
public class OrderServiceTest {

	private static Logger logger = LoggerFactory.getLogger(OrderServiceTest.class);

	@Resource
	private OrderService orderService;

	@Test
	public void testAdd()
	{
		Long userId = 361116122344325121L;
		Order order = new Order(Snowflake.getInstance().nextId(), userId);
		order.setTitle(StringUtil.generateRandomString(20));
		if (orderService.add(order) > 0) {
			logger.info("OrderId: {}", order.getOrderId());
		}
	}

	@Test
	public void testBatchAdd()
	{
		Long userId = 361116122344325121L;
		for (int i = 0; i < 100; i++) {
			Order order = new Order(Snowflake.getInstance().nextId(), userId);
			order.setTitle(StringUtil.generateRandomString(20));
			if (orderService.add(order) > 0) {
				logger.info("OrderId: {}", order.getOrderId());
			}
		}

	}

	@Test
	public void testSelect()
	{
		List<Order> orders = orderService.selectAll();
		logger.info("Total records: {}", orders.size());
		for (Order order : orders) {
			logger.info("{}", order);
		}
	}
}
```

# 总结

通过多次批量插入数据测试，可以发现数据基本均匀的分散到2个数据库中的4个数据表中了。说明分片的效果还是不错的。

在实战业务中我们的分片规则可能比这复杂的多，比如业务分类，时间，地区等都可以作为分片的字段。

到此为止，我们的 `Sharding-JDBC` 入门系列就结束了，有兴趣的同学可以去试下更高端的功能，比如分布式事务，编排治理，数据脱敏等各种高级操作。

# 项目源码链接

[sharding-jdbc-spring-boot-demo](https://gitee.com/blackfox/sharding-jdbc-spring-boot-demo)

# 参考链接
* https://shardingsphere.apache.org/document/current/cn/features/sharding/concept/sharding

