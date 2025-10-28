import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface StudentGrade {
    id: number;
    name: string;
    grade_level: string;
    passed: boolean;
    enrolledNext: boolean;
    isNew: boolean;
    isGraduated: boolean;
    badgeClass?: string;
    label?: string;
}

interface PassedStudentPanelProps {
    students: StudentGrade[];
    setToEnrolled: any;
}

export default function PassedStudentPanel({ students, setToEnrolled }: PassedStudentPanelProps) {
    const [gradeFilter, setGradeFilter] = useState<"All" | "Grade 11" | "Grade 12" | "Graduates">("All");
    const [enrolleeFilter, setEnrolleeFilter] = useState<"All" | "New Enrollee" | "Passed" | "Passed Enrolled" | "Passed Not Enrolled">("All");
    const passedStudents = useMemo(() => {
        const newEnrollees = students.filter(s => s.isNew && s.grade_level === "Grade 11");
        const grade11Passers = students.filter(s => s.grade_level === "Grade 11" && s.passed || s.isNew && s.grade_level === "Grade 12");
        const grade12Passers = students.filter(s => s.grade_level === "Grade 12" && s.passed);

        if (gradeFilter === "Grade 11") {
            return newEnrollees;
        }

        if (gradeFilter === "Grade 12") {
            return grade11Passers;
        }

        if (gradeFilter === "Graduates") {
            return grade12Passers;
        }

        const map = new Map<number, StudentGrade>();
        [...newEnrollees, ...grade11Passers, ...grade12Passers].forEach(s => {
            map.set(s.id, s);
        });
        return Array.from(map.values());
    }, [students, gradeFilter]);

    const withStatus = useMemo(() => {
        return passedStudents.map(s => {
            let label = "";
            let badgeClass = "";

            if (s.isNew) {
                label = s.grade_level === "Grade 11" ? "New Enrollee" : "Transferred Enrollee";
                badgeClass = "text-blue-700 bg-blue-50";
            } else if (s.grade_level === "Grade 12" && s.passed) {
                label = s.isGraduated ? "Graduated" : "WIll Graduate";
                badgeClass = "text-yellow-700 bg-yellow-50";
            } else if (s.grade_level === "Grade 11" && s.passed) {
                label = s.enrolledNext ? "Enrolled" : "Not Enrolled";
                badgeClass = s.enrolledNext ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50";
            } else {
                label = s.passed ? "Passed" : "N/A";
                badgeClass = s.passed ? "text-green-700 bg-green-50" : "text-gray-700 bg-gray-50";
            }

            if (enrolleeFilter !== "All") {
                if (enrolleeFilter === "New Enrollee" && !s.isNew) return null;
                if (enrolleeFilter === "Passed" && !s.passed) return null;
                if (enrolleeFilter === "Passed Enrolled" && (!s.passed || !s.enrolledNext)) return null;
                if (enrolleeFilter === "Passed Not Enrolled" && (!s.passed || s.enrolledNext)) return null;
            }

            return { ...s, label, badgeClass };
        }).filter(Boolean) as typeof passedStudents;
    }, [passedStudents, enrolleeFilter]);

    return (
        <motion.div
            className="lg:w-3/6 bg-white shadow border p-5 rounded-lg overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        >
            <div className="flex justify-between items-center border-b pb-3 mb-3">
                <h2 className="text-lg font-semibold text-gray-700">
                    {gradeFilter === "Graduates"
                        ? "Graduates"
                        : gradeFilter === "Grade 12"
                            ? "Grade 12 Enrollment"
                            : gradeFilter === "Grade 11"
                                ? "Grade 11 - New Enrollees"
                                : "Passed & New Students"}
                </h2>
                <div className="flex gap-3">
                    <select
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value as any)}
                        className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        <option value="All">All</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                        <option value="Graduates">Graduates</option>
                    </select>
                    <select
                        value={enrolleeFilter}
                        onChange={(e) => setEnrolleeFilter(e.target.value as any)}
                        className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        <option value="All">All</option>
                        <option value="New Enrollee">New Enrollee</option>
                        <option value="Passed">Passed</option>
                        <option value="Passed Enrolled">Passed & Enrolled</option>
                        <option value="Passed Not Enrolled">Passed & Not Enrolled</option>
                    </select>
                </div>
            </div>

            <div className="overflow-auto max-h-[60vh] w-full">
                <table className="w-full text-xs md:text-sm border-collapse">
                    <thead className="bg-blue-100 text-gray-700 font-semibold sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2 text-left">STUDENT NAME</th>
                            <th className="px-4 py-2 text-center">CURRENT LEVEL</th>
                            <th className="px-4 py-2 text-center">STATUS</th>
                            <th className="px-4 py-2 text-center">ACTION</th>
                        </tr>
                    </thead>

                    <tbody key={gradeFilter} className="divide-y divide-gray-200 text-center">
                        {withStatus.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-gray-500 py-10 text-sm text-center">
                                    No passed, enrolled, or new students found.
                                </td>
                            </tr>
                        ) : (
                            withStatus.map((student) => (
                                <tr
                                    key={student.id}
                                    className="hover:bg-gray-50 transition"
                                >
                                    <td className="px-4 py-2 text-left font-medium text-gray-800">
                                        {student.name}
                                    </td>

                                    <td className="px-4 py-2">
                                        {student.isNew ? "NEW STUDENT" : student.grade_level}
                                    </td>

                                    <td
                                        className={`px-4 py-2 font-semibold rounded ${student.badgeClass}`}
                                    >
                                        {student.label}
                                    </td>
                                    <td className="px-4 py-2 text-right bg-blue-200">
                                        {(student.passed && student.grade_level === "Grade 11") ? (
                                            <button
                                                onClick={() => setToEnrolled(student.id, student.name)}
                                                className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors"
                                            >
                                                {!student.enrolledNext ? "SET ENROLLED" : "UNSET ENROLLED"}
                                            </button>
                                        ) : <p className="text-blue-900 text-xs text-center">NO ACTION</p>}

                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>

            {withStatus.length > 0 && (
                <div className="mt-3 text-right text-sm text-gray-600 border-t pt-2">
                    Total: <span className="font-semibold text-gray-800">{withStatus.length}</span> students
                </div>
            )}

        </motion.div>
    );
}

