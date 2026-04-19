const crypto = require("crypto");

const key = "mi_llave_super_secreta_123";

const hash = crypto.createHash("sha256").update(key).digest("hex");

console.log(hash);