import { useState, useMemo } from "react";
import { Card } from "../ui/card";
import { motion } from "framer-motion";
import { Month, Student } from "../../lib/type";
import { useSY } from "../../layout/syprovider";

interface StudentTableProps {
    title: string;
    data: Student[];
    delay?: number;
    selectedSection: string;
    selectedSubject: string;
    months: Month[];
    onMonthClick?: (student: Student, month: Month) => void;
}

export default function StudentTable({ title, data, delay = 0, selectedSection, selectedSubject, onMonthClick, months }: StudentTableProps) {
    const { currentSY } = useSY();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return data
            .filter(s => s.account.name.toLowerCase().includes(term) || s.section.section_name.toLowerCase().includes(term))
            .filter(student => {
                const sectionMatch = selectedSection === "ALL" || student.section.section_name === selectedSection;
                const subjectMatch = selectedSubject === "ALL" || student.attendance.subjectAttendances.some(subj => subj.subject.name === selectedSubject);
                return sectionMatch && subjectMatch;
            });
    }, [data, searchTerm, selectedSection, selectedSubject]);

    const getMonthYear = (month: Month, schoolYear: string) => {
        const [startYearStr, endYearStr] = schoolYear.split("-");
        const startYear = parseInt(startYearStr, 10);
        const endYear = parseInt(endYearStr, 10);

        const upperMonth = month.toUpperCase();
        if (["JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"].includes(upperMonth)) {
            return startYear;
        } else {
            return endYear;
        }
    };

    return (
        <Card className="bg-white border shadow-sm rounded-lg overflow-hidden">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
                <div className="bg-gray-400 text-white text-lg font-semibold px-4 py-2">
                    <div className="flex justify-between items-center">
                        <span>{title}</span>
                        <span>
                            FILTER:{" "} {selectedSection === "ALL" ? "ALL SECTIONS" : selectedSection}, {selectedSubject === "ALL" ? "ALL SUBJECTS" : selectedSubject}
                        </span>
                    </div>
                    <div className="mt-2 flex justify-end">
                        <input type="text" placeholder="Search by name or section..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-50 placeholder-gray-50 w-72" />
                    </div>

                </div>

                <div className="overflow-auto max-h-[45vh] mt-3">
                    <table className="min-w-max text-xs md:text-sm border-collapse">
                        <thead className="bg-blue-100 text-gray-700 font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 text-center">ID</th>
                                <th className="px-4 py-2 text-center">GRADE LEVEL</th>
                                <th className="px-4 py-2 text-center">SCHOOL YEAR</th>
                                <th className="px-4 py-2 text-center">NAME</th>
                                <th className="px-4 py-2 text-center">AGE</th>
                                <th className="px-4 py-2 text-center">SEX</th>
                                <th className="px-4 py-2 text-center">SECTION</th>
                                <th className="px-4 py-2 text-center">ADVISER</th>
                                {months.map(month => <th key={month} className="px-4 py-2 text-center">{month.slice(0, 3).toUpperCase()}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map(student => {

                                const monthTotals = months.map((month) => {
                                    const subjectsToCount =
                                        selectedSubject !== "ALL"
                                            ? student.attendance.subjectAttendances.filter(
                                                (subj: any) => subj.subject.name === selectedSubject
                                            )
                                            : student.attendance.subjectAttendances;

                                    return subjectsToCount.reduce((acc: number, subj: any) => {
                                        const days: string[] = subj[month] || [];
                                        const validDays = days.filter((d) => {
                                            const jsMonthIndex = (() => {
                                                const m = month.toLowerCase();
                                                const map: Record<string, number> = {
                                                    june: 5, july: 6, august: 7, september: 8,
                                                    october: 9, november: 10, december: 11,
                                                    january: 0, february: 1, march: 2, april: 3, may: 4
                                                };
                                                return map[m];
                                            })();
                                            const year = getMonthYear(month, currentSY);
                                            const dayOfWeek = new Date(year, jsMonthIndex, parseInt(d)).getDay();
                                            return dayOfWeek !== 0 && dayOfWeek !== 6;
                                        });

                                        return acc + validDays.length;
                                    }, 0);
                                });

                                return (
                                    <tr key={student.id} className="hover:bg-gray-50 text-center">
                                        <td className="px-4 py-2">{student.id}</td>
                                        <td className="px-4 py-2">{student.grade_level}</td>
                                        <td className="px-4 py-2">{student.school_year}</td>
                                        <td className="px-4 py-2">{student.account.name}</td>
                                        <td className="px-4 py-2">{student.account.age}</td>
                                        <td className="px-4 py-2">{student.account.sex}</td>
                                        <td className="px-4 py-2">{student.section.section_name}</td>
                                        <td className="px-4 py-2">{student.adviser_name}</td>
                                        {months.map((month, idx) => (
                                            <td key={month} className={`px-4 py-2 text-center hover:bg-blue-50 ${selectedSubject !== "ALL" ? "cursor-pointer" : ""}`}
                                                onClick={() => { if (selectedSubject !== "ALL" && onMonthClick) onMonthClick(student, month); }}>
                                                {monthTotals[idx]}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </Card>
    );
}
