import { useState, useMemo } from "react";
import { Card } from "../ui/card";
import { motion } from "framer-motion";
import { Adviser } from "../../lib/type";

interface AdviserTableProps {
    title: string;
    data: Adviser[];
    delay?: number;
    selectedSection: string;
    selectedSubjects: string[];
    selectedProgram: string;
}

export default function AdviserTable({ title, data, delay = 0, selectedSection, selectedSubjects, selectedProgram }: AdviserTableProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase();

        return data
            .filter(
                a =>
                    a.account?.name?.toLowerCase().includes(term) ||
                    (a.section?.section_name?.toLowerCase() || "not set").includes(term)
            )
            .filter(a => {
                const programMatch =
                    selectedProgram === "ALL" || a.program === selectedProgram;
                const sectionMatch =
                    selectedSection === "ALL" ||
                    (a.section?.section_name || "NOT SET") === selectedSection;
                const subjectMatch =
                    selectedSubjects.length === 0 ||
                    a.subjectStatuses.some(subj =>
                        selectedSubjects.includes(subj.subject.name)
                    );

                return sectionMatch && subjectMatch && programMatch;
            });
    }, [data, searchTerm, selectedSection, selectedSubjects, selectedProgram]);


    return (
        <Card className="bg-white border shadow-sm rounded-lg overflow-hidden">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
                <div className="bg-gray-400 text-white text-lg font-semibold px-4 py-2 flex justify-between items-center">
                    <span>{title}</span>
                    <input
                        type="text"
                        placeholder="Search by name or section..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-50 placeholder-gray-50 w-72"
                    />
                </div>

                <div className="overflow-auto max-h-[50vh] mt-3">
                    <table className="min-w-max text-xs md:text-sm border-collapse">
                        <thead className="bg-blue-100 text-gray-700 font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 text-center">ID</th>
                                <th className="px-4 py-2 text-center">SCHOOL YEAR</th>
                                <th className="px-4 py-2 text-center">HANDLE GRADE LEVEL</th>
                                <th className="px-4 py-2 text-center">EMAIL</th>
                                <th className="px-4 py-2 text-center">NAME</th>
                                <th className="px-4 py-2 text-center">AGE</th>
                                <th className="px-4 py-2 text-center">SEX</th>
                                <th className="px-4 py-2 text-center">PROGRAM</th>
                                <th className="px-4 py-2 text-center">SECTION</th>
                                <th className="px-4 py-2 text-center">STUDENT MALE</th>
                                <th className="px-4 py-2 text-center">STUDENT FEMALE</th>
                                <th className="px-4 py-2 text-center">STUDENT TOTAL</th>
                                <th className="px-4 py-2 text-center">SUBJECTS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map(adviser => (
                                <tr key={adviser.id} className="hover:bg-gray-50 text-center">
                                    <td className="px-4 py-2">{adviser.id}</td>
                                    <td className="px-4 py-2">{adviser.school_year}</td>
                                    <td className="px-4 py-2">{adviser.grade_level}</td>
                                    <td className="px-4 py-2">{adviser.account.email}</td>
                                    <td className="px-4 py-2">{adviser.account.name}</td>
                                    <td className="px-4 py-2">{adviser.account.age}</td>
                                    <td className="px-4 py-2">{adviser.account.sex}</td>
                                    <td className="px-4 py-2">{adviser.program}</td>
                                    <td className="px-4 py-2">{adviser.section?.section_name ?? "NOT SET"}</td>
                                    <td className="px-4 py-2">{adviser.studentCounts.male}</td>
                                    <td className="px-4 py-2">{adviser.studentCounts.female}</td>
                                    <td className="px-4 py-2">{adviser.studentCounts.total}</td>
                                    <td className="px-4 py-2">
                                        {adviser.subjectStatuses.map(s => s.subject.name).join(", ")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </Card>
    );
}
