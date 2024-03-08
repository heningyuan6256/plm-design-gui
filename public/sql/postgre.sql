DROP TABLE IF EXISTS "person";
CREATE TABLE "person" (id SERIAL PRIMARY KEY, name  VARCHAR NOT NULL, data BYTEA);
SELECT id, name, data FROM person;