import { Card } from "../ui/card";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

interface SubjectGrade {
	subject: string;
	grades: {
		first: number;
		second: number;
		third: number;
		fourth: number;
	};
	final: number;
}

interface Student {
	id: number;
	name: string;
	section: string;
	subjects: SubjectGrade[];
	passed: boolean;
	status: string;
}

interface StudentGradeTableProps {
	title: string;
	gradeLevel: string;
	data: Student[];
	delay?: number;
}

export default function StudentGradeTable({
	title,
	gradeLevel,
	data,
	delay = 0,
}: StudentGradeTableProps) {
	const [hoveredRow, setHoveredRow] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedSection, setSelectedSection] = useState("All");

	const sections = useMemo(() => {
		const uniqueSections = Array.from(new Set(data.map((s) => s.section)));
		return ["All", ...uniqueSections];
	}, [data]);

	const filteredData = useMemo(() => {
		const term = searchTerm.toLowerCase();
		return data.filter((student) => {
			const matchesSearch =
				student.name.toLowerCase().includes(term) ||
				student.subjects.some((s) =>
					s.subject.toLowerCase().includes(term)
				);
			const matchesSection =
				selectedSection === "All" || student.section === selectedSection;
			return matchesSearch && matchesSection;
		});
	}, [searchTerm, selectedSection, data]);

	const totalStudents = filteredData.length;
	const allFinalGrades = filteredData.flatMap((s) =>
		s.subjects.map((sub) => sub.final)
	);
	const avgGrade =
		allFinalGrades.length > 0
			? (allFinalGrades.reduce((a, b) => a + b, 0) / allFinalGrades.length).toFixed(1)
			: "0.0";
	const passCount = filteredData.filter((s) => s.passed).length;

	return (
		<Card className="bg-white border shadow-sm rounded-lg overflow-hidden">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay }}
			>
				<div className="bg-gray-400 text-white text-lg font-semibold px-4 py-2">
					<div className="flex justify-between items-center flex-wrap gap-2">
						<span>{title}</span>
						<span>
							STUDENT:{" "}
							{hoveredRow !== null ? (
								<span className="text-gray-300">
									{filteredData[hoveredRow]?.name}
								</span>
							) : (
								<span className="text-gray-300">NONE</span>
							)}
						</span>
					</div>

					<div className="mt-3 flex justify-between flex-wrap gap-2">
						<select
							value={selectedSection}
							onChange={(e) => setSelectedSection(e.target.value)}
							className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
						>
							{sections.map((sec) => (
								<option key={sec} value={sec}>
									{sec === "All" ? "All Sections" : sec}
								</option>
							))}
						</select>

						<input
							type="text"
							placeholder="Search student or subject..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-50 placeholder-gray-50 focus:outline-none focus:ring-2 focus:ring-transparent focus:border-gray-50 w-72"
						/>
					</div>
				</div>

				<div className="overflow-auto max-h-[45vh] mt-3">
					<table className="text-xs md:text-sm border-collapse w-full">
						<thead className="bg-blue-100 text-gray-700 font-semibold sticky top-0 z-10">
							<tr>
								<th className="px-4 py-2 text-center w-[180px]">STUDENT NAME</th>
								<th className="px-4 py-2 text-center w-[120px]">SECTION</th>
								<th className="px-4 py-2 text-center w-[140px]">SUBJECT</th>
								<th className="px-2 py-2 text-center w-[80px]">1st QTR</th>
								<th className="px-2 py-2 text-center w-[80px]">2nd QTR</th>
								<th className="px-2 py-2 text-center w-[80px]">3rd QTR</th>
								<th className="px-2 py-2 text-center w-[80px]">4th QTR</th>
								<th className="px-2 py-2 text-center w-[90px]">FINAL</th>
								<th className="px-4 py-2 text-center w-[100px]">STATUS</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-200 text-center">
							{filteredData.length === 0 ? (
								<tr>
									<td colSpan={9} className="text-gray-500 py-10 text-sm">
										No students found for {gradeLevel}.
									</td>
								</tr>
							) : (
								filteredData.map((student, rowIndex) =>
									student.subjects.map((subj, idx) => (
										<tr
											key={`${student.id}-${idx}`}
											className="hover:bg-gray-50"
											onMouseEnter={() => setHoveredRow(rowIndex)}
											onMouseLeave={() => setHoveredRow(null)}
										>
											{idx === 0 && (
												<>
													<td
														rowSpan={student.subjects.length}
														className="px-4 py-2 font-medium text-gray-800"
													>
														{student.name}
													</td>
													<td
														rowSpan={student.subjects.length}
														className="px-4 py-2 text-gray-800 font-semibold bg-gray-100"
													>
														{student.section}
													</td>
												</>
											)}
											<td className="px-4 py-2 text-gray-600">{subj.subject}</td>
											<td className="px-2 py-2 text-gray-800 font-semibold">
												{subj.grades.first === 0 ? "-" : subj.grades.first}
											</td>
											<td className="px-2 py-2 text-gray-800 font-semibold">
												{subj.grades.second === 0 ? "-" : subj.grades.second}
											</td>
											<td className="px-2 py-2 text-gray-800 font-semibold">
												{subj.grades.third === 0 ? "-" : subj.grades.third}
											</td>
											<td className="px-2 py-2 text-gray-800 font-semibold">
												{subj.grades.fourth === 0 ? "-" : subj.grades.fourth}
											</td>
											<td className="px-2 py-2 text-gray-900 font-bold bg-gray-50">
												{subj.final === 0 ? "-" : subj.final}
											</td>

											{idx === 0 && (
												<td
													rowSpan={student.subjects.length}
													className={`px-4 py-2 font-semibold ${student.status === "-"
															? "text-gray-600 bg-gray-100" :
														student.status === "Pending Finalization" ? "text-red-400 bg-red-50"
															: student.passed
																? "text-green-700 bg-green-50"
																: "text-red-800 bg-red-200"
														}`}
												>
													{student.status}
												</td>
											)}

										</tr>
									))
								)
							)}
						</tbody>

						{filteredData.length > 0 && (
							<tfoot className="bg-blue-50 font-semibold text-blue-700 text-center border-t">
								<tr>
									<td colSpan={3} className="px-4 py-2 text-right">
										TOTAL STUDENTS:
									</td>
									<td colSpan={2} className="px-4 py-2">
										{totalStudents}
									</td>
									<td colSpan={2} className="px-4 py-2">
										AVG: {avgGrade}
									</td>
									<td colSpan={2} className="px-4 py-2">
										PASSED: {passCount}/{totalStudents}
									</td>
								</tr>
							</tfoot>
						)}
					</table>
				</div>
			</motion.div>
		</Card>
	);
}
