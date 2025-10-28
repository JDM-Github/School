// Author: JDM
// Created on: 2025-10-21T03:33:35.625Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const SpecializedSubject = sequelize.define(
    "SpecializedSubject",
    {
        subjects_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true,
            defaultValue: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = SpecializedSubject;
