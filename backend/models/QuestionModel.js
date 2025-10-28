// Author: JDM
// Created on: 2025-10-21T03:44:20.155Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const Question = sequelize.define(
    "Question",
    {
        question: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM("multiple_choice", "true_false", "essay", "short_answer"),
            allowNull: false,
            defaultValue: "multiple_choice",
        },
        answer: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        tableName: "questions",
    }
);

module.exports = Question;
