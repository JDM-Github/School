import { useState, useMemo } from "react";
import { Card } from "../ui/card";
import { motion } from "framer-motion";
import { SemesterMasterlist } from "../../lib/fakedata";


interface SemesterMasterlistTableProps {
    title: string;
    data: SemesterMasterlist[];
    onToggleStatus?: (rowIndex: number) => void;
    delay?: number;
}

export default function SemesterMasterlistTable({
    title,
    data,
    onToggleStatus,
    delay = 0
}: SemesterMasterlistTableProps) {
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return data
            .map((item, index) => ({ ...item, originalIndex: index }))
            .filter(
                (item) =>
                    item.adviser.toLowerCase().includes(term) ||
                    item.section.toLowerCase().includes(term) ||
                    item.program.toLowerCase().includes(term)
            );
    }, [searchTerm, data]);

    const totals = useMemo(() => {
        const t = {
            male: 0,
            female: 0,
            total: 0,
            totalSubjects: 0,
            completedSubjects: 0,
            incompleteSubjects: 0,
            notEncoded: 0,
        };
        filteredData.forEach((item) => {
            t.male += item.male;
            t.female += item.female;
            t.total += item.total;
            t.totalSubjects += item.totalSubjects;
            t.completedSubjects += item.completedSubjects;
            t.incompleteSubjects += item.incompleteSubjects;
            t.notEncoded += item.notEncoded;
        });
        return t;
    }, [filteredData]);

    return (
        <Card className="bg-white border shadow-sm rounded-lg overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay }}
            >
                <div className="bg-gray-400 text-white text-lg font-semibold px-4 py-2">
                    <div className="flex justify-between items-center">
                        <span>{title}</span>
                        <span>
                            ADVISER:{" "}
                            {hoveredRow !== null ? (
                                <span className="text-gray-300">
                                    {filteredData[hoveredRow]?.adviser}
                                </span>
                            ) : (
                                <span className="text-gray-300">NONE</span>
                            )}
                        </span>
                    </div>
                    <div className="mt-2 flex justify-end">
                        <input
                            type="text"
                            placeholder="Search adviser, section, or group..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-50 placeholder-gray-50 focus:outline-none focus:ring-2 focus:ring-transparent focus:border-gray-50 w-72"
                        />
                    </div>
                </div>

                <div className="overflow-auto max-h-[30vh] mt-3">
                    <table className="min-w-max text-xs md:text-sm border-collapse">
                        <thead className="bg-blue-100 text-gray-700 font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 text-center">GRADE LEVEL</th>
                                <th className="px-4 py-2 text-center">SECTION</th>
                                <th className="px-4 py-2 text-center">PROGRAM</th>
                                <th className="px-4 py-2 text-center">ADVISER</th>
                                <th className="px-4 py-2 text-center">MALE</th>
                                <th className="px-4 py-2 text-center">FEMALE</th>
                                <th className="px-4 py-2 text-center">TOTAL</th>
                                <th className="px-4 py-2 text-center">TOTAL NO. OF SUBJECTS</th>
                                <th className="px-4 py-2 text-center">COMPLETED SUBJECTS</th>
                                <th className="px-4 py-2 text-center">INCOMPLETE SUBJECTS</th>
                                <th className="px-4 py-2 text-center">NOT ENCODED ENTRIES</th>
                                <th className="px-4 py-2 text-center">STATUS OF COMPLETION</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map((item, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="hover:bg-gray-50 text-center"
                                    onMouseEnter={() => setHoveredRow(rowIndex)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td className="px-4 py-2">{item.grade_level}</td>
                                    <td className="px-4 py-2">{item.section}</td>
                                    <td className="px-4 py-2">{item.program}</td>
                                    <td className="px-4 py-2 truncate">{item.adviser}</td>
                                    <td className="px-4 py-2">{item.male}</td>
                                    <td className="px-4 py-2">{item.female}</td>
                                    <td className="px-4 py-2">{item.total}</td>
                                    <td className="px-4 py-2">{item.totalSubjects}</td>
                                    <td className="px-4 py-2">{item.completedSubjects}</td>
                                    <td className="px-4 py-2">{item.incompleteSubjects}</td>
                                    <td className="px-4 py-2">{item.notEncoded}</td>
                                    <td
                                        className={`px-4 py-2 font-semibold ${item.status === "COMPLETE" ? "text-green-600" : "text-red-600"
                                            } cursor-pointer`}
                                        onClick={() =>
                                            onToggleStatus?.(item.originalIndex)
                                        }
                                    >
                                        {item.status}
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-blue-50 text-blue-700 font-semibold text-center">
                                <td colSpan={5}>TOTAL</td>
                                <td>{totals.male}</td>
                                <td>{totals.female}</td>
                                <td>{totals.total}</td>
                                <td>{totals.totalSubjects}</td>
                                <td>{totals.completedSubjects}</td>
                                <td>{totals.incompleteSubjects}</td>
                                <td>{totals.notEncoded}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </Card>
    );
}

