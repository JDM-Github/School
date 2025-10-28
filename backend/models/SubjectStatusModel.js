// Author: JDM
// Created on: 2025-10-21T03:39:01.688Z

const sequelize = require("./Sequelize.js");
const Subject = require("./SubjectModel.js");
const { DataTypes } = require("sequelize");

const SubjectStatus = sequelize.define(
    "SubjectStatus",
    {
        subject_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Subject,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        is_completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_incomplete: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = SubjectStatus;
