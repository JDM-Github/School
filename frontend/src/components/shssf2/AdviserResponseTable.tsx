import { useState, useMemo } from "react";
import { Card } from "../ui/card";
import { motion } from "framer-motion";

interface AdviserResponse {
    gradeLevel?: string;
    section: string;
    program: string;
    adviser: string;
    months: string[];
}

interface AdviserResponseTableProps {
    title: string;
    gradeLevel: string;
    data: AdviserResponse[];
    onToggleEncode?: (rowIndex: number, monthIndex: number) => void;
    delay?: number;
}

export default function AdviserResponseTable({
    title,
    gradeLevel,
    data,
    onToggleEncode,
    delay = 0
}: AdviserResponseTableProps) {
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
        if (!filteredData || filteredData.length === 0) return [];
        const monthCount = filteredData[0]?.months?.length || 0;
        if (monthCount === 0) return [];

        const count = Array(monthCount).fill(0);
        filteredData.forEach((item) => {
            if (Array.isArray(item.months)) {
                item.months.forEach((m, i) => {
                    if (m === "ENCODED") count[i]++;
                });
            }
        });

        return count;
    }, [filteredData]);


    const overallTotal = filteredData.length;

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
                        {(hoveredRow !== null) ? (
                            <>
                                <span className="text-gray-300">
                                    {filteredData[hoveredRow]?.adviser}
                                </span>
                            </>
                        ) : <>
                            <span className="text-gray-300">
                                NONE
                            </span>
                        </>}
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

            {/* Table */}
            <div className="overflow-auto max-h-[30vh] mt-3">
                <table className="min-w-max text-xs md:text-sm border-collapse">
                    <thead className="bg-blue-100 text-gray-700 font-semibold sticky top-0 z-10">
                        <tr>
                            <th className="w-[100px] px-4 py-2 text-center">GRADE LEVEL</th>
                            <th className="w-[120px] px-4 py-2 text-center">SECTION</th>
                            <th className="w-[100px] px-4 py-2 text-center">PROGRAM</th>
                            <th className="w-[200px] px-4 py-2 text-center">ADVISER</th>
                            <th className="w-[100px] px-4 py-2 text-center">JUNE</th>
                            <th className="w-[100px] px-4 py-2 text-center">JULY</th>
                            <th className="w-[100px] px-4 py-2 text-center">AUGUST</th>
                            <th className="w-[100px] px-4 py-2 text-center">SEPTEMBER</th>
                            <th className="w-[100px] px-4 py-2 text-center">OCTOBER</th>
                            <th className="w-[100px] px-4 py-2 text-center">NOVEMBER</th>
                            <th className="w-[100px] px-4 py-2 text-center">DECEMBER</th>
                            <th className="w-[100px] px-4 py-2 text-center">JANUARY</th>
                            <th className="w-[100px] px-4 py-2 text-center">FEBRUARY</th>
                            <th className="w-[100px] px-4 py-2 text-center">MARCH</th>
                            <th className="w-[100px] px-4 py-2 text-center">APRIL</th>
                            <th className="w-[100px] px-4 py-2 text-center">MAY</th>
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
                                <td className="px-4 py-2">{gradeLevel}</td>
                                <td className="px-4 py-2">{item.section}</td>
                                <td className="px-4 py-2">{item.program}</td>
                                <td className="px-4 py-2 truncate">{item.adviser}</td>

                                {item.months.map((m, monthIndex) => (
                                    <td
                                        key={monthIndex}
                                        onClick={() => onToggleEncode!(item.originalIndex, monthIndex)}
                                        className={`px-4 py-2 text-center cursor-pointer transition-colors duration-150 ${m === "ENCODED"
                                                ? "text-green-600 font-semibold hover:bg-green-100"
                                                : "text-gray-400 hover:text-blue-600 hover:font-semibold hover:bg-blue-50"
                                            }`}
                                        title={`Click to ${m === "ENCODED" ? "mark as NOT ENCODED" : "mark as ENCODED"
                                            }`}
                                    >
                                        {m}
                                    </td>
                                ))}
                            </tr>
                        ))}

                            {filteredData.length > 0 && (
                                <tr className="bg-blue-50 font-semibold text-center text-blue-700 border-t border-blue-200 sticky bottom-0">
                                    <td colSpan={2}></td>
                                    <td className="px-4 py-2 border-r border-blue-200 text-right">TOTAL:</td>
                                    <td className="px-4 py-2 text-blue-800">{overallTotal}</td>
                                    {totals.map((v, i) => (
                                        <td
                                            key={i}
                                            className={`px-4 py-2 ${v === overallTotal
                                                    ? "bg-green-50 text-green-700 font-bold"
                                                    : "text-blue-800"
                                                }`}
                                        >
                                            {v}
                                        </td>
                                    ))}
                                </tr>
                            )}
                    </tbody>
                </table>
            </div>
            </motion.div>
        </Card>
    );
}
