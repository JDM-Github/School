// Author: JDM
// Created on: 2025-10-31T16:31:18.719Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const VisionMission = sequelize.define(
    "VisionMission",
    {
        school_year: {
            type: DataTypes.STRING,
            defaultValue: "2025-2026"
        },
        mission: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        vision: {
            type: DataTypes.TEXT,
            defaultValue: ""
        }
    },
    {
        timestamps: true,
    }
);

module.exports = VisionMission;
