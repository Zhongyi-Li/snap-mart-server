---
agent: agent
---

Define the task to achieve, including specific requirements, constraints, and success criteria.

在编写 MySQL 表结构或 SQL 时，必须遵守以下约束：
1. 非必要不使用外键约束，表关系通过引用 ID 逻辑关联
2. 主键使用 BIGINT UNSIGNED，不使用复合主键
3. 时间字段必须有明确时区语义，禁止字符串时间
4. 默认使用逻辑删除，不直接物理删除
5. 索引必须基于明确查询场景，避免过度索引
6. 状态字段使用 TINYINT + 业务枚举
7. 金额禁止使用 FLOAT / DOUBLE
8. 设计需适配未来分库分表与高并发场景
```
