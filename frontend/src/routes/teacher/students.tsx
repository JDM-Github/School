import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { Month } from "../../lib/type";
import StudentTable from "../../components/teacher/students/studentstable";
import { AttendanceEditor } from "../../components/students/attendanceeditor";
import { removeToast, showToast } from "../../components/toast";
import { useSY } from "../../layout/syprovider";
import { useAuth } from "../../context/auth";

export default function StudentsByAdviser() {
    const { user } = useAuth();
    const { currentSY } = useSY();
    const months: Month[] = [
        "june", "july", "august", "september",
        "october", "november", "december", "january",
        "february", "march", "april", "may"
    ];

    const [students, setStudents] = useState<any[]>([]);
    const [originalStudents, setOriginalStudents] = useState<any[]>([]);

    const [shssf2, setShssf2] = useState<any[]>([]);
    const [subjectMap, setSubjectMap] = useState<any>({});
    const [selectedSubject, setSelectedSubject] = useState("ALL");
    const [editedStatus, setEditedStatus] = useState<any>({});
    const [editedAttendance, setEditedAttendance] = useState<any>({});

    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<Month | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [adviserName, setAdviserName] = useState<string>("");

    const handleMonthClick = (student: any, month: Month, selectedSubject: string, localShsSf2: any) => {
        if (localShsSf2[month + "_status"] === "ENCODED") {
            showToast(`Cannot edit ${month} attendance. Currently marked as encoded.`, "error");
            setSelectedStudent(null);
            setSelectedStudent(null);
            return;
        }
        setSelectedStudent(student);
        setSelectedMonth(month);
        setSelectedSubject(selectedSubject);
    };

    const getDaysInMonth = (month: Month) => {
        const monthIndex = months.indexOf(month);
        const year = 2024;
        return new Date(year, monthIndex + 1, 0).getDate();
    };

    const handleAttendanceChange = (
        studentId: number,
        month: Month,
        days: string[]
    ) => {
        setStudents(prev =>
            prev.map(s =>
                s.id === studentId
                    ? {
                        ...s,
                        attendance: s.attendance.map((a: any) =>
                            a.subject_name === selectedSubject
                                ? { ...a, months: { ...a.months, [month]: days } }
                                : a
                        ),
                    }
                    : s
            )
        );

        setEditedAttendance((prev: any) => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [subjectMap[selectedSubject]]: {
                    ...(prev[studentId]?.[subjectMap[selectedSubject]] || {}),
                    [month]: days,
                },
            },
        }));
        console.log(editedAttendance);
    };


    const fetchStudentsByAdviser = async () => {
        setLoading(true);
        setError(null);
        setSelectedStudent(null);
        setSelectedStudent(null);
        setSubjectMap({});
        try {
            const res = await RequestHandler.fetchData(
                "GET",
                `adviser/get-students-by-adviser-account/${user?.id}?school_year=${currentSY}`
            );

            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                const adviserData = res.data[0];
                setAdviserName(adviserData.adviser_name);
                setStudents(adviserData.students);
                setShssf2(adviserData.shsf2_status);
                setOriginalStudents(JSON.parse(JSON.stringify(adviserData.students)));

                const first = adviserData;
                const newEditedStatus = first.formattedSubjectStatuses.reduce((acc: any, subj: any) => {
                    acc[subj.subject_id] = subj.status === "COMPLETED" ? "COMPLETE" : subj.status;
                    return acc;
                }, {});
                setEditedStatus(newEditedStatus);
                const uniqueSubjects: string[] = Array.from(
                    new Set(
                        adviserData.students.flatMap((s: any) =>
                            s.attendance.map((a: any) => a.subject_name)
                        )
                    )
                );
                const subjectMap: Record<string, string> = adviserData.students
                    .flatMap((s: any) => s.attendance)
                    .reduce((acc: Record<string, string>, curr: any) => {
                        if (!acc[curr.subject_name]) {
                            acc[curr.subject_name] = curr.subject_id;
                        }
                        return acc;
                    }, {});
                setSubjectMap(subjectMap);
                setSubjects(uniqueSubjects);
            } else {
                setError("No students found for this adviser.");
            }
        } catch (err: any) {
            setError(err.message || "Error fetching students");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (grades: any, shssf2: any) => {
        setLoading(true);
        setError(null);
        const toastId = showToast("Updating student data...", "loading");
        const response = await RequestHandler.fetchData("POST", "adviser/update", {
            adviser_id: user?.id, grades, status: editedStatus, shssf2, school_year: currentSY,
            attendance: editedAttendance,
        });
        setLoading(false);
        removeToast(toastId);
        if (response.success) {
            showToast("Updated successfully.", "success");
            await fetchStudentsByAdviser();
        } else {
            setError(response.message || "Failed to update student data.");
            showToast(response.message || "Failed to update student data.", "error");
        }
    }

    useEffect(() => {
        fetchStudentsByAdviser();
    }, [currentSY]);
    const filteredStudents = useMemo(() => students, [students]);

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen p-4 bg-gray-50 text-gray-800 space-y-6 lg:space-y-0 lg:space-x-6 flex-1 overflow-hidden">
            <motion.div
                className="lg:w-4/6 space-y-6 overflow-y-auto pr-2 h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50 z-50 pb-2 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Adviser’s Students</h1>
                        <span className="text-sm text-gray-500">
                            School Year: {currentSY} | Adviser: {adviserName || "Loading..."}
                        </span>
                    </div>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm">Loading students...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-red-500">
                        <p className="font-medium mb-2">⚠️ {error}</p>
                        <button
                            onClick={fetchStudentsByAdviser}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <StudentTable
                        title="STUDENTS BY ADVISER"
                        data={filteredStudents.map((s) => ({
                            id: s.id,
                            grade_level: s.grade_level,
                            school_year: currentSY,
                            account: {
                                name: s.name,
                                age: s.age,
                                sex: s.sex,
                            },
                            section: { section_name: "N/A" },
                            adviser_name: adviserName,
                            attendance: {
                                subjectAttendances: s.attendance.map((a: any) => ({
                                    subject: { name: a.subject_name },
                                    ...a.months,
                                })),
                            },
                            grades: s.grades,
                        }))}
                        originalData={originalStudents.map((s) => ({
                            id: s.id,
                            grade_level: s.grade_level,
                            school_year: currentSY,
                            account: {
                                name: s.name,
                                age: s.age,
                                sex: s.sex,
                            },
                            section: { section_name: "N/A" },
                            adviser_name: adviserName,
                            attendance: {
                                subjectAttendances: s.attendance.map((a: any) => ({
                                    subject: { name: a.subject_name },
                                    ...a.months,
                                })),
                            },
                            grades: s.grades,
                        }))}
                        shssf2={shssf2}
                        delay={0.1}
                        selectedSubject={selectedSubject}
                        months={months}
                        editedStatus={editedStatus}
                        setEditedStatus={setEditedStatus}
                        subjectMap={subjectMap}
                        handleSave={handleSave}
                        onMonthClick={handleMonthClick}
                    />
                )}
            </motion.div>

            <motion.div
                className="lg:w-2/6 bg-white shadow border p-5 rounded-lg space-y-6 overflow-y-auto"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
                <div className="text-gray-700 font-semibold text-lg">Filters</div>

                <div className="flex flex-col mt-4">
                    <label className="text-sm text-gray-600 mb-1">Subject</label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-3 py-1 rounded-md border border-gray-300 text-gray-800"
                    >
                        <option value="ALL">All Subjects</option>
                        {subjects.map((subj) => (
                            <option key={subj} value={subj}>
                                {subj}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedStudent && selectedMonth && selectedSubject !== "ALL" && (
                    <AttendanceEditor
                        student={selectedStudent}
                        month={selectedMonth}
                        subject={selectedSubject}
                        getDaysInMonth={getDaysInMonth}
                        onAttendanceChange={handleAttendanceChange}
                    />
                )}
            </motion.div>
        </div>
    );
}
