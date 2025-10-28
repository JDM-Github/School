// Author: JDM
// Created on: 2025-10-21T03:24:33.265Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const Section = sequelize.define(
    "Section",
    {
        section_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = Section;
