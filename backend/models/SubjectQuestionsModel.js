// Author: JDM
// Created on: 2025-10-21T03:45:39.706Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const SubjectQuestions = sequelize.define(
    "SubjectQuestions",
    {
        subject_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "subjects",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        questions_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER), // list of Question IDs
            allowNull: true,
            defaultValue: [],
        },
    },
    {
        timestamps: true,
        tableName: "subject_questions",
    }
);

module.exports = SubjectQuestions;
