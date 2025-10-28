// Author: JDM
// Created on: 2025-10-21T07:52:08.071Z

const express = require("express");
const { Group, AppliedSubject, SpecializedSubject, CoreSubject, Subject } = require("../models/Models");

class GroupRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
	}

	getRouter() {
		this.router.get("/get-all", async (req, res) => {
			try {
				const groups = await Group.findAll({
					include: [
						{ model: AppliedSubject, as: "appliedSubjects" },
						{ model: SpecializedSubject, as: "specializedSubjects" },
						{ model: CoreSubject, as: "coreSubjects" },
					],
				});

				const allSubjects = await Subject.findAll();
				const subjectsById = Object.fromEntries(allSubjects.map((s) => [s.id, s]));

				const formattedGroups = groups.map((group) => ({
					id: group.id,
					name: group.name,

					applied_subjects:
						group.appliedSubjects?.subjects_ids
							?.map((id) => subjectsById[id])
							.filter(Boolean)
							.map((sub) => ({
								id: sub.id,
								name: sub.name,
								specialized_category: sub.specialized_category,
							})) || [],

					specialized_subjects:
						group.specializedSubjects?.subjects_ids
							?.map((id) => subjectsById[id])
							.filter(Boolean)
							.map((sub) => ({
								id: sub.id,
								name: sub.name,
								specialized_category: sub.specialized_category,
							})) || [],

					core_subjects:
						group.coreSubjects?.subjects_ids
							?.map((id) => subjectsById[id])
							.filter(Boolean)
							.map((sub) => ({
								id: sub.id,
								name: sub.name,
								specialized_category: sub.specialized_category,
							})) || [],
				}));

				return res.json({
					success: true,
					message: "Successfully fetched all groups with subjects.",
					groups: formattedGroups,
				});
			} catch (err) {
				console.error("❌ Error fetching groups:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
					error: err.message,
				});
			}
		});



	}

	postRouter() {
		this.router.post("/create", async (req, res) => {
			try {
				const { name } = req.body;
				if (!name)
					return res.status(400).json({ success: false, message: "Missing fields" });

				let group = await Group.findOne({ where: { name: name.trim() } });

				if (!group) {
					group = await Group.create({ name: name.trim() });
				}

				res.json({ success: true, group });
			} catch (error) {
				console.error("❌ Error creating group:", error);
				res.status(500).json({ success: false, message: "Server error creating group" });
			}
		});


		this.router.post("/add-subject", async (req, res) => {
			try {
				const { name, specialized_category, group_id, subject_type } = req.body;
				if (!name || !group_id || !subject_type) {
					return res.status(400).json({ success: false, message: "Name, group_id, and subject_type are required." });
				}

				const [subjectInstance] = await Subject.findOrCreate({
					where: { name: name.trim() },
					defaults: { name: name.trim(), specialized_category: specialized_category || null },
				});

				const group = await Group.findByPk(group_id, {
					include: [
						{ model: AppliedSubject, as: "appliedSubjects" },
						{ model: SpecializedSubject, as: "specializedSubjects" },
						{ model: CoreSubject, as: "coreSubjects" },
					],
				});
				if (!group) return res.status(404).json({ success: false, message: "Group not found." });

				let subjectModel;
				if (subject_type === "APPLIED") {
					if (!group.appliedSubjects) {
						const created = await AppliedSubject.create({ subjects_ids: [] });
						await group.update({ applied_subjects_id: created.id });
						subjectModel = created;
					} else subjectModel = group.appliedSubjects;
				} else if (subject_type === "SPECIALIZED") {
					if (!group.specializedSubjects) {
						const created = await SpecializedSubject.create({ subjects_ids: [] });
						await group.update({ specialized_subjects_id: created.id });
						subjectModel = created;
					} else subjectModel = group.specializedSubjects;
				} else if (subject_type === "CORE") {
					if (!group.coreSubjects) {
						const created = await CoreSubject.create({ subjects_ids: [] });
						await group.update({ core_subjects_id: created.id });
						subjectModel = created;
					} else subjectModel = group.coreSubjects;
				} else {
					return res.status(400).json({ success: false, message: "Invalid subject type." });
				}

				const existingIds = Array.isArray(subjectModel.subjects_ids) ? [...subjectModel.subjects_ids] : [];
				if (!existingIds.includes(subjectInstance.id)) {
					existingIds.push(subjectInstance.id);

					await subjectModel.constructor.update(
						{ subjects_ids: existingIds },
						{ where: { id: subjectModel.id } }
					);

					await subjectModel.reload();
				}

				return res.status(201).json({
					success: true,
					message: "Subject added and linked to group.",
					subject: subjectInstance,
					updatedCollection: subjectModel,
				});
			} catch (err) {
				console.error("❌ Error adding subject:", err);
				return res.status(500).json({ success: false, message: "Internal server error.", error: err.message });
			}
		});


	}

}

module.exports = new GroupRouter().router;
