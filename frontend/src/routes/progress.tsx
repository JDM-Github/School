import { useState, useMemo, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import StudentGradeTable from "../components/progress/studentgradetable";
import PassedStudentPanel from "../components/progress/passedstudentpanel";
import { useSY } from "../layout/syprovider";
import RequestHandler from "../lib/utilities/RequestHandler";
import { confirmToast, removeToast, showToast } from "../components/toast";

interface StudentGrade {
    id: number;
    name: string;
    grade_level: string;
    section: string;
    subjects: {
        subject: string;
        grades: {
            first: number;
            second: number;
            third: number;
            fourth: number;
        };
        final: number;
    }[];
    passed: boolean;
    status: string;
    enrolledNext: boolean;
    isNew: boolean;
    isGraduated: boolean;
}


export default function SHSStudentProgress() {
    const { currentSY } = useSY();
    const [viewGrade, setViewGrade] = useState<"Grade 11" | "Grade 12">("Grade 11");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [students, setStudents] = useState<StudentGrade[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];

        const toastId = showToast("Uploading new enrollees...", "loading");
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);

        const rows = rawRows.map((row) => ({
            firstName: row["First Name"] || "",
            middleName: row["Middle Name"] || "",
            lastName: row["Last Name"] || "",
            suffix: row["Suffix"] || "",
            age: Number(row["Age"] || 16),
            sex: row["Sex"] || "Male",
            email: row["Email"] || "",
            gradeLevel: row["Grade Level"] || "",
        }))
            .filter(r => r.gradeLevel === "Grade 11" || r.gradeLevel === "Grade 12");

        const response = await RequestHandler.fetchData("POST", "student/upload-enrollees", { rows, currentSY });
        removeToast(toastId);
        if (response.success) {
            showToast("Enrollees uploaded successfully.", "success");
            fetchData();
        } else {
            showToast(response.message || "Failed to upload enrollees.", "error");
        }
        e.target.value = "";
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await RequestHandler.fetchData(
                "GET",
                `student-grade/get-all?schoolYear=${currentSY}`
            );
            if (response.success && Array.isArray(response.students)) {
                setStudents(response.students);
            } else {
                setError(response.message || "Failed to fetch student progress data");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong while fetching data");
        } finally {
            setLoading(false);
        }
    };

    const handleSetEnrolled = (id: number, name: string) => {
        confirmToast(
            `Are you sure you want to set ${name} as enrolled?`,
            () => setToEnrolled(id),
            () => showToast("Set to enroll cancelled.", "info")
        );
    };

    const setToEnrolled = async (id: any) => {
        setLoading(true);
        setError(null);
        const toastId = showToast("Updating student data...", "loading");
        const response = await RequestHandler.fetchData("POST", "student-grade/update-enrolled", {
            student_id: id
        });

        setLoading(false);
        removeToast(toastId);
        if (response.success) {
            showToast("Updated successfully.", "success");
            await fetchData();
        } else {
            setError(response.message || "Failed to update student data.");
            showToast(response.message || "Failed to update student data.", "error");
        }
    }

    useEffect(() => {
        fetchData();
    }, [currentSY]);

    const filteredStudents = useMemo(
        () => students.filter((s) => s.grade_level === viewGrade),
        [students, viewGrade]
    );

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen p-4 bg-gray-50 text-gray-800 space-y-6 lg:space-y-0 lg:space-x-6 flex-1 overflow-hidden">
            <motion.div
                className="lg:w-3/6 space-y-6 overflow-y-auto pr-2 h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50 z-50 pb-2 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Student Grade Progress</h1>
                        <span className="text-sm text-gray-500">School Year: {currentSY}</span>
                    </div>

                    <div className="flex items-center space-x-4 mr-3 relative">
                        <details className="relative">
                            <summary className="flex items-center bg-gray-200 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-300 transition">
                                Actions <ChevronDown size={16} className="ml-2" />
                            </summary>

                            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-20 p-2 flex flex-col space-y-2">
                                <AddEnrolleeDialog onSuccess={fetchData} />
                                <label className="w-full text-left px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-400 transition cursor-pointer">
                                    Upload New Enrollees
                                    <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleUpload} />
                                </label>

                                <DownloadExcelButton students={students} />

                            </div>
                        </details>

                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center justify-between bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition w-40"
                            >
                                {viewGrade} <ChevronDown size={16} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-20">
                                    {["Grade 11", "Grade 12"].map((grade) => (
                                        <button
                                            key={grade}
                                            onClick={() => {
                                                setViewGrade(grade as "Grade 11" | "Grade 12");
                                                setDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                <StudentGradeTable
                    title={`${viewGrade} Students`}
                    gradeLevel={viewGrade}
                    data={filteredStudents}
                    delay={0.3}
                />
            </motion.div>

            <PassedStudentPanel
                students={students}
                setToEnrolled={handleSetEnrolled}
            />
        </div>
    );
}

function AddEnrolleeDialog({ onSuccess }: { onSuccess: () => void }) {
    const { currentSY } = useSY();
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [suffix, setSuffix] = useState("");
    const [age, setAge] = useState(16);
    const [sex, setSex] = useState<"Male" | "Female" | "Other">("Male");
    const [email, setEmail] = useState("");
    const [gradeLevel, setGradeLevel] = useState<"Grade 11" | "Grade 12">("Grade 11");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const closeDialogRef = useRef<HTMLButtonElement>(null);

    const resetForm = () => {
        setFirstName("");
        setMiddleName("");
        setLastName("");
        setSuffix("");
        setAge(16);
        setSex("Male");
        setEmail("");
        setGradeLevel("Grade 11");
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const toastId = showToast("Creating new enrollee...", "loading");
        const response = await RequestHandler.fetchData("POST", "student/new-enrollee", {
            firstName,
            middleName,
            lastName,
            suffix,
            age,
            sex,
            email,
            gradeLevel,
            currentSY,
        });

        setLoading(false);
        removeToast(toastId);

        if (response.success) {
            showToast("New enrollee added successfully.", "success");
            onSuccess();
            resetForm();
            closeDialogRef.current?.click();
        } else {
            setError(response.message || "Failed to add enrollee.");
            showToast(response.message || "Failed to add enrollee.", "error");
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="w-full text-center px-4 py-2 border bg-blue-400 hover:bg-blue-300 text-sm text-white">
                    ADD NEW ENROLLEE
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg z-50">
                    <Dialog.Title className="text-lg font-semibold mb-3">Add New Enrollee</Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="w-full border rounded-md px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Middle Name"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                required
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="w-full border rounded-md px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Suffix"
                                value={suffix}
                                onChange={(e) => setSuffix(e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>

                        <input
                            type="number"
                            placeholder="Age"
                            value={age}
                            onChange={(e) => setAge(Number(e.target.value))}
                            min={1}
                            className="w-full border rounded-md px-3 py-2"
                        />

                        <select
                            value={sex}
                            onChange={(e) => setSex(e.target.value as "Male" | "Female" | "Other")}
                            className="w-full border rounded-md px-3 py-2"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        />

                        <select
                            value={gradeLevel}
                            onChange={(e) =>
                                setGradeLevel(e.target.value as "Grade 11" | "Grade 12")
                            }
                            className="w-full border rounded-md px-3 py-2"
                        >
                            <option value="Grade 11">Grade 11</option>
                            <option value="Grade 12">Grade 12</option>
                        </select>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-400 text-white w-full py-2 rounded-md hover:bg-blue-300 transition"
                        >
                            {loading ? "Creating..." : "Add Enrollee"}
                        </button>
                    </form>

                    <Dialog.Close asChild>
                        <button
                            ref={closeDialogRef}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function DownloadExcelButton({ students }: { students: StudentGrade[] }) {
    const handleDownload = () => {
        const data: Record<string, any>[] = [];

        students.forEach((student) => {
            student.subjects.forEach((subj) => {
                data.push({
                    "Student Name": student.name,
                    "Grade Level": student.grade_level,
                    Section: student.section,
                    Subject: subj.subject,
                    "1st Qtr": subj.grades.first,
                    "2nd Qtr": subj.grades.second,
                    "3rd Qtr": subj.grades.third,
                    "4th Qtr": subj.grades.fourth,
                    Final: subj.final,
                    Status: student.status,
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Student Grades");

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([wbout], { type: "application/octet-stream" }), "student_grades.xlsx");
    };

    return (
        <button
            onClick={handleDownload}
            className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-md transition"
        >
            Download Student Grade Excel
        </button>
    );
}