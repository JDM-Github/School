
// Author: [object Object]
// Created on: 2025-10-14T11:24:37.371Z

require("dotenv").config();
const { Sequelize } = require("sequelize");
const pg = require("pg");

const isDev = process.env.MODE === "development";

const sequelize = new Sequelize(
	isDev
		? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
		: process.env.DATABASE_URL,
	{
		dialect: "postgres",
		dialectModule: pg,
		dialectOptions: isDev
			? {
				ssl: false,
			}
			: {
				ssl: {
					require: true,
					rejectUnauthorized: false,
				},
			},
		logging: console.log,
	}
);

module.exports = sequelize;
