// Author: JDM
// Created on: 2025-10-21T03:29:28.244Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const Subject = sequelize.define(
    "Subject",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        specialized_category: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null, // explicitly default to null
        },
    },
    {
        timestamps: true,
    }
);

module.exports = Subject;
