require("dotenv").config();
const pg = require("pg");

// const isDev = process.env.MODE === "development";
const isDev = false;

module.exports = {
	development: {
		use_env_variable: "postgresql://neondb_owner:npg_UETgBs5qG4ce@ep-divine-hill-ah02rx3p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
		dialect: "postgres",
		dialectModule: pg,
		// host: isDev ? process.env.DB_HOST : undefined,
		// port: isDev ? process.env.DB_PORT : undefined,
		// username: isDev ? process.env.DB_USER : undefined,
		// password: isDev ? process.env.DB_PASSWORD : undefined,
		// database: isDev ? process.env.DB_NAME : undefined,
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
