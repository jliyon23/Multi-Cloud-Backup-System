const { DataTypes } = require("sequelize");
const sequelize = require("../config/database_pg");

const User = sequelize.define("user", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationcode: { type: DataTypes.STRING, allowNull: true }, // Stores the 6-digit code
}, {
  timestamps: true
});

module.exports = User;
