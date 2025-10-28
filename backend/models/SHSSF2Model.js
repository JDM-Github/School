// Author: JDM
// Created on: 2025-10-21T03:41:06.765Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const SHSSF2 = sequelize.define(
    "SHSSF2",
    {
        january_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        february_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        march_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        april_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        may_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        june_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        july_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        august_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        september_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        october_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        november_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        december_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = SHSSF2;
