const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Users/princ/KhatuShyamji/.env.local' });

console.log("Environment keys:");
for (const key of Object.keys(process.env)) {
  if (key.includes("DATABASE") || key.includes("PG") || key.includes("POSTGRES") || key.includes("PASS") || key.includes("SECRET")) {
    console.log(key, "=>", process.env[key] ? "exists" : "empty");
  }
}
