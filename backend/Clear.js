require("dotenv").config();
const { Sequelize } = require("sequelize");
const pg = require("pg");

const devSequelize = new Sequelize(
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    {
        dialect: "postgres",
        dialectModule: pg,
        dialectOptions: { ssl: false },
        logging: false,
    }
);

const prodSequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectModule: pg,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: false,
});

const models = ["Users", "Plants", "Sprays", "Trackers"];

for (const modelName of models) {
    const modelDef = require(`./models/${modelName}`);
    modelDef(devSequelize);
    modelDef(prodSequelize);
}

async function migrateAll() {
    try {
        console.log("Resetting production database...");
        await prodSequelize.sync({ force: true });

        for (const modelName of models) {
            const devModel = devSequelize.models[modelName];
            const prodModel = prodSequelize.models[modelName];

            const rows = await devModel.findAll({ raw: true });
            if (rows.length > 0) {
                await prodModel.bulkCreate(rows);
                console.log(`Copied ${rows.length} rows for model ${modelName}`);
            }
        }

        console.log("Production database fully updated from development.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrateAll();
