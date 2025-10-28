// Author: JDM
// Created on: 2025-10-21T04:52:50.820Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const StudentResults = sequelize.define(
    "StudentResults",
    {
        student_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "students",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
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
        subject_questions_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "subject_questions",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        test_answers: {
            type: DataTypes.JSONB, // Store answers like { "Q1": "A", "Q2": "B" }
            allowNull: true,
            defaultValue: {},
        },
    },
    {
        timestamps: true,
        tableName: "student_results",
    }
);

module.exports = StudentResults;
