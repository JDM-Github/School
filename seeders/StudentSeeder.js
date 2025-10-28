
// Author: JDM
// Created on: 2025-10-21T08:47:40.562Z

"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			"Students",
			[
				{
				},
			],
			{}
		);
	},
	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Students", null, {});
	},
};
