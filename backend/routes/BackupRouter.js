const express = require('express');
const router = express.Router();
const { sequelize } = require('../models/Models.js');

async function getAllTables() {
    const [results] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    `);
    return results.map(r => r.table_name);
}

async function exportTableData(tableName) {
    const [rows] = await sequelize.query(`SELECT * FROM "${tableName}"`);
    return rows;
}

async function getTableStructure(tableName) {
    const [columns] = await sequelize.query(`
        SELECT column_name, data_type, character_maximum_length, 
            column_default, is_nullable
        FROM information_schema.columns
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position
    `);
    return columns;
}

router.get('/create-backup', async (req, res) => {
    try {
        const tables = await getAllTables();
        const backup = {
            timestamp: new Date().toISOString(),
            database: 'neondb',
            tables: {}
        };

        for (const table of tables) {
            const data = await exportTableData(table);
            const structure = await getTableStructure(table);

            backup.tables[table] = {
                structure,
                data,
                rowCount: data.length
            };
        }

        res.status(200).json({
            success: true,
            message: 'Backup created successfully',
            backup,
            summary: {
                totalTables: tables.length,
                totalRows: Object.values(backup.tables).reduce((sum, t) => sum + t.rowCount, 0),
                createdAt: backup.timestamp
            }
        });

    } catch (error) {
        console.error('Backup creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create backup',
            error: error.message
        });
    }
});

router.post('/restore-backup', async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { backup } = req.body;

        if (!backup || !backup.tables) {
            return res.status(400).json({
                success: false,
                message: 'Invalid backup format'
            });
        }

        const restoredTables = [];
        const errors = [];

        await sequelize.query('SET CONSTRAINTS ALL DEFERRED;', { transaction });
        const existingTables = await getAllTables();

        for (const [tableName, tableData] of Object.entries(backup.tables)) {
            try {
                if (!existingTables.includes(tableName)) {
                    errors.push({
                        table: tableName,
                        error: 'Table does not exist in current database schema'
                    });
                    continue;
                }

                await sequelize.query(`DELETE FROM "${tableName}"`, { transaction });

                if (tableData.data && tableData.data.length > 0) {
                    const columns = Object.keys(tableData.data[0]);
                    const columnNames = columns.map(c => `"${c}"`).join(', ');

                    const placeholders = tableData.data.map((_, rowIndex) =>
                        `(${columns.map((_, colIndex) =>
                            `$${rowIndex * columns.length + colIndex + 1}`
                        ).join(', ')})`
                    ).join(', ');

                    const values = [];
                    tableData.data.forEach(row => {
                        columns.forEach(col => {
                            const val = row[col];
                            values.push(val === null ? null : val);
                        });
                    });

                    const insertQuery = `
                        INSERT INTO "${tableName}" (${columnNames})
                        VALUES ${placeholders}
                    `;

                    await sequelize.query(insertQuery, {
                        transaction,
                        bind: values
                    });
                }

                restoredTables.push({
                    table: tableName,
                    rowsRestored: tableData.data ? tableData.data.length : 0
                });

            } catch (error) {
                errors.push({
                    table: tableName,
                    error: error.message
                });
                continue;
            }
        }

        await sequelize.query('SET CONSTRAINTS ALL IMMEDIATE;', { transaction });
        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Backup restored successfully',
            restoredTables,
            errors: errors.length > 0 ? errors : undefined,
            summary: {
                totalTablesRestored: restoredTables.length,
                totalRowsRestored: restoredTables.reduce((sum, t) => sum + t.rowsRestored, 0),
                restoredAt: new Date().toISOString(),
                backupTimestamp: backup.timestamp
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Backup restore error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to restore backup',
            error: error.message
        });
    }
});

router.get('/backup-info', async (req, res) => {
    try {
        const tables = await getAllTables();
        const info = [];

        for (const table of tables) {
            const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table}"`);
            info.push({
                table,
                rowCount: parseInt(countResult[0].count)
            });
        }

        res.status(200).json({
            success: true,
            currentDatabase: {
                tables: info,
                totalTables: tables.length,
                totalRows: info.reduce((sum, t) => sum + t.rowCount, 0),
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Backup info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get backup info',
            error: error.message
        });
    }
});

module.exports = router;