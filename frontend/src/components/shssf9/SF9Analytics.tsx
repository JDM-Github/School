import { motion } from "framer-motion";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
} from "recharts";
import { PieChart as PieChart2 } from "lucide-react";
import { SemesterMasterlist } from "../../lib/fakedata";

interface AnalyticsProps {
    title: string;
    data: SemesterMasterlist[];
    delay?: number;
}

const STATUS_COLORS: Record<string, string> = {
    COMPLETE: "#16a34a",
    INCOMPLETE: "#dc2626",
    "NO INPUT": "#fbbf24",
};

export function SF9Analytics({ title, data, delay = 0 }: AnalyticsProps) {
    const statusTotals = data.reduce(
        (acc, cur) => {
            acc[cur.status] = (acc[cur.status] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const statusData = Object.entries(statusTotals).map(([status, value]) => ({
        name: status,
        value,
    }));

    const gradeLevelMap: Record<string, { male: number; female: number }> = {};
    data.forEach((item) => {
        if (!gradeLevelMap[item.grade_level])
            gradeLevelMap[item.grade_level] = { male: 0, female: 0 };
        gradeLevelMap[item.grade_level].male += item.male;
        gradeLevelMap[item.grade_level].female += item.female;
    });

    const gradeLevelData = Object.entries(gradeLevelMap).map(
        ([gradeLevel, counts]) => ({
            gradeLevel,
            male: counts.male,
            female: counts.female,
        })
    );

    return (
        <motion.div
            className="bg-white shadow border p-5 rounded-lg space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay }}
        >
            <div className="flex items-center gap-2 border-b pb-2">
                <PieChart2 className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                    <h3 className="text-sm font-semibold mb-2 text-gray-600">
                        Status Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                dataKey="value"
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                fill="#8884d8"
                                label
                            >
                                {statusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            STATUS_COLORS[entry.name] || "#8884d8"
                                        }
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={48} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="h-64">
                    <h3 className="text-sm font-semibold mb-2 text-gray-600">
                        Male/Female per Grade Level
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={gradeLevelData}
                            layout="vertical"
                            margin={{ left: 0 }}
                        >
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="gradeLevel" />
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={48} />
                            <Bar dataKey="male" stackId="a" fill="#3b82f6" />
                            <Bar dataKey="female" stackId="a" fill="#f43f5e" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}
