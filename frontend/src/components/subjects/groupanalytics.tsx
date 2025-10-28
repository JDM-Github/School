import { motion } from "framer-motion";
import { Users } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Group } from "../../lib/type";

interface GroupAnalyticsProps {
    title: string;
    color?: string;
    data: Group[];
}

/**
 * Displays a dynamic line chart analytics of subject counts per group.
 * Automatically calculates applied, specialized, and core subject totals
 * based on the provided groups array (including filtered groups).
 */
export function GroupAnalytics({
    title,
    color = "#16a34a", // default green tone
    data,
}: GroupAnalyticsProps) {
    // Auto-generate dataset from group info
    const chartData = data.map((group) => {
        const appliedCount = group.applied_subjects?.length || 0;
        const specializedCount = group.specialized_subjects?.length || 0;
        const coreCount = group.core_subjects?.length || 0;

        return {
            name: group.name,
            Applied: appliedCount,
            Specialized: specializedCount,
            Core: coreCount,
        };
    });

    return (
        <motion.div
            className="bg-white shadow border p-5 rounded-lg space-y-6 h-fit"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 border-b pb-2">
                <Users style={{ color }} />
                <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                        <XAxis dataKey="name" stroke="#555" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="Applied"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Applied Subjects"
                        />
                        <Line
                            type="monotone"
                            dataKey="Specialized"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Specialized Subjects"
                        />
                        <Line
                            type="monotone"
                            dataKey="Core"
                            stroke={color}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Core Subjects"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
