// Author: JDM
// Created on: 2025-10-21T03:39:12.955Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const SHSSF9 = sequelize.define(
    "SHSSF9",
    {
        subject_status_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER), // list of subject_status IDs
            allowNull: true,
            defaultValue: [],
        },
        current_status: {
            type: DataTypes.ENUM("NO INPUT", "INCOMPLETE", "COMPLETED"),
            allowNull: false,
            defaultValue: "NO INPUT",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = SHSSF9;
