// Author: JDM
// Created on: 2025-10-21T03:23:21.970Z

const sequelize = require("./Sequelize.js");
const Section = require("./SectionModel.js");
const Attendance = require("./AttendanceModel.js");
const StudentAccount = require("./StudentAccountModel.js")
const { DataTypes } = require("sequelize");

const Student = sequelize.define(
    "Student",
    {
        student_account_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: StudentAccount, key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        section_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Section,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        attendance_id: { // use this
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Attendance,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        grade_level: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        subjects_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER), // store list of subject IDs
            allowNull: true,
        },
        subject_grade_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER), // list of student_grade_id
            allowNull: true,
        },
        school_year: {
            type: DataTypes.STRING,
            defaultValue: "", 
        },
        isNew: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isStartedSY: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        startedSY: {
            type: DataTypes.STRING,
        }
    },
    {
        tableName: "Students",
        timestamps: true,
    }
);

module.exports = Student;
