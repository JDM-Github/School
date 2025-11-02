// Author: JDM
// Created on: 2025-10-14T11:24:37.374Z

require("dotenv").config();
const { sequelize } = require("./models/Models.js");

// const SCHEMA_NAME = "school_management"; 

async function migrateAll() {
    try {
        console.log("🚀 Connecting to database...");
        await sequelize.authenticate();
        console.log("✅ Connection established successfully.");

        // console.log(`🏗️ Ensuring schema "${SCHEMA_NAME}" exists...`);
        // await sequelize.createSchema(SCHEMA_NAME, { ifNotExists: true });
        // console.log(`✅ Schema "${SCHEMA_NAME}" ready.`);

        console.log("🔄 Running migrations...");
        await sequelize.sync({ force: true }); // recreate all tables under schema
        console.log("✅ All models migrated successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await sequelize.close();
    }
}

migrateAll();
