// Author: JDM
// Created on: 2025-10-21T20:35:08.981Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const AdviserAccount = sequelize.define(
    "AdviserAccount",
    {
        name: { type: DataTypes.STRING, allowNull: false },
        firstName: { type: DataTypes.STRING, allowNull: false },
        middleName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        suffix: { type: DataTypes.STRING, allowNull: false },
        age: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1 } },
        sex: { type: DataTypes.ENUM("Male", "Female", "Other"), allowNull: false },
        email: { type: DataTypes.STRING, allowNull: true, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
    },
    {
        timestamps: true,
    }
);

module.exports = AdviserAccount;
