// Author: JDM
// Created on: 2025-10-21T03:36:46.881Z

const sequelize = require("./Sequelize.js");
const CoreSubject = require("./CoreSubjectsModel.js");
const AppliedSubject = require("./AppliedSubjectsModel.js");
const SpecializedSubject = require("./SpecializedSubjectsModel.js");
const { DataTypes } = require("sequelize");

const Group = sequelize.define("Group", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    applied_subjects_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: AppliedSubject, 
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    specialized_subjects_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: SpecializedSubject,
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    core_subjects_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: CoreSubject,
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
}, {
    timestamps: true,
});

module.exports = Group;
