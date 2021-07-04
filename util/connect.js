const mysql = require('mysql');
require('dotenv').config()

const connection = mysql.createConnection({
    /* host:process.env.DB_HOST,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE,
    charset:'utf8mb4' */
    host:'database-2.cisu5uvbda7y.ap-south-1.rds.amazonaws.com',
    user:'admin',
    password:'password',
    database:'test_schema',
    charset:'utf8mb4'
})

connection.connect()

module.exports={connection};

