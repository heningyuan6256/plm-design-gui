use postgres::{ Client, NoTls };
use tauri::{ command };

use std::collections::HashMap;

struct Person {
    id: i32,
    name: String,
    data: Option<Vec<u8>>,
}

fn print_hashmap(map: &mut HashMap<String, u8>) {
    for (key, value) in map.iter() {
        println!("{} / {}", key, value);
    }
}

#[command]
pub fn main1() -> u64 {
    // let mut conn = Client::connect(
    //     "postgres://postgres:123456@192.168.0.104:32768/mk-708",
    //     NoTls
    // ).unwrap();

    // // let queries = Loader::get_queries_from("examples/postgre.sql").expect("Can't parse the SQL file");
    // // const COMMENT_SQL: Loader = Loader::get_queries_from("examples/postgre.sql").unwrap();

    // let result: Result<u64, Error> = conn
    //     .execute(
    //         "CREATE TABLE \"person\" (id SERIAL PRIMARY KEY, name  VARCHAR NOT NULL, data BYTEA);",
    //         &[]
    //     );

    // ok(result);
    1
}

#[command]
pub fn batchSqlData(
    sql: String,
    account: String,
    password: String,
    address: String,
    port: String,
    name: String
) {
    let conn_string = format!("postgres://{}:{}@{}:{}/{}", account, password, address, port, name);
    let mut conn = Client::connect(&conn_string, NoTls).unwrap();
    let _ = conn.batch_execute(&sql);
    conn.close();
}
