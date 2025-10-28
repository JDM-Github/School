import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Group } from "../../lib/type";

interface GroupSubjectCountBarProps {
    title: string;
    color?: string;
    data: Group[];
}

/**
 * Displays a grouped bar chart showing total counts of Applied, Specialized, and Core subjects
 * across all groups combined. Automatically updates based on filtered groups.
 */
export function GroupSubjectCountBar({
    title,
    color = "#f59e0b",
    data,
}: GroupSubjectCountBarProps) {
    const totalApplied = data.reduce((sum, g) => sum + (g.applied_subjects?.length || 0), 0);
    const totalSpecialized = data.reduce((sum, g) => sum + (g.specialized_subjects?.length || 0), 0);
    const totalCore = data.reduce((sum, g) => sum + (g.core_subjects?.length || 0), 0);

    const chartData = [
        { category: "Applied", count: totalApplied },
        { category: "Specialized", count: totalSpecialized },
        { category: "Core", count: totalCore },
    ];

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
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                        <XAxis dataKey="category" stroke="#555" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill={color} name="Total Subjects" barSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
