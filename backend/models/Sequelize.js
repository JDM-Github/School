
// Author: [object Object]
// Created on: 2025-10-14T11:24:37.371Z

require("dotenv").config();
const { Sequelize } = require("sequelize");
const pg = require("pg");

const isDev = process.env.MODE === "development";

const sequelize = new Sequelize(
	// isDev
	// 	? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
	// 	: process.env.DATABASE_URL,
	"postgresql://neondb_owner:npg_UETgBs5qG4ce@ep-divine-hill-ah02rx3p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
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
