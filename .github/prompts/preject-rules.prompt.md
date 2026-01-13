---
agent: agent
---

Define the task to achieve, including specific requirements, constraints, and success criteria.

## 1 Associations (IMPORTANT)

- For business tables, **use reference IDs for relations**:
  - Use `<entity>_id BIGINT UNSIGNED NOT NULL` (or NULL if optional).
  - Add indexes on all reference ID columns used for joins/filters.
- **Do NOT create FOREIGN KEY constraints by default**:
  - Do not output `FOREIGN KEY (...) REFERENCES ...`
  - Do not use `ON DELETE/UPDATE CASCADE`
- Enforce integrity in code/transactions and via periodic orphan checks when needed.

Example:

```sql
user_id BIGINT UNSIGNED NOT NULL COMMENT 'logical reference to users.id',
KEY idx_<table>_user_id (user_id)

```
