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
        },
        isGrade11Created: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isGrade12Created: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isPublished: { 
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        timestamps: true,
    }
);

module.exports = SchoolYear;
