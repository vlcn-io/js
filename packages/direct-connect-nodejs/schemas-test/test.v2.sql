CREATE TABLE IF NOT EXISTS foo (
  a primary key not null,
  b,
  c
);

SELECT crsql_as_crr('foo');