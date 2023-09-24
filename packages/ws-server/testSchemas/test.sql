CREATE TABLE IF NOT EXISTS foo (a primary key not null, b);
SELECT crsql_as_crr('foo');