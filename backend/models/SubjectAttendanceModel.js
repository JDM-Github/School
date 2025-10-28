// Author: JDM
// Created on: 2025-10-21T03:31:44.688Z

const sequelize = require("./Sequelize.js");
const Subject = require("./SubjectModel.js");
const { DataTypes } = require("sequelize");

const SubjectAttendance = sequelize.define(
    "SubjectAttendance",
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
        january: {
            type: DataTypes.ARRAY(DataTypes.STRING), // ["1", "23", "27"]
            allowNull: true,
            defaultValue: [],
        },
        february: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        march: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        april: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        may: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        june: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        july: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        august: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        september: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        october: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        november: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        december: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = SubjectAttendance;
