import { useMemo } from "react";
import { Card } from "../ui/card";
import { motion } from "framer-motion";

interface AdviserResponse {
    grade_level?: string;
    section: string;
    program: string;
    adviser: string;
    months: string[];
}

interface AdviserGroupSummaryTableProps {
    title: string;
    data: AdviserResponse[];
    delay?: number;
}

export default function AdviserGroupSummaryTable({
    title,
    data,
    delay = 0,
}: AdviserGroupSummaryTableProps) {
    const groupSummary = useMemo(() => {
        if (!data || data.length === 0) return [];

        const summary: Record<
            string,
            { advisers: number; responses: number[] }
        > = {};

        const monthCount = data[0]?.months?.length || 0;

        data.forEach((item) => {
            const group = item.grade_level || "UNKNOWN";

            if (!summary[group]) {
                summary[group] = {
                    advisers: 0,
                    responses: Array(monthCount).fill(0),
                };
            }

            summary[group].advisers += 1;

            item.months.forEach((m, i) => {
                if (m === "ENCODED") summary[group].responses[i] += 1;
            });
        });

        return Object.entries(summary).map(([group, info]) => ({
            group,
            advisers: info.advisers,
            responses: info.responses,
        }));
    }, [data]);

    const totals = useMemo(() => {
        if (groupSummary.length === 0) return { totalAdvisers: 0, totalResponses: [] };

        const monthCount = groupSummary[0]?.responses?.length || 0;
        const totalResponses = Array(monthCount).fill(0);
        let totalAdvisers = 0;

        groupSummary.forEach((g) => {
            totalAdvisers += g.advisers;
            g.responses.forEach((r, i) => (totalResponses[i] += r));
        });

        return { totalAdvisers, totalResponses };
    }, [groupSummary]);

    const months = [
        "JUNE",
        "JULY",
        "AUGUST",
        "SEPTEMBER",
        "OCTOBER",
        "NOVEMBER",
        "DECEMBER",
        "JANUARY",
        "FEBRUARY",
        "MARCH",
        "APRIL",
        "MAY",
    ];

    return (
        <Card className="bg-white border shadow-sm rounded-lg overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay }}
            >
                <div className="bg-green-400 text-white text-lg font-semibold px-4 py-2">
                    {title}
                </div>

                <div className="overflow-auto max-h-[40vh]">
                    <table className="min-w-max text-xs md:text-sm border-collapse">
                        <thead className="bg-green-100 text-gray-700 font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 text-center">GROUP</th>
                                <th className="px-4 py-2 text-center">NO. OF ADVISERS</th>
                                <th
                                    className="px-4 py-2 text-center"
                                    colSpan={months.length}
                                >
                                    NUMBER OF ADVISER RESPONSES
                                </th>
                            </tr>
                            <tr>
                                <th></th>
                                <th></th>
                                {months.map((m) => (
                                    <th key={m} className="px-4 py-2 text-center">
                                        {m}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {groupSummary.map((row) => (
                                <tr key={row.group} className="text-center hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium">{row.group}</td>
                                    <td className="px-4 py-2">{row.advisers}</td>
                                    {row.responses.map((r, i) => (
                                        <td key={i} className="px-4 py-2">
                                            {r}
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {groupSummary.length > 0 && (
                                <tr className="bg-green-50 text-green-700 font-semibold text-center">
                                    <td className="px-4 py-2">TOTAL</td>
                                    <td className="px-4 py-2">{totals.totalAdvisers}</td>
                                    {totals.totalResponses.map((v, i) => (
                                        <td key={i} className="px-4 py-2">
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