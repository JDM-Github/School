// Author: JDM
// Created on: 2025-10-21T03:25:57.134Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const Attendance = sequelize.define(
    "Attendance",
    {
        subject_attendance_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER), // list of subject_attendance_ids
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = Attendance;
