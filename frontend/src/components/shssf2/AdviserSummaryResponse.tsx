import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";
import { useMemo } from "react";

interface AdviserResponse {
    gradeLevel?: string;
    section: string;
    program: string;
    adviser: string;
    group: string;
    months: string[];
}

interface AdviserSummaryResponseAnalyticsProps {
    title: string;
    data: AdviserResponse[];
}

export default function AdviserSummaryResponseAnalytics({ title, data }: AdviserSummaryResponseAnalyticsProps) {
    const chartData = useMemo(() => {
        if (data.length === 0) return [];

        const monthNames = ["June", "July", "August", "September", "October", "November", "December"];
        const monthTotals = Array(monthNames.length).fill(0);

        data.forEach((item) =>
            item.months.forEach((status, i) => {
                if (status === "ENCODED") monthTotals[i]++;
            })
        );

        return monthNames.map((month, i) => ({
            month,
            responses: monthTotals[i],
        }));
    }, [data]);

    return (
        <motion.div
            className="bg-white shadow border p-5 rounded-lg space-y-6 h-fit"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 border-b pb-2">
                <BarChart3 className="text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-700">
                    {title}
                </h2>
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="month" stroke="#555" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="responses" fill="#10b981" name="Responses" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
