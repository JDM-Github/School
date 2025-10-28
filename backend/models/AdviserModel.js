// Author: JDM
// Created on: 2025-10-21T03:41:58.188Z

const sequelize = require("./Sequelize.js");
const Section = require("./SectionModel.js");
const SHSSF2 = require("./SHSSF2Model.js");
const SHSSF9 = require("./SHSSF9Model.js");
const AdviserAccount = require("./AdviserAccountModel.js");
const { DataTypes } = require("sequelize");

const Adviser = sequelize.define(
    "Adviser",
    {
        adviser_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: AdviserAccount,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        program: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        handle_section_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Section,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            defaultValue: null
        },
        handle_subject_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true,
            defaultValue: [],
        },
        shs_sf9_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: SHSSF9,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            defaultValue: null
        },
        shs_sf2_id: { 
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: SHSSF2,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            defaultValue: null
        },
        subject_questions_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER), // list of subject_questions IDs
            allowNull: true,
            defaultValue: [],
        },
        school_year: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = Adviser;
