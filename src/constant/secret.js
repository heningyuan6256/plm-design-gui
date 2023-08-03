const CryptoJS = require("crypto-js");

const key = '0123456789abcdef0123456789abcdef'
// Encrypt
var ciphertext = CryptoJS.AES.encrypt('U2FsdGVkX182W8xs6/tsmG+uugtElMkz8xLrsMZoHrc=', key).toString();

// Decrypt
var bytes  = CryptoJS.AES.decrypt(ciphertext, key);
var originalText = bytes.toString(CryptoJS.enc.Utf8);

console.log(originalText); // 'my message'