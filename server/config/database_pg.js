const { Sequelize } = require("sequelize");
require("dotenv").config();

// Create a new Sequelize instance
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,  // Disable logging (optional)
});

module.exports = sequelize;
