import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    PolarRadiusAxis
} from "recharts";
import { BookOpen, Calendar, PieChart as PieIcon } from "lucide-react";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { Card } from "../../components/ui/card";
import { useSY } from "../../layout/syprovider";
import { useAuth } from "../../context/auth";

interface Grade {
    subject_name: string;
    first_quarter: string;
    second_quarter: string;
    third_quarter: string;
    final_quarter: string;
}

interface AttendanceMonth {
    [month: string]: string[];
}

interface Student {
    id: number;
    name: string;
    sex: string;
    grade_level: string;
    grades: Grade[];
    attendance: { subject_name: string; months: AttendanceMonth }[];
}

interface AdviserData {
    adviser_id: number;
    adviser_name: string;
    section: string;
    grade_level?: string;
    total_students: number;
    male_students: number;
    female_students: number;
    students: Student[];
    shsf2_status: { [month: string]: string };
}

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

export default function TeacherDashboard() {
    const { user } = useAuth();
    const { currentSY } = useSY();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [adviserData, setAdviserData] = useState<AdviserData | null>(null);

    const fetchStudentsByAdviser = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await RequestHandler.fetchData(
                "GET",
                `adviser/get-students-by-adviser-account/${user?.id}?school_year=${currentSY}`
            );
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                setAdviserData(res.data[0]);
            } else {
                setError("No students found for this adviser.");
            }
        } catch (err: any) {
            setError(err.message || "Error fetching students");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentsByAdviser();
    }, [currentSY]);

    const subjectPerformance = () => {
        if (!adviserData) return [];
        const map: { [sub: string]: { total: number; count: number } } = {};
        adviserData.students.forEach(student =>
            student.grades.forEach(grade => {
                const final = Number(grade.final_quarter);
                if (!map[grade.subject_name]) map[grade.subject_name] = { total: final, count: 1 };
                else { map[grade.subject_name].total += final; map[grade.subject_name].count += 1; }
            })
        );
        return Object.entries(map).map(([subject, { total, count }]) => ({ subject, average: Math.round(total / count) }));
    };

    const attendanceTrend = () => {
        if (!adviserData) return [];
        const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        const trend: { month: string; rate: number }[] = months.map(m => ({ month: m.slice(0, 3), rate: 0 }));
        const monthCount: { [month: string]: number } = {};
        months.forEach(m => monthCount[m] = 0);

        adviserData.students.forEach(student =>
            student.attendance.forEach(att =>
                months.forEach(m => {
                    if (att.months[m]) {
                        trend.find(t => t.month === m.slice(0, 3))!.rate += att.months[m].length;
                        monthCount[m] += 1;
                    }
                })
            )
        );

        return trend.map((t, idx) => {
            const month = months[idx];
            return { month: t.month, rate: monthCount[month] ? Math.round(t.rate / monthCount[month]) : 0 };
        });
    };

    const genderPieData = () => {
        if (!adviserData) return [];
        return [
            { name: "Male", value: adviserData.male_students },
            { name: "Female", value: adviserData.female_students }
        ];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">Loading, please wait...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 text-xl font-semibold mb-2">Something went wrong</p>
                    <p className="text-gray-500">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!adviserData) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <p className="text-gray-600 text-lg">No adviser data found.</p>
            </div>
        );
    }


    return (
        <div className="lg:flex flex-col lg:flex-row w-full p-4 space-y-6 lg:space-y-0 lg:space-x-6 bg-gray-50 text-gray-800">

            {/* Main Area */}
            <motion.div
                className="lg:w-2/3 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
                {/* Adviser Info */}
                <Card className="bg-white shadow border p-6">
                    <div className="flex items-center space-x-4">
                        <img src="/icon.png" alt="Logo Icon" className="w-12 h-12" />
                        <div>
                            <h2 className="text-xl font-semibold">Senior National High School, Adviser: {adviserData.adviser_name}</h2>
                            <p className="text-gray-600">School Year: {currentSY}, Grade Level: {adviserData.students.length > 0 ? adviserData.students[0].grade_level : "NOT SET"}, Current Section {adviserData.section}</p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-100 p-3 rounded"><p className="text-sm text-gray-500">Total Students</p><p className="text-2xl font-bold">{adviserData.total_students}</p></div>
                        <div className="bg-gray-100 p-3 rounded"><p className="text-sm text-gray-500">Male</p><p className="text-2xl font-bold">{adviserData.male_students}</p></div>
                        <div className="bg-gray-100 p-3 rounded"><p className="text-sm text-gray-500">Female</p><p className="text-2xl font-bold">{adviserData.female_students}</p></div>
                        <div className="bg-gray-100 p-3 rounded"><p className="text-sm text-gray-500">Current Status</p><p className="text-2xl font-bold">{adviserData.shsf2_status ? "Available" : "N/A"}</p></div>
                    </div>
                </Card>

                <Card className="bg-white shadow border p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <BookOpen className="w-6 h-6 text-gray-600" />
                        <h2 className="text-lg font-semibold">Performance per Subject</h2>
                    </div>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectPerformance()} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="subject" />
                                <YAxis domain={[60, 99]} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="average" name="Average Final Grade" fill="#4f46e5" maxBarSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="bg-white shadow border p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Calendar className="w-6 h-6 text-gray-600" />
                        <h2 className="text-lg font-semibold">Attendance Trend</h2>
                    </div>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={attendanceTrend()} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="rate" name="Avg Attendance" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                

            </motion.div>

            <motion.div
                className="lg:w-1/3 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
            >
                <Card className="bg-white shadow border p-6">
                    <h2 className="text-lg font-semibold">Quick Summary</h2>
                    <ul className="mt-3 space-y-2 text-gray-600">
                        <li>Total Students: {adviserData.total_students}</li>
                        <li>Male Students: {adviserData.male_students}</li>
                        <li>Female Students: {adviserData.female_students}</li>
                    </ul>
                </Card>
{/* 
                <Card className="bg-white shadow border p-6">
                    <h2 className="text-lg font-semibold mb-3">SHSF2 Monthly Status</h2>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {adviserData.shsf2_status &&
                            Object.entries(adviserData.shsf2_status).map(([month, status]) => (
                                <div key={month} className="bg-gray-100 p-3 rounded">
                                    <p className="text-sm text-gray-500">{month.replace("_status", "").charAt(0).toUpperCase() + month.replace("_status", "").slice(1)}</p>
                                    <p className="text-lg font-bold">{status}</p>
                                </div>
                            ))
                        }
                    </div>
                </Card> */}
                <Card className="bg-white shadow border p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <PieIcon className="w-6 h-6 text-gray-600" />
                        <h2 className="text-lg font-semibold">SHSF2 Monthly Status</h2>
                    </div>

                    <div className="w-full h-80">
                        {adviserData.shsf2_status ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart
                                    cx="50%"
                                    cy="50%"
                                    outerRadius="80%"
                                    data={Object.entries(adviserData.shsf2_status).map(([month, status]) => {
                                        const normalized = status.trim().toLowerCase();

                                        const value =
                                            normalized === "encoded"
                                                ? 3
                                                : normalized === "no input"
                                                    ? 1
                                                    : 2;

                                        return {
                                            month:
                                                month
                                                    .replace("_status", "")
                                                    .charAt(0)
                                                    .toUpperCase() + month.replace("_status", "").slice(1),
                                            value,
                                            status,
                                        };
                                    })}
                                >
                                    <PolarGrid />
                                    <PolarRadiusAxis domain={[1, 3]} /> 
                                    <PolarAngleAxis dataKey="month" />
                                    <Radar
                                        name="Status"
                                        dataKey="value"
                                        stroke="#4f46e5"
                                        fill="#6366f1"
                                        fillOpacity={0.6}
                                    />
                                    <Tooltip
                                        formatter={(_: number, __: string, props: any) => props.payload.status}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center">No SHSF2 data available</p>
                        )}
                    </div>
                </Card>


                <Card className="bg-white shadow border p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <PieIcon className="w-6 h-6 text-gray-600" />
                        <h2 className="text-lg font-semibold">Gender Distribution</h2>
                    </div>
                    <div className="w-full h-64 flex justify-center items-center">
                        <ResponsiveContainer width="50%" height="100%">
                            <PieChart>
                                <Pie data={genderPieData()} dataKey="value" nameKey="name" label>
                                    {genderPieData().map((_, idx) => (
                                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
