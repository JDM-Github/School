require("dotenv").config();
const pg = require("pg");

const isDev = process.env.MODE === "development";

module.exports = {
	development: {
		use_env_variable: isDev ? null : "DATABASE_URL",
		dialect: "postgres",
		dialectModule: pg,
		host: isDev ? process.env.DB_HOST : undefined,
		port: isDev ? process.env.DB_PORT : undefined,
		username: isDev ? process.env.DB_USER : undefined,
		password: isDev ? process.env.DB_PASSWORD : undefined,
		database: isDev ? process.env.DB_NAME : undefined,
		dialectOptions: isDev
			? { ssl: false }
			: {
				ssl: {
					require: true,
					rejectUnauthorized: false,
				},
			},
	},
};
