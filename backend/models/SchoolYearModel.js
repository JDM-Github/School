// Author: JDM
// Created on: 2025-10-22T20:06:34.886Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const SchoolYear = sequelize.define(
    "SchoolYear",
    {
        school_year: {
            type: DataTypes.STRING,
            defaultValue: "2024-2025"
        }
    },
    {
        timestamps: true,
    }
);

module.exports = SchoolYear;
