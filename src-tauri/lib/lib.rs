pub fn add(left: usize, right: usize) -> usize {
    left + right
}

#[no_mangle]
pub extern fn hello_rust() -> () {
    println!("Hello rust dll!1");
    // return "hello_rust";
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}