import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Month } from "../../lib/type";
import { useSY } from "../../layout/syprovider";

interface AttendanceEditorProps {
    student: any;
    month: Month;
    subject: string;
    getDaysInMonth: (month: Month) => number;
    onAttendanceChange?: (studentId: number, month: Month, days: string[]) => void;
}

export function AttendanceEditor({
    student,
    month,
    subject,
    getDaysInMonth,
    onAttendanceChange,
}: AttendanceEditorProps) {
    const { currentSY } = useSY();
    const subj = student.attendance.subjectAttendances.find(
        (a: any) => a.subject.name === subject
    );
    if (!subj) return null;

    console.log(student);

    const monthKey = month.toLowerCase();
    const initialDays: string[] = subj[monthKey]?.map(String) || [];

    const [editedDays, setEditedDays] = useState<string[]>(initialDays);
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setEditedDays(subj[monthKey]?.map(String) || []);
        setIsDirty(false);
    }, [subj, monthKey]);

    const handleDayClick = (day: string, isWeekend: boolean) => {
        if (isWeekend) return;
        setEditedDays(prev => {
            const updated = prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day];
            setIsDirty(true);
            return updated;
        });
    };

    const handleSave = async () => {
        if (!onAttendanceChange) return;
        setSaving(true);
        try {
            await onAttendanceChange(student.id, monthKey as Month, editedDays);
            setIsDirty(false);
        } catch (err: any) {
            alert("Error saving attendance: " + err.message);
        } finally {
            setSaving(false);
        }
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


    return (
        <Card className="mt-6 shadow-md border border-gray-200 rounded-2xl">
            <CardHeader>
                <CardTitle className="text-gray-800 text-lg">
                    {month.charAt(0).toUpperCase() + month.slice(1)} ({subject})
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                        <div key={d} className="p-1">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                    {(() => {
                        const year = getMonthYear(month, currentSY); 
                        const jsMonthIndex = (() => {
                            const schoolMonth = month.toLowerCase();
                            const monthMap: Record<string, number> = {
                                june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
                                january: 0, february: 1, march: 2, april: 3, may: 4
                            };
                            return monthMap[schoolMonth];
                        })();

                        const firstDayOfMonth = new Date(year, jsMonthIndex, 1);
                        const firstDayOffset = firstDayOfMonth.getDay();
                        const daysInMonth = getDaysInMonth(month);

                        const blanks = Array.from({ length: firstDayOffset }, (_, i) => (
                            <div key={`blank-${i}`} className="p-2" />
                        ));

                        const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const dayStr = day.toString();
                            const date = new Date(year, jsMonthIndex, day);
                            const dayOfWeek = date.getDay();
                            const isSunday = dayOfWeek === 0;
                            const isSaturday = dayOfWeek === 6;
                            const attended = editedDays.includes(dayStr);

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
                                <div
                                    key={day}
                                    onClick={() => handleDayClick(dayStr, isSunday || isSaturday)}
                                    className={`${baseClasses} ${cellClass}`}
                                >
                                    {day}
                                </div>
                            );
                        });

                        return [...blanks, ...dayCells];
                    })()}
                </div>

                {isDirty && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`px-4 py-2 rounded-md transition text-white ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
