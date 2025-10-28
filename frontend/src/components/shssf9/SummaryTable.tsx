import { useMemo } from "react";
import { Card } from "../ui/card";
import { motion } from "framer-motion";
import { SemesterMasterlist } from "../../lib/type";

interface SummaryRow {
    gradeLevel: string;
    numAdvisers: number;
    male: number;
    female: number;
    total: number;
    complete: number;
    incomplete: number;
    noInput: number;
}

interface SummaryTableProps {
    title: string;
    combinedData: SemesterMasterlist[];
}

export default function SummaryTable({ title, combinedData }: SummaryTableProps) {
    const summary: SummaryRow[] = useMemo(() => {
        const map: Record<string, SummaryRow> = {};

        combinedData.forEach((item) => {
            if (!map[item.grade_level]) {
                map[item.grade_level] = {
                    gradeLevel: item.grade_level,
                    numAdvisers: 0,
                    male: 0,
                    female: 0,
                    total: 0,
                    complete: 0,
                    incomplete: 0,
                    noInput: 0,
                };
            }

            const row = map[item.grade_level];
            row.numAdvisers += 1;
            row.male += item.male;
            row.female += item.female;
            row.total += item.total;

            if (item.status === "COMPLETE") row.complete += 1;
            else if (item.status === "INCOMPLETE") row.incomplete += 1;
            else row.noInput += 1;
        });

        const totalRow: SummaryRow = {
            gradeLevel: "TOTAL",
            numAdvisers: 0,
            male: 0,
            female: 0,
            total: 0,
            complete: 0,
            incomplete: 0,
            noInput: 0,
        };

        Object.values(map).forEach((row) => {
            totalRow.numAdvisers += row.numAdvisers;
            totalRow.male += row.male;
            totalRow.female += row.female;
            totalRow.total += row.total;
            totalRow.complete += row.complete;
            totalRow.incomplete += row.incomplete;
            totalRow.noInput += row.noInput;
        });

        return [...Object.values(map), totalRow];
    }, [combinedData]);

    return (
        <Card className="bg-white border shadow-sm rounded-lg overflow-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <div className="bg-blue-400 text-white text-lg font-semibold px-4 py-2">
                    {title}
                </div>
                <table className="w-full text-sm border-collapse table-auto">
                    <thead className="bg-blue-100 text-gray-700 font-semibold sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2 text-center w-[15%]">GRADE LEVEL</th>
                            <th className="px-4 py-2 text-center w-[15%]">NO. OF ADVISERS</th>
                            <th className="px-4 py-2 text-center" colSpan={3}>
                                1ST SEMESTER MASTERLIST
                            </th>
                            <th className="px-4 py-2 text-center" colSpan={3}>
                                BY STATUS OF COMPLETION
                            </th>
                        </tr>
                        <tr>
                            <th></th>
                            <th></th>
                            <th className="px-4 py-2 text-center">MALE</th>
                            <th className="px-4 py-2 text-center">FEMALE</th>
                            <th className="px-4 py-2 text-center">TOTAL</th>
                            <th className="px-4 py-2 text-center">COMPLETE</th>
                            <th className="px-4 py-2 text-center">INCOMPLETE</th>
                            <th className="px-4 py-2 text-center">NO INPUT</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-center">
                        {summary.map((row, idx) => (
                            <tr
                                key={idx}
                                className={row.gradeLevel === "TOTAL" ? "bg-blue-50 font-semibold" : ""}
                            >
                                <td className="px-4 py-2">{row.gradeLevel}</td>
                                <td className="px-4 py-2">{row.numAdvisers}</td>
                                <td className="px-4 py-2">{row.male}</td>
                                <td className="px-4 py-2">{row.female}</td>
                                <td className="px-4 py-2">{row.total}</td>
                                <td className="px-4 py-2">{row.complete}</td>
                                <td className="px-4 py-2">{row.incomplete}</td>
                                <td className="px-4 py-2">{row.noInput}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </Card>

    );
}
