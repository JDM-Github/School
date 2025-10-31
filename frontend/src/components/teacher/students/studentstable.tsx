import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import * as Dialog from "@radix-ui/react-dialog";
import { Month, Student } from "../../../lib/type";
import { Card } from "../../ui/card";
import { useSY } from "../../../layout/syprovider";
import { removeToast, showToast } from "../../toast";

interface StudentTableProps {
    title: string;
    data: any[];
    originalData: any[];
    delay?: number;
    selectedSubject: string;
    months: Month[];
    shssf2: any[];
    subjectMap: any;
    editedStatus: any;
    setEditedStatus: any;
    handleSave: (grades: any, shssf2: any) => Promise<void>;
    onMonthClick?: (student: Student, month: Month, selectedSubject: string, localShsSf2: any) => void;
    handleAttendanceChange: (studentId: number, month: Month, days: string[]) => void;
}

export default function StudentTable({
    title,
    data,
    originalData,
    delay = 0,
    selectedSubject,
    subjectMap,
    handleSave,
    onMonthClick,
    months,
    shssf2,
    editedStatus,
    setEditedStatus,
    handleAttendanceChange
}: StudentTableProps) {
    const { currentSY } = useSY();
    const [localShsSf2, setLocalShsSf2] = useState<any>(shssf2 || {});
    const [editedGrades, setEditedGrades] = useState<any>({});

    useEffect(() => {
        if (shssf2) setLocalShsSf2(shssf2);
    }, [shssf2]);

    useEffect(() => {
        if (subjectMap && Object.keys(subjectMap).length > 0) {
            const initialGrades = Object.values(subjectMap).reduce((acc: any, subjectId: any) => {
                acc[subjectId] = {};
                return acc;
            }, {});
            setEditedGrades(initialGrades);
        }
    }, [subjectMap]);


    const [searchTerm, setSearchTerm] = useState("");
    const [isDirty, setIsDirty] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<{ studentId: number; field: string; value: string } | null>(null);
    const [tempValue, setTempValue] = useState("");


    const gradesFileRef = useRef<HTMLInputElement | null>(null);
    const attendanceFileRef = useRef<HTMLInputElement | null>(null);

    const handleUploadGrades = async (e?: React.ChangeEvent<HTMLInputElement>) => {
        const file = e?.target?.files?.[0];
        if (!file) return;

        const toastId = showToast("Processing uploaded grades...", "loading");
        try {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const new_data = new Uint8Array(evt.target?.result as ArrayBuffer);
                const workbook = XLSX.read(new_data, { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet);

                let updates = 0;

                for (const row of rows as any[]) {
                    const studentName = row["student_name"]?.trim()?.toLowerCase();
                    if (!studentName) continue;

                    const student = data.find(
                        (s: any) => s.account.name.toLowerCase() === studentName
                    );
                    if (!student) continue;

                    const studentId = student.id;

                    const first_quarter = row["first_quarter"] ?? "";
                    const second_quarter = row["second_quarter"] ?? "";
                    const third_quarter = row["third_quarter"] ?? "";
                    const final_quarter = row["final_quarter"] ?? "";

                    handleGradeChange(studentId, "first_quarter", first_quarter);
                    handleGradeChange(studentId, "second_quarter", second_quarter);
                    handleGradeChange(studentId, "third_quarter", third_quarter);
                    handleGradeChange(studentId, "final_quarter", final_quarter);

                    updates++;
                }

                showToast(`${updates} student grades uploaded successfully.`, "success");
                e.target.value = "";
            };

            reader.readAsArrayBuffer(file);
        } catch (err: any) {
            showToast("Error uploading grades.", "error");
            console.error(err);
        } finally {
            removeToast(toastId);
        }
    };

    const handleUploadAttendance = async (e?: React.ChangeEvent<HTMLInputElement>) => {
        const file = e?.target?.files?.[0];
        if (!file) return;

        const toastId = showToast("Processing uploaded attendance...", "loading");
        try {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const new_data = new Uint8Array(evt.target?.result as ArrayBuffer);
                const workbook = XLSX.read(new_data, { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet);

                let updates = 0;

                for (const row of rows as any[]) {
                    const studentName = row["name"]?.trim()?.toLowerCase();
                    if (!studentName) continue;

                    const student = data.find(
                        (s: any) => s.account.name.toLowerCase() === studentName
                    );
                    if (!student) continue;

                    const studentId = student.id;

                    const months: Month[] = [
                        "january", "february", "march", "april", "may",
                        "june", "july", "august", "september", "october",
                        "november", "december"
                    ];

                    for (const month of months) {
                        const rawDays = row[month];
                        if (!rawDays) continue;
                        const days = String(rawDays)
                            .split(",")
                            .map((d) => d.trim())
                            .filter((d) => d.length > 0);

                        handleAttendanceChange(studentId, month, days);
                    }

                    updates++;
                }

                showToast(`${updates} student attendance records uploaded successfully.`, "success");
                e.target.value = "";
            };

            reader.readAsArrayBuffer(file);
        } catch (err: any) {
            showToast("Error uploading attendance.", "error");
            console.error(err);
        } finally {
            removeToast(toastId);
        }
    };


    const handleGradeChange = (studentId: number, field: string, value: string) => {
        if (selectedSubject === "ALL") return;

        const subjectId = subjectMap[selectedSubject];
        setEditedGrades((prev: any) => ({
            ...prev,
            [subjectId]: {
                ...prev[subjectId],
                [studentId]: {
                    ...prev[subjectId]?.[studentId],
                    [field]: value,
                },
            },
        }));

        setIsDirty(true);
    };


    const handleToggleStatus = () => {
        const subjectId = subjectMap[selectedSubject];
        const newStatus =
            editedStatus[subjectId] === "COMPLETE" ? "NO INPUT" : "COMPLETE";

        setEditedStatus((prev: any) => ({
            ...prev,
            [subjectId]: newStatus,
        }));
        setIsDirty(true);
    };

    const localHandleSave = async () => {
        console.log("Saving changes:", {
            grades: editedGrades,
            shssf2: localShsSf2
        });
        await handleSave(editedGrades, localShsSf2);
        setIsDirty(false);
    };

    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return data
            .filter(
                (s) =>
                    s.account.name.toLowerCase().includes(term) ||
                    s.section.section_name.toLowerCase().includes(term)
            )
            .filter((student) => {
                const subjectMatch =
                    selectedSubject === "ALL" ||
                    student.attendance.subjectAttendances.some(
                        (subj: { subject: { name: string } }) =>
                            subj.subject.name === selectedSubject
                    );
                return subjectMatch;
            });
    }, [data, searchTerm, selectedSubject]);

    const openEditModal = (studentId: number, field: string, value: string) => {
        if (editedStatus[subjectMap[selectedSubject]] === "COMPLETE") {
            showToast(`Cannot edit grades. ${selectedSubject} currently marked as completed.`, "error");
            return;
        }
        setModalData({ studentId, field, value });
        setTempValue(value);
        setModalOpen(true);
    };

    const confirmModalChange = () => {
        if (modalData) handleGradeChange(modalData.studentId, modalData.field, tempValue);
        setModalOpen(false);
    };

    const getIsEdited = (student: any, month: Month) => {
        const orig = originalData.find((o) => o.id === student.id);
        if (!orig) return false;

        const currSubj = student.attendance.subjectAttendances.find((s: any) => s.subject.name === selectedSubject);
        const origSubj = orig.attendance.subjectAttendances.find((s: any) => s.subject.name === selectedSubject);

        const currDays = currSubj?.[month] || [];
        const origDays = origSubj?.[month] || [];

        if (currDays.length !== origDays.length) return true;
        return currDays.some((d: string) => !origDays.includes(d));
    };

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

    useEffect(() => {
        const attendanceChanged = data.some((student) =>
            months.some((month) => selectedSubject !== "ALL" && getIsEdited(student, month))
        );
        if (attendanceChanged) setIsDirty(true);
    }, [data, originalData, selectedSubject, months]);

    return (
        <Card className="bg-white border shadow-sm rounded-lg overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay }}
            >
                <div className="bg-gray-600 text-white text-lg font-semibold px-4 py-2">
                    <div className="flex justify-between items-center">
                        <span>{title}</span>
                        <span>
                            FILTER:{" "}
                            {selectedSubject === "ALL" ? "ALL SUBJECTS" : selectedSubject}
                        </span>
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                        <input
                            type="text"
                            placeholder="Search by name or section..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-50 placeholder-gray-50 w-72"
                        />

                        {selectedSubject !== "ALL" &&
                            <>
                                <button
                                    onClick={() => gradesFileRef.current?.click()}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold"
                                >
                                    Upload Grades
                                </button>
                                <input
                                    ref={gradesFileRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleUploadGrades}
                                    className="hidden"
                                />

                                <button
                                    onClick={() => attendanceFileRef.current?.click()}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs font-semibold"
                                >
                                    Upload Attendance
                                </button>
                                <input
                                    ref={attendanceFileRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleUploadAttendance}
                                    className="hidden"
                                />
                            </>}
                        {selectedSubject !== "ALL" && (
                            <button
                                onClick={() =>
                                    handleToggleStatus()
                                }
                                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${(editedStatus[subjectMap[selectedSubject]] || "NO INPUT") === "COMPLETE"
                                        ? "bg-green-500 text-white hover:bg-green-600"
                                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                    }`}
                            >
                                {editedStatus[subjectMap[selectedSubject]] || "NO INPUT"}
                            </button>
                        )}
                        {isDirty && (
                            <div className="flex justify-end">
                                <button
                                    onClick={localHandleSave}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-md text-sm"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative max-h-[45vh] overflow-y-auto">
                    <table className="min-w-max text-xs md:text-sm border-collapse w-full">
                        <thead className="bg-blue-100 text-gray-700 font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 text-center">ID</th>
                                <th className="px-4 py-2 text-center">GRADE LEVEL</th>
                                <th className="px-4 py-2 text-center">SCHOOL YEAR</th>
                                <th className="px-4 py-2 text-center">NAME</th>
                                <th className="px-4 py-2 text-center">AGE</th>
                                <th className="px-4 py-2 text-center">SEX</th>
                                {selectedSubject !== "ALL" && (
                                    <>
                                        <th className="px-4 py-2 text-center">1ST</th>
                                        <th className="px-4 py-2 text-center">2ND</th>
                                        <th className="px-4 py-2 text-center">3RD</th>
                                        <th className="px-4 py-2 text-center">FINAL</th>
                                        {/* <th className="px-4 py-2 text-center">STATUS</th> */}
                                    </>
                                )}
                                {months.map((month) => (
                                    <th key={month} className="px-4 py-2 text-center">
                                        {month.slice(0, 3).toUpperCase()}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map((student) => {
                                const monthTotals = months.map((month) => {
                                    const subjectsToCount =
                                        selectedSubject !== "ALL"
                                            ? student.attendance.subjectAttendances.filter(
                                                (subj: any) => subj.subject.name === selectedSubject
                                            )
                                            : student.attendance.subjectAttendances;

                                    return subjectsToCount.reduce((acc: number, subj: any) => {
                                        const days: string[] = subj[month] || [];
                                        const validDays = days.filter((d) => {
                                            const jsMonthIndex = (() => {
                                                const m = month.toLowerCase();
                                                const map: Record<string, number> = {
                                                    june: 5, july: 6, august: 7, september: 8,
                                                    october: 9, november: 10, december: 11,
                                                    january: 0, february: 1, march: 2, april: 3, may: 4
                                                };
                                                return map[m];
                                            })();
                                            const year = getMonthYear(month, currentSY);
                                            const dayOfWeek = new Date(year, jsMonthIndex, parseInt(d)).getDay();
                                            return dayOfWeek !== 0 && dayOfWeek !== 6;
                                        });

                                        return acc + validDays.length;
                                    }, 0);
                                });

                                const selectedGrade =
                                    selectedSubject !== "ALL" && Array.isArray(student.grades)
                                        ? student.grades.find(
                                            (g: any) => g.subject_name === selectedSubject
                                        )
                                        : null;

                                const grades = selectedGrade || {
                                    first_quarter: "-",
                                    second_quarter: "-",
                                    third_quarter: "-",
                                    final_quarter: "-",
                                };

                                const edited =
                                    selectedSubject !== "ALL"
                                        ? editedGrades?.[subjectMap[selectedSubject]]?.[student.id] || {}
                                        : {};
                                const renderGradeCell = (field: string, value: string) => {
                                    const isEdited = edited[field] !== undefined && edited[field] !== value;
                                    return (
                                        <td
                                            className={`px-4 py-2 text-center cursor-pointer transition-colors hover:bg-gray-50 ${isEdited ? "bg-yellow-100 text-blue-800 font-semibold" : ""
                                                }`}
                                            onDoubleClick={() => openEditModal(student.id, field, value)}
                                        >
                                            {edited[field] ?? value}
                                        </td>
                                    );
                                };

                                // const subjStatus = student.subject_status?.find(
                                //     (s: any) => s.subject_name === selectedSubject
                                // );
                                // const currentStatus =
                                //     editedStatus[student.id]?.[selectedSubject] ||
                                //     subjStatus?.status ||
                                //     "NO INPUT";
                                // const isComplete = currentStatus === "COMPLETE";

                                return (
                                    <tr key={student.id} className="hover:bg-gray-50 text-center">
                                        <td className="px-4 py-2">{student.id}</td>
                                        <td className="px-4 py-2">{student.grade_level}</td>
                                        <td className="px-4 py-2">{student.school_year}</td>
                                        <td className="px-4 py-2">{student.account.name}</td>
                                        <td className="px-4 py-2">{student.account.age}</td>
                                        <td className="px-4 py-2">{student.account.sex}</td>

                                        {selectedSubject !== "ALL" && (
                                            <>
                                                {renderGradeCell("first_quarter", grades.first_quarter)}
                                                {renderGradeCell("second_quarter", grades.second_quarter)}
                                                {renderGradeCell("third_quarter", grades.third_quarter)}
                                                {renderGradeCell("final_quarter", grades.final_quarter)}

                                                {/* <td className="px-4 py-2 text-center">
                                                    <button
                                                        onClick={() =>
                                                            handleToggleStatus(student.id, selectedGrade.subject_id, currentStatus)
                                                        }
                                                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${isComplete
                                                            ? "bg-green-500 text-white hover:bg-green-600"
                                                            : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                                            }`}
                                                    >
                                                        {currentStatus}
                                                    </button>
                                                </td> */}
                                            </>
                                        )}

                                        {months.map((month, idx) => {
                                            const isEdited = selectedSubject !== "ALL" && getIsEdited(student, month);

                                            return (
                                                <td
                                                    key={month}
                                                    className={`px-4 py-2 text-center transition-colors ${isEdited
                                                        ? "bg-yellow-100 text-blue-800 font-semibold"
                                                        : "hover:bg-blue-50"
                                                        } ${selectedSubject !== "ALL" ? "cursor-pointer" : ""
                                                        }`}
                                                    onClick={() => {
                                                        if (selectedSubject !== "ALL" && onMonthClick)
                                                            onMonthClick(student, month, selectedSubject, localShsSf2);
                                                    }}
                                                >
                                                    {monthTotals[idx]}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>

                        <tfoot className="bg-gray-100 border-t sticky bottom-0 z-10 shadow-md">
                            <tr>
                                <td
                                    colSpan={6 + (selectedSubject !== "ALL" ? 4 : 0)}
                                    className="px-4 py-2 font-semibold text-right bg-gray-100"
                                >
                                    SHS SF2 STATUS
                                </td>

                                {months.map((month) => {
                                    const key = `${month.toLowerCase()}_status`;
                                    const currentStatus = localShsSf2?.[key] || "NO INPUT";
                                    const isComplete = currentStatus === "ENCODED";

                                    return (
                                        <td key={month} className="px-4 py-2 text-center bg-gray-100">
                                            <button
                                                onClick={() => {
                                                    setLocalShsSf2((prev: any) => ({
                                                        ...prev,
                                                        [key]: isComplete ? "NO INPUT" : "ENCODED",
                                                    }));
                                                    setIsDirty(true);
                                                }}
                                                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${isComplete
                                                    ? "bg-green-500 text-white hover:bg-green-600"
                                                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                                    }`}
                                            >
                                                {currentStatus}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        </tfoot>
                    </table>
                </div>

            </motion.div>

            <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="bg-black/40 fixed inset-0 z-200" />
                    <Dialog.Content className="fixed top-[50%] z-200 left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-md shadow-lg p-6 w-[300px]">
                        <Dialog.Title className="text-lg font-semibold mb-3">Edit Grade</Dialog.Title>
                        <Dialog.Description className="text-sm text-gray-600 mb-4">
                            Update the grade for {modalData?.field.replace("_", " ")}.
                        </Dialog.Description>

                        <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring focus:ring-blue-200"
                        />

                        <div className="flex justify-end gap-2">
                            <Dialog.Close asChild>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-3 py-2 rounded-md border border-gray-300"
                                >
                                    Cancel
                                </button>
                            </Dialog.Close>
                            <button
                                onClick={confirmModalChange}
                                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </Card>
    );
}
