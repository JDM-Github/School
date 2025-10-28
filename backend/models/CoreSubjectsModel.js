// Author: JDM
// Created on: 2025-10-21T03:33:41.578Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const CoreSubject = sequelize.define(
    "CoreSubject",
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

module.exports = CoreSubject;
