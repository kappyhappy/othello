import mysql from 'mysql2/promise'

export async function connectMySQL() {
    return await mysql.createConnection({
        host: 'localhost',
        database: 'othello',
        user: 'othello',
        password: 'passwd'
    })
}