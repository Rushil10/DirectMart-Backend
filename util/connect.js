const mysql = require('mysql');

/* const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'password',
    database:'test_schema',
    charset:'utf8mb4'
})  */

const connection = mysql.createConnection({
    host:'database-2.cisu5uvbda7y.ap-south-1.rds.amazonaws.com',
    user:'admin',
    password:'password',
    database:'test_schema',
    charset:'utf8mb4'
})

connection.connect()

module.exports={connection};

