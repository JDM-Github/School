// Author: JDM
// Created on: 2025-10-25T21:12:51.748Z

const sequelize = require("./Sequelize.js");
const Subject = require("./SubjectModel.js");
const { DataTypes } = require("sequelize");

const StudentGrade = sequelize.define(
    "StudentGrade",
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
        first_quarter: {
            type: DataTypes.STRING,
            defaultValue: "0"
        },
        second_quarter: {
            type: DataTypes.STRING,
            defaultValue: "0"
        },
        third_quarter: {
            type: DataTypes.STRING,
            defaultValue: "0"
        },
        final_quarter: {
            type: DataTypes.STRING,
            defaultValue: "0"
        },
    },
    {
        timestamps: true,
    }
);

module.exports = StudentGrade;
