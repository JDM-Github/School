// Author: JDM
// Created on: 2025-10-21T03:33:28.579Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const AppliedSubject = sequelize.define(
    "AppliedSubject",
    {
        subjects_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER), // list of Subject IDs
            allowNull: true,
            defaultValue: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = AppliedSubject;
