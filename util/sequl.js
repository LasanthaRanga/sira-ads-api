const Sequelize = require('sequelize');
const connection = new Sequelize(process.env.database, process.env.user, process.env.password, {
    dialect: 'mysql',
    host: 'localhost',
    define: {
        timestamps: true // true by default. false because bydefault sequelize adds createdAt, modifiedAt columns with timestamps.if you want those columns make ths true.
    }
});
connection.sync();
module.exports = connection; 