import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import StudentTable from "../components/students/studentstable";
import { useEffect, useMemo, useRef, useState } from "react";
import RequestHandler from "../lib/utilities/RequestHandler";
import { Month, Student } from "../lib/type";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useSY } from "../layout/syprovider";

export default function Students() {
    const { currentSY } = useSY();
    const months: Month[] = [
        "june", "july", "august", "september",
        "october", "november", "december", "january", "february", "march", "april", "may"
    ];

    const [viewType, setViewType] = useState<string>("ALL");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedSection, setSelectedSection] = useState("ALL");
    const [selectedSubject, setSelectedSubject] = useState("ALL");
    const [selectedAdviser, setSelectedAdviser] = useState("ALL");
    const [sections, setSections] = useState<string[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [advisers, setAdvisers] = useState<string[]>([]);

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<Month | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const studentsCache = useRef<Map<string, Student[]>>(new Map());
    const studentsCacheTotal = useRef<Map<string, number>>(new Map());

    const handleMonthClick = (student: Student, month: Month) => {
        setSelectedStudent(student);
        setSelectedMonth(month);
    };

    const getDaysInMonth = (month: Month) => {
        const monthIndex = months.indexOf(month);
        const year = 2024;
        return new Date(year, monthIndex + 1, 0).getDate();
    };

    const fetchStudents = async (page: number) => {
        const cacheKey = `${currentSY}-${viewType}-${selectedSection}-${selectedSubject}-page${page}-${selectedAdviser}`;
        const cacheKeyTotal = `${currentSY}-${viewType}-${selectedSection}-${selectedSubject}-page${page}-${selectedAdviser}-total`;
        if (studentsCache.current.has(cacheKey)) {
            const cachedStudents = studentsCache.current.get(cacheKey)! || [];
            setStudents(cachedStudents);

            setSections(Array.from(new Set(cachedStudents.flatMap((s: any) => s.section?.section_name ? [s.section.section_name] : []))));
            setSubjects(Array.from(new Set(cachedStudents.flatMap((s: any) => s.attendance?.subjectAttendances.map((sa: any) => sa.subject.name)))));
            setAdvisers(Array.from(new Set(cachedStudents.flatMap((s: any) => s.adviser_name))));

            setTotalPages(Math.ceil((studentsCacheTotal.current.get(cacheKeyTotal) ?? 1) / 30));
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await RequestHandler.fetchData(
                "GET",
                `student/get-all?currentSchoolYear=${currentSY}&page=${page}&limit=30&viewType=${viewType}&section=${selectedSection}&subject=${selectedSubject}&adviser=${selectedAdviser}`
            );
            if (response.success) {
                const fetchedStudents = response.students || [];
                setStudents(fetchedStudents);

                setSections(Array.from(new Set(fetchedStudents.flatMap((s: any) => s.section?.section_name ? [s.section.section_name] : []))));
                setSubjects(Array.from(new Set(fetchedStudents.flatMap((s: any) => s.attendance?.subjectAttendances.map((sa: any) => sa.subject.name)))));
                setAdvisers(Array.from(new Set(fetchedStudents.flatMap((s: any) => s.adviser_name))));

                studentsCache.current.set(cacheKey, fetchedStudents);
                studentsCacheTotal.current.set(cacheKeyTotal, response.total);
                setTotalPages(Math.ceil((response.total ?? 1) / 30));
            } else {
                setError(response.message || "Failed to load students");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong while fetching students");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents(currentPage);
    }, [currentPage, viewType, selectedSection, selectedSubject, currentSY, selectedAdviser]);

    const gradeLevels = ["Grade 11", "Grade 12"];
    const filteredStudents = useMemo(() => {
        return students;
    }, [students]);

    const getMonthYear = (month: Month, schoolYear: string) => {
        const [startYearStr, endYearStr] = schoolYear.split("-");
        const startYear = parseInt(startYearStr, 10);
        const endYear = parseInt(endYearStr, 10);

        const upperMonth = month.toUpperCase();
        if (["JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"].includes(upperMonth)) {
            return startYear;
        } else {
            return endYear;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen p-4 bg-gray-50 text-gray-800 space-y-6 lg:space-y-0 lg:space-x-6 flex-1 overflow-hidden">

            <motion.div className="lg:w-4/6 space-y-6 overflow-y-auto pr-2 h-full"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>

                <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50 z-50 pb-2 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">All Students</h1>
                        <span className="text-sm text-gray-500">School Year: {currentSY}</span>
                    </div>

                    <div className="flex items-center space-x-4 mr-3">
                        <div className="relative">
                            <button onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition">
                                {viewType} <ChevronDown />
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-20">
                                    {["ALL", ...gradeLevels].map(level => (
                                        <button key={level} onClick={() => { setViewType(level); setDropdownOpen(false); }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100">{level}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {loading && <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-sm">Loading students...</p>
                </div>}

                {error && !loading && <div className="flex flex-col items-center justify-center py-20 text-red-500">
                    <p className="font-medium mb-2">⚠️ {error}</p>
                    <button onClick={() => window.location.reload()} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Retry</button>
                </div>}

                {!loading && !error && <>
                    <StudentTable
                        title={`${viewType} STUDENTS`}
                        data={filteredStudents}
                        delay={0.1}
                        selectedSection={selectedSection}
                        selectedSubject={selectedSubject}
                        months={months}
                        onMonthClick={handleMonthClick}
                    />

                    <div className="flex justify-center space-x-3 mt-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="px-3 py-1">{currentPage} / {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>}
            </motion.div>

            <motion.div
                className="lg:w-2/6 bg-white shadow border p-5 rounded-lg space-y-6 overflow-y-auto"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
                <div className="text-gray-700 font-semibold text-lg">Filters</div>

                <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">Section</label>
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="px-3 py-1 rounded-md border border-gray-300 text-gray-800"
                    >
                        <option value="ALL">All Sections</option>
                        {sections.map(sec => (
                            <option key={sec} value={sec}>{sec}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col mt-4">
                    <label className="text-sm text-gray-600 mb-1">Subject</label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-3 py-1 rounded-md border border-gray-300 text-gray-800"
                    >
                        <option value="ALL">All Subjects</option>
                        {subjects.map(subj => (
                            <option key={subj} value={subj}>{subj}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col mt-4">
                    <label className="text-sm text-gray-600 mb-1">Adviser</label>
                    <select
                        value={selectedAdviser}
                        onChange={(e) => setSelectedAdviser(e.target.value)}
                        className="px-3 py-1 rounded-md border border-gray-300 text-gray-800"
                    >
                        <option value="ALL">All Adviser</option>
                        {advisers.map(subj => (
                            <option key={subj} value={subj}>{subj}</option>
                        ))}
                    </select>
                </div>

                {selectedStudent && selectedMonth && selectedSubject !== "ALL" && (
                    <Card className="mt-6 shadow-md border border-gray-200 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-gray-800 text-lg">
                                {selectedStudent.account.name} —{" "}
                                {selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)}{" "}
                                ({selectedSubject})
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 mb-2">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                                    <div key={d} className="p-1">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center">
                                {(() => {
                                    const year = getMonthYear(selectedMonth, currentSY); 

                                    const jsMonthIndex = (() => {
                                        const schoolMonth = selectedMonth.toLowerCase();
                                        const monthMap: Record<string, number> = {
                                            june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
                                            january: 0, february: 1, march: 2, april: 3, may: 4
                                        };
                                        return monthMap[schoolMonth];
                                    })();
                                    const firstDay = new Date(year, jsMonthIndex, 1);
                                    const firstDayOffset = firstDay.getDay();
                                    const daysInMonth = getDaysInMonth(selectedMonth);

                                    const blanks = Array.from({ length: firstDayOffset }, (_, i) => (
                                        <div key={`blank-${i}`} className="p-2" />
                                    ));

                                    const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
                                        const day = i + 1;
                                        const dayStr = day.toString();
                                        const subjectAttendance = selectedStudent.attendance.subjectAttendances
                                            ?.find((subj) => subj.subject.name === selectedSubject);

                                        const attended = subjectAttendance?.[selectedMonth]?.includes(dayStr);

                                        const date = new Date(year, jsMonthIndex, day);
                                        const dayOfWeek = date.getDay();
                                        const isSunday = dayOfWeek === 0;
                                        const isSaturday = dayOfWeek === 6;

                                        const baseClasses =
                                            "p-2 rounded-md border font-medium transition-all cursor-pointer select-none hover:scale-[1.05]";

                                        let cellClass = "";
                                        if (isSunday) {
                                            cellClass = "bg-red-100 text-red-400 border-red-200 cursor-not-allowed";
                                        } else if (isSaturday) {
                                            cellClass = "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed";
                                        } else if (attended) {
                                            cellClass = "bg-green-500 text-white border-green-600";
                                        } else {
                                            cellClass = "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200";
                                        }

                                        return (
                                            <div key={day} className={`${baseClasses} ${cellClass}`}>
                                                {day}
                                            </div>
                                        );
                                    });

                                    return [...blanks, ...dayCells];
                                })()}
                            </div>
                        </CardContent>

                    </Card>
                )}

            </motion.div>
        </div>
    );
}