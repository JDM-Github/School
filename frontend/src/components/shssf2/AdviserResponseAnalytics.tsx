import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface GradeDataItem {
    gradeLevel?: string;
    section: string;
    program: string;
    adviser: string;
    months: string[];
}

interface AdviserResponseAnalyticsProps {
    title: string;
    color?: string;
    data: GradeDataItem[];
}

export function AdviserResponseAnalytics({
    title,
    color = "#2563eb",
    data,
}: AdviserResponseAnalyticsProps) {
    const totals = Array(data[0]?.months.length || 0).fill(0);
    const monthNames = ["June", "July", "August", "September", "October", "November", "December", "January", "February", "March", "April", "May"];

    data.forEach((item) => {
        item.months.forEach((status, index) => {
            if (status === "ENCODED") totals[index]++;
        });
    });

    const chartData = monthNames.map((month, index) => ({
        month,
        responses: totals[index] || 0,
    }));

    return (
        <motion.div
            className="bg-white shadow border p-5 rounded-lg space-y-6 h-fit"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <div className="flex items-center gap-2 border-b pb-2">
                <BarChart3 style={{ color }} />
                <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="month" stroke="#555" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="responses" fill={color} name="Responses" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
