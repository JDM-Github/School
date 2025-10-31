// Author: JDM
// Created on: 2025-10-21T16:57:27.958Z

const sequelize = require("./Sequelize.js");
const { DataTypes } = require("sequelize");

const StudentAccount = sequelize.define("StudentAccount", {
    name: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    middleName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    suffix: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1 } },
    sex: { type: DataTypes.ENUM("Male", "Female", "Other"), allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    graduated: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: { type: DataTypes.ENUM("active", "dropout", "transferred"), defaultValue: "active" },
    isRepeater: { type: DataTypes.BOOLEAN, defaultValue: false },
    retained: { type: DataTypes.BOOLEAN, defaultValue: true },

    
    // THIS IS USED FOR TRACKING CURRENT
    isPassedThisSY: { type: DataTypes.BOOLEAN, defaultValue: false },
    isEnrollThisSY: { type: DataTypes.BOOLEAN, defaultValue: true },
    gradeLevel: { type: DataTypes.STRING, defaultValue: "Grade 11"},
    currentSY: { type: DataTypes.STRING, defaultValue: "" },
    isNew: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });


module.exports = StudentAccount;
