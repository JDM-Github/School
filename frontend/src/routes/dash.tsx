import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Legend,
    Radar as RechartsRadar,
    Bar,
    BarChart as RechartsBarChart
} from "recharts";
import {  BookOpen, Calendar, Users } from "lucide-react";
import { StudentAnalytics } from "../lib/type";
import { useSY } from "../layout/syprovider";
import RequestHandler from "../lib/utilities/RequestHandler";
import { Card } from "../components/ui/card";
import { removeToast, showToast } from "../components/toast";
import VisionMissionCard from "../components/dashboard/visionMission";

export default function Dashboard() {
    const { currentSY } = useSY();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [allVisionMissions, setAllVisionMissions] = useState<any>([]);
    const [analyticsData, setAnalyticsData] = useState<StudentAnalytics[]>([]);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await RequestHandler.fetchData(
                "GET",
                `student/get-all-by-sy?currentSchoolYear=${currentSY}`
            );

            if (res.success) setAnalyticsData(res.students as StudentAnalytics[]);
            else setError("No students found.");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error fetching students");
        }

        try {
            const res = await RequestHandler.fetchData(
                "GET",
                `school-year/get-vision-mission`
            );
            if (res.success) setAllVisionMissions(res.visionMission);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error fetching vision and mission");
        }
        setLoading(false);
    };

    const updateVisionMission = async (school_year:string, vision: string, mission: string) => {
        const toastId = showToast("Updating vision and mission...", "loading");
        try {
            const res = await RequestHandler.fetchData(
                "POST",
                `school-year/update-vision-mission`,
                { school_year, vision, mission }
            );

            removeToast(toastId);
            if (res.success) {
                setAllVisionMissions(res.visionMission);
                showToast("Successfully updated vision and mission", "success");
            } else {
                showToast("Error updating vision and mission.", "error");
            }
        } catch (err: unknown) {
            removeToast(toastId);
            setError(err instanceof Error ? err.message : "Error update vision or mission");
            showToast("Error updating vision and mission.", "error");
        }
    }

    useEffect(() => {
        fetchAnalytics();
    }, [currentSY]);

    const gradeStats = ["Grade 11", "Grade 12"].map((grade) => {
        const students = analyticsData.filter((s) => s.grade_level === grade);
        const totalSubjects = students.reduce(
            (sum, s) => sum + (s.subjectGrades?.length || 0),
            0
        );
        return {
            grade,
            totalStudents: students.length,
            totalSubjects,
        };
    });


    const subjectIdToName: Record<number, string> = {};
    const allSubjects = new Set<string>();
    analyticsData.forEach((s) =>
        s.subjectAttendances.forEach((att) => {
            subjectIdToName[att.subject_id] = att.subject.name;
            allSubjects.add(att.subject.name);
        })
    );
    const subjectPerformance = Object.values(
        analyticsData
            .flatMap((s) => s.subjectGrades)
            .reduce<Record<number, { name: string; grades: number[] }>>((acc, g) => {
                const name = subjectIdToName[g.subject_id] || `Subject ${g.subject_id}`;
                if (!acc[g.subject_id]) acc[g.subject_id] = { name, grades: [] };
                acc[g.subject_id].grades.push(Number(g.final_quarter));
                return acc;
            }, {})
    ).map((s) => ({
        subject: s.name,
        avg: Math.round(s.grades.reduce((a, b) => a + b, 0) / s.grades.length),
    }));

    const radarData = subjectPerformance.map((s) => ({
        subject: s.subject,
        avg: s.avg,
    }));

    const months = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december",
    ];

    const attendanceDataByMonth = months.map((month) => {
        const grade11Students = analyticsData.filter((s) => s.grade_level === "Grade 11");
        const grade12Students = analyticsData.filter((s) => s.grade_level === "Grade 12");

        const sumDays = (students: typeof analyticsData) =>
            students.reduce(
                (total, s) =>
                    total +
                    s.subjectAttendances.reduce(
                        (subTotal, sub) => subTotal + (sub as any)[month].length,
                        0
                    ),
                0
            );

        const grade11Rate = grade11Students.length
            ? Math.round((sumDays(grade11Students) / (grade11Students.length * 200)) * 100)
            : 0;
        const grade12Rate = grade12Students.length
            ? Math.round((sumDays(grade12Students) / (grade12Students.length * 200)) * 100)
            : 0;

        return {
            month: month.charAt(0).toUpperCase() + month.slice(1),
            "Grade 11": grade11Rate,
            "Grade 12": grade12Rate,
        };
    });

    const allRates = attendanceDataByMonth.flatMap((d) => [d["Grade 11"], d["Grade 12"]]);
    const minRate = Math.max(0, Math.min(...allRates) - 1);
    const maxRate = Math.min(100, Math.max(...allRates) + 1);

    // DEMO GRAPHICS
    const studentDemographics = ["Grade 11", "Grade 12"].map((grade) => {
        const students = analyticsData.filter((s) => s.grade_level === grade);
        const maleCount = students.filter((s) => s.account.sex === "Male").length;
        const femaleCount = students.filter((s) => s.account.sex === "Female").length;
        const ages = students.map((s) => s.account.age);
        const minAge = ages.length ? Math.min(...ages) : 0;
        const maxAge = ages.length ? Math.max(...ages) : 0;
        const avgAge = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

        return {
            grade,
            male: maleCount,
            female: femaleCount,
            minAge,
            maxAge,
            avgAge,
        };
    });

    const genderChartData = studentDemographics.map((d) => ({
        grade: d.grade,
        Male: d.male,
        Female: d.female,
    }));

    return (
        <div className="lg:flex flex-col lg:flex-row w-full p-4 gap-4 bg-gray-50 text-gray-800">

            <motion.div className="lg:w-2/3 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center space-x-4">
                    <img src="/icon.png" alt="Logo Icon" className="w-12 h-12" />
                    <div>
                        <h2 className="text-xl font-semibold">Senior National High School</h2>
                        <p className="text-gray-600">School Year: {currentSY}, Students: Grade 11 & 12</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {gradeStats.map((g) => (
                        <Card key={g.grade} className="p-3 bg-white shadow hover:shadow-lg transition">
                            <p className="text-sm text-gray-500">{g.grade} Students</p>
                            <p className="text-xl font-bold">{g.totalStudents}</p>
                            <p className="text-sm text-gray-400">Subjects Taken: {g.totalSubjects}</p>
                        </Card>
                    ))}
                    <Card key={"subject-number"} className="p-3 bg-white shadow hover:shadow-lg transition">
                        <p className="text-sm text-gray-500">All Subjects</p>
                        <p className="text-xl font-bold">{allSubjects.size}</p>
                        <p className="text-sm text-gray-400">Number of Subjects</p>
                    </Card>
                </div>

                <Card className="p-4 bg-white shadow hover:shadow-lg transition">
                    <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-5 h-5 text-gray-600" />
                        <h2 className="font-semibold text-gray-800">Subject Performance</h2>
                    </div>
                    <div className="w-full h-100">
                        {loading ? (
                            <p className="text-center text-gray-500 mt-10">Loading...</p>
                        ) : error ? (
                            <p className="text-center text-red-500 mt-10">Error: {error}</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <RechartsRadar
                                        name="Average Grade"
                                        dataKey="avg"
                                        stroke="#4f46e5"
                                        fill="#4f46e5"
                                        fillOpacity={0.6}
                                    />
                                    <Tooltip />
                                    <Legend verticalAlign="top" />
                                </RadarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                <Card className="p-4 bg-white shadow hover:shadow-lg transition">
                    <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <h2 className="font-semibold text-gray-800">Attendance Rate (%)</h2>
                    </div>
                    <div className="w-full h-48">
                        {loading ? (
                            <p className="text-center text-gray-500 mt-10">Loading...</p>
                        ) : error ? (
                            <p className="text-center text-red-500 mt-10">Error: {error}</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={attendanceDataByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis domain={[minRate, maxRate]} />
                                    <Tooltip />
                                    <Legend verticalAlign="top" />
                                    <Line
                                        type="monotone"
                                        dataKey="Grade 11"
                                        stroke="#4f46e5"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Grade 12"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
                <Card className="p-4 bg-white shadow hover:shadow-lg transition">
                    <h2 className="font-semibold text-gray-800">Reports & Recommendations</h2>

                    {loading ? (
                        <p className="text-gray-500 mt-2">Loading...</p>
                    ) : error ? (
                        <p className="text-red-500 mt-2">Error: {error}</p>
                    ) : (
                        <ul className="mt-2 text-gray-600 space-y-1">
                            {subjectPerformance.map((s) => {
                                if (s.avg < 75) {
                                    return (
                                        <li key={s.subject}>
                                            Consider providing additional support for <strong>{s.subject}</strong> — average grade is {s.avg}.
                                        </li>
                                    );
                                }
                                return null;
                            })}

                            {attendanceDataByMonth.some(d => d["Grade 11"] < 75) && (
                                <li>
                                    Grade 11 students have low attendance in some months — consider sending reminders or monitoring closely.
                                </li>
                            )}
                            {attendanceDataByMonth.some(d => d["Grade 12"] < 75) && (
                                <li>
                                    Grade 12 students have low attendance in some months — consider sending reminders or monitoring closely.
                                </li>
                            )}

                            {analyticsData
                                .filter(s => s.subjectGrades.some(g => Number(g.final_quarter) >= 90))
                                .slice(0, 5)
                                .map(s => (
                                    <li key={s.id}>
                                        <strong>{s.account.firstName}</strong> shows strong performance in some subjects — consider recognizing their achievement.
                                    </li>
                                ))}

                            {studentDemographics.map(d => (
                                <li key={d.grade}>
                                    {d.grade} has {d.male} male and {d.female} female students, ages ranging from {d.minAge} to {d.maxAge}. Consider age-appropriate learning activities and mentoring.
                                </li>
                            ))}

                            <li>Encourage collaborative study groups in subjects with low average grades.</li>
                            <li>Monitor students with repeated low performance or low attendance for targeted interventions.</li>
                            <li>Offer enrichment programs for high-performing students to maintain engagement.</li>
                        </ul>
                    )}
                </Card>
            </motion.div>

            <motion.div className="lg:w-1/3 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >   
                <Card className="p-4 bg-white shadow hover:shadow-lg transition">
                    <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-5 h-5 text-gray-600" />
                        <h2 className="font-semibold text-gray-800">Student Demographics</h2>
                    </div>

                    {loading ? (
                        <p className="text-center text-gray-500 mt-10">Loading...</p>
                    ) : error ? (
                        <p className="text-center text-red-500 mt-10">Error: {error}</p>
                    ) : (
                        <>
                            <div className="w-full h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={genderChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="grade" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend verticalAlign="top" />
                                        <Bar dataKey="Male" stackId="a" fill="#4f46e5" />
                                        <Bar dataKey="Female" stackId="a" fill="#f472b6" />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                                {studentDemographics.map((d) => (
                                    <div key={d.grade} className="p-2 bg-gray-50 rounded">
                                        <p className="text-gray-500 text-sm">{d.grade} Ages</p>
                                        <p className="text-sm text-gray-600">Min: {d.minAge}</p>
                                        <p className="text-sm text-gray-600">Avg: {d.avgAge}</p>
                                        <p className="text-sm text-gray-600">Max: {d.maxAge}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Card>

                <VisionMissionCard allVisionMissions={allVisionMissions} currentSY={currentSY} updateVisionMission={updateVisionMission} />
                <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Top 5 Students
                    </h2>

                    {loading ? (
                        <p className="text-gray-500 mt-2">Loading...</p>
                    ) : error ? (
                        <p className="text-red-500 mt-2">Error: {error}</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Grade 11</h3>
                                <ul className="space-y-2">
                                    {analyticsData
                                        .filter(s => s.grade_level === "Grade 11")
                                        .map(s => ({
                                            name: `${s.account.firstName} ${s.account.lastName}`,
                                            avg: Math.round(
                                                s.subjectGrades.reduce((a, g) => a + Number(g.final_quarter), 0) /
                                                s.subjectGrades.length
                                            ),
                                        }))
                                        .sort((a, b) => b.avg - a.avg)
                                        .slice(0, 5)
                                        .map((student, idx) => (
                                            <li
                                                key={idx}
                                                className="flex justify-between items-center p-3 rounded-md bg-gray-100 hover:bg-gray-300 transition"
                                            >
                                                <span className="font-medium text-gray-800">{student.name}</span>
                                                <span className="font-semibold text-gray-700">{student.avg}</span>
                                            </li>
                                        ))}
                                </ul>
                            </div>

                            {/* Grade 12 */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Grade 12</h3>
                                <ul className="space-y-2">
                                    {analyticsData
                                        .filter(s => s.grade_level === "Grade 12")
                                        .map(s => ({
                                            name: `${s.account.firstName} ${s.account.lastName}`,
                                            avg: Math.round(
                                                s.subjectGrades.reduce((a, g) => a + Number(g.final_quarter), 0) /
                                                s.subjectGrades.length
                                            ),
                                        }))
                                        .sort((a, b) => b.avg - a.avg)
                                        .slice(0, 5)
                                        .map((student, idx) => (
                                            <li
                                                key={idx}
                                                className="flex justify-between items-center p-3 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                                            >
                                                <span className="font-medium text-gray-800">{student.name}</span>
                                                <span className="font-semibold text-gray-700">{student.avg}</span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </Card>



                

            </motion.div>
        </div>
    );
}
