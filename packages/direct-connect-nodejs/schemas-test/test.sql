CREATE TABLE IF NOT EXISTS foo (
  a primary key NOT NULL,
  b
);

SELECT crsql_as_crr('foo');