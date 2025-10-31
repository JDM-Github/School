import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Plus, Trash } from "lucide-react";
import RequestHandler from "../lib/utilities/RequestHandler";
import { useSY } from "../layout/syprovider";
import { confirmToast, removeToast, showToast } from "../components/toast";

type Sex = "Male" | "Female" | "Other";

interface SubjectType {
    id: number;
    name: string;
    category: string;
}

type StudentAccount = {
    id: number;
    name: string;
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    age?: number;
    sex: Sex;
    email?: string;
    password?: string;
    graduated?: boolean;
    gradeLevel: string;
    status?: "active" | "dropout" | "transferred";
    isRepeater?: boolean;
    retained?: boolean;
    currentSection?: string;
    subjects: SubjectType[];
};

type AdviserAccount = {
    id: number;
    name: string;
    firstName?: string;
    lastName?: string;
    age?: number;
    sex?: Sex;
    email?: string;
};

type SectionType = {
    id: number;
    name: string;
    grade: "Grade 11" | "Grade 12";
    adviserId?: number | null;
    studentIds: number[];
    subjects: string[];
};

type Subjects = {
    id: number;
    name: string;
}

type SchoolYearMap = {
    [schoolYear: string]: {
        isGrade11Created: boolean;
        isGrade12Created: boolean;
        isPublished: boolean;
    };
};


type SchoolYear = string[];
export default function SchoolYearBuilder() {
    // SY
    const { currentSY } = useSY();
    const [isYearsFetch, setIsYearsFetch] = useState(false);
    const [currentSchoolyear, setCurrentSchoolyear] = useState<string>(currentSY);
    const [currentLatestSY, setCurrentLatestSY] = useState<string>(currentSY);
    const month = new Date().getMonth();

    const canCreateSY = month >= 1 && month <= 12;
    const [schoolYearMap, setSchoolYearMap] = useState<SchoolYearMap>({});
    const [allSchoolYears, setAllSchoolYears] = useState<SchoolYear>([currentSY]);

    const fetchSchoolYear = async () => {
        setLoading(true);
        setError(null);

        const response = await RequestHandler.fetchData(
            "GET",
            `school-year/get-all`
        );
        if (response.success) {
            let years = response.schoolyears;
            let schoolYearMap = response.schoolyearMap;

            if (years.length > 0) {
                const lastYear = years[years.length - 1];
                if (schoolYearMap[lastYear].isPublished) {
                    const [currentStart, currentEnd] = lastYear.split("-").map(Number);
                    const nextSchoolYear = `${currentStart + 1}-${currentEnd + 1}`;
                    schoolYearMap[nextSchoolYear] = {
                        isGrade11Created: false,
                        isGrade12Created: false,
                        isPublished: false
                    };
                    years = [...years, nextSchoolYear];
                    setCurrentLatestSY(nextSchoolYear);
                } else {
                    setCurrentLatestSY(lastYear);
                }
            }

            setIsDisable(schoolYearMap[currentSchoolyear].isGrade11Created || currentLatestSY !== currentSchoolyear);
            setSchoolYearMap(schoolYearMap);
            setAllSchoolYears(years);
        } else {
            setError(response.message || "Failed to load data");
        }
        setIsYearsFetch(true);
        setLoading(false);
    }

    const [isDisable, setIsDisable] = useState(true);
    const [gradeForSY, setGradeForSY] = useState<"Grade 11" | "Grade 12">("Grade 11");
    const [searchTerm, setSearchTerm] = useState("");
    const [sectionSearch, setSectionSearch] = useState("");
    const [error, setError] = useState<string | null>("");
    const [loading, setLoading] = useState(false);

    const [subjects, setSubjects] = useState<Subjects[]>([]);
    const [students, setStudents] = useState<StudentAccount[]>([]);
    const [advisers, setAdvisers] = useState<AdviserAccount[]>([]);

    const [sections, setSections] = useState<SectionType[]>([]);
    const sectionsPerPage = 3;
    const [sectionPage, setSectionPage] = useState(0);
    const filteredSections = sections.filter((s) =>
        s.name.toLowerCase().includes(sectionSearch.toLowerCase())
    );
    const paginatedSections = filteredSections.slice(
        sectionPage * sectionsPerPage,
        (sectionPage + 1) * sectionsPerPage
    );

    // EDITING SECTIONS
    const [selectedSection, setSelectedSection] = useState("");
    const [sortOption, setSortOption] = useState("name-asc");

    const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
    const [editingSectionName, setEditingSectionName] = useState("");

    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [pickMode, setPickMode] = useState<"students" | "advisers">("students");

    const [groups, setGroups] = useState<any>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

    const resetFunction = () => {
        setSectionPage(0);
        setStudents([]);
        setSections([]);
        setAdvisers([]);
        setSubjects([]);
        setGroups([]);

        setEditingSectionId(null);
        setSelectedSectionId(null);
    }

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        resetFunction();
        const response = await RequestHandler.fetchData(
            "GET",
            `student-account/get-all?gradeForSY=${gradeForSY}&school_year=${currentSchoolyear}`
        );
        if (response.success) {
            const fetchedSections = response.data.sections || [];
            setStudents(response.data.students || []);
            setSections(fetchedSections);
            setAdvisers(response.data.advisers || []);
            setSubjects(response.data.subjects || []);
            setGroups(response.data.groups || []);
            assignSectionColors(fetchedSections);
        } else {
            setError(response.message || "Failed to load data");
        }
        setLoading(false);
    };

    const handleCreateSY = async () => {
        const missingAdvisers = sections.filter(sec => !sec.adviserId);
        if (missingAdvisers.length > 0) {
            showToast("Each section must have an assigned adviser.", "error");
            return;
        }

        const allAssignedStudentIds = sections.flatMap(sec => sec.studentIds);
        const unassignedStudents = students.filter(s => !allAssignedStudentIds.includes(s.id));

        if (unassignedStudents.length > 0) {
            showToast("All students must be assigned to a section before creating the school year.", "error");
            return;
        }

        confirmToast(
            `Are you sure you want to create ${gradeForSY} School Year (${currentSchoolyear})?`,
            () => {
                confirmToast(
                    `⚠️ This action cannot be undone. Proceed with creating ${gradeForSY} School Year?`,
                    async () => {
                        const payload = {
                            currentSchoolyear,
                            grade: gradeForSY,
                            sections,
                        };

                        console.log("CREATE SY PAYLOAD:", payload);
                        setLoading(true);
                        setError(null);

                        const toastId = showToast(`Creating ${gradeForSY} School Year...`, "loading");
                        try {
                            const response = await RequestHandler.fetchData(
                                "POST",
                                `student-account/create-sy-level`,
                                payload
                            );
                            removeToast(toastId);
                            if (response.success) {
                                fetchSchoolYear();
                                fetchAllData();
                                let anotherBool = true;
                                setIsDisable(anotherBool || currentLatestSY !== currentSchoolyear);
                                showToast(`Created School Year for ${gradeForSY}.`, "success");
                            } else {
                                showToast(`Failed to create School Year for ${gradeForSY}.`, "error");
                                setError(response.message || "Failed to create school year");
                            }
                        } catch (e: any) {
                            removeToast(toastId);
                            showToast(`Failed to create School Year for ${gradeForSY}.`, "error");
                            setError(e.message || "Failed to create school year");
                        }
                        setLoading(false);
                    },
                    () => showToast("Creation canceled.", "info")
                );
            },
            () => showToast("Creation canceled.", "info")
        );
    };

    const handlePublishSY = async () => {
        confirmToast(
            `Are you sure you want publish the current school year?`,
            async () => {
                setLoading(true);
                setError(null);

                const toastId = showToast(`Publishing ${gradeForSY} School Year...`, "loading");
                try {
                    const response = await RequestHandler.fetchData(
                        "POST",
                        `student-account/publish-sy-level`,
                        { currentSchoolyear }
                    );
                    removeToast(toastId);
                    if (response.success) {
                        fetchSchoolYear();
                        fetchAllData();
                        let anotherBool = true;
                        setIsDisable(anotherBool || currentLatestSY !== currentSchoolyear);
                        showToast(`Published School Year for ${gradeForSY}.`, "success");
                    } else {
                        showToast(`Failed to publish School Year for ${gradeForSY}.`, "error");
                        setError(response.message || "Failed to create school year");
                    }
                } catch (e: any) {
                    removeToast(toastId);
                    showToast(`Failed to publish School Year for ${gradeForSY}.`, "error");
                    setError(e.message || "Failed to create school year");
                }
                setLoading(false);
            },
            () => showToast("Creation canceled.", "info")
        );
    };


    useEffect(() => {
        fetchAllData();
        if (!isYearsFetch) {
            fetchSchoolYear();
        } else {
            let anotherBool = schoolYearMap[currentSchoolyear].isPublished;
            if (gradeForSY === "Grade 11") {
                anotherBool = schoolYearMap[currentSchoolyear].isGrade11Created;
            } else {
                anotherBool = schoolYearMap[currentSchoolyear].isGrade12Created;
            }
            setIsDisable(anotherBool || currentLatestSY !== currentSchoolyear);
        }
    }, [gradeForSY, currentSchoolyear]);

    const handleStudentClick = (studentId: number) => {
        if (!selectedSectionId)
            return alert("Please select a section on the right first.");

        const alreadyAssigned = sections.some(sec => sec.studentIds.includes(studentId));
        if (alreadyAssigned) {
            showToast("Student is already assigned to a section.", "info");
            return;
        }

        setSections(prev =>
            prev.map(sec => {
                if (sec.id === selectedSectionId) {
                    const already = sec.studentIds.includes(studentId);
                    return {
                        ...sec,
                        studentIds: already
                            ? sec.studentIds.filter(id => id !== studentId)
                            : [...sec.studentIds, studentId],
                    };
                }
                return { ...sec, studentIds: sec.studentIds.filter(id => id !== studentId) };
            })
        );
    };


    const handleAdviserClick = (adviserId: number) => {
        if (!selectedSectionId)
            return alert("Please select a section on the right first.");

        const alreadyAssigned = sections.some(sec => sec.adviserId === adviserId);
        if (alreadyAssigned) {
            showToast("Adviser is already assigned to a section.", "info");
            return;
        }

        setSections(prev =>
            prev.map(sec =>
                sec.id === selectedSectionId
                    ? { ...sec, adviserId: sec.adviserId === adviserId ? null : adviserId }
                    : sec
            )
        );
    };

    const handleAddSection = (grade?: "Grade 11" | "Grade 12") => {
        const newSec: SectionType = { id: Date.now() + Math.floor(Math.random() * 100000), name: `New Section ${sections.length + 1}`, grade: grade || gradeForSY, adviserId: null, studentIds: [], subjects: [] };
        setSections(prev => [...prev, newSec]);
        setSelectedSectionId(newSec.id);
    };
    const handleDeleteSection = (sectionId: number) => {
        const section = sections.find(sec => sec.id === sectionId);
        if (!section) return;

        confirmToast(
            `Are you sure you want to delete section "${section.name}"?`,
            () => {
                setSections(prev => prev.filter(sec => sec.id !== sectionId));
                if (selectedSectionId === sectionId) setSelectedSectionId(null);
                showToast("Section deleted successfully.", "info");
            },
            () => {
                showToast("Delete canceled.", "info");
            }
        );
    };

    const removeStudentFromSection = (sectionId: number, studentId: number) => {
        setSections(prev => prev.map(sec => sec.id === sectionId ? { ...sec, studentIds: sec.studentIds.filter(id => id !== studentId) } : sec));
    };

    const [sectionColors, setSectionColors] = useState<{ [section: string]: string }>({});
    const colorPalette = [
        "#E0F2FE",
        "#DCFCE7",
        "#FEF9C3",
        "#FCE7F3",
        "#FAE8FF",
        "#FFE4E6",
        "#F5F5F5",
        "#EDE9FE",
        "#FFF7ED",
    ];

    const assignSectionColors = (sectionsList: any[]) => {
        if (!sectionsList || sectionsList.length === 0) return;

        const newColors: { [key: string]: string } = {};
        sectionsList.forEach((sec, index) => {
            const color =
                colorPalette[index % colorPalette.length];
            newColors[sec.name] = color;
        });

        setSectionColors(newColors);
    };

    const getSectionColor = (sectionName: string | null) => {
        if (!sectionName) return "white";

        if (sectionColors[sectionName]) return sectionColors[sectionName];
        const newColor =
            colorPalette[Object.keys(sectionColors).length % colorPalette.length];
        setSectionColors((prev) => ({
            ...prev,
            [sectionName]: newColor,
        }));
        return newColor;
    };

    const getStudentSectionName = (studentId: number) => {
        const sec = sections.find(s => s.studentIds.includes(studentId));
        return sec ? sec.name : null;
    };
    const getAdviserSectionName = (adviserId: number) => {
        const sec = sections.find(s => s.adviserId === adviserId);
        return sec ? sec.name : null;
    };

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen p-4 bg-gray-50 text-gray-800 space-y-6 lg:space-y-0 lg:space-x-6 flex-1 overflow-hidden">
            <motion.div
                className="lg:w-2/6 space-y-6 overflow-y-auto pr-2 h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50 z-50 pb-2 shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">School Year Management</h1>
                        <span className="text-sm text-gray-500">Grade 11 & below</span>
                    </div>

                    <div className="flex items-center gap-2 mr-3">
                        <button
                            onClick={() => setPickMode("students")}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${pickMode === "students"
                                ? "bg-blue-600 text-white shadow"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                        >
                            Students
                        </button>
                        <button
                            onClick={() => setPickMode("advisers")}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${pickMode === "advisers"
                                ? "bg-blue-600 text-white shadow"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                        >
                            Advisers
                        </button>
                    </div>
                </div>

                <div className="flex  gap-2 bg-white p-2 rounded-lg shadow-sm border">

                    {/* 🔍 Search */}
                    <input
                        type="text"
                        placeholder={`Search ${pickMode === "students" ? "students" : "advisers"}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 text-sm border rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="px-3 py-2 text-sm border rounded-lg bg-white w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">All Sections</option>
                        {sections.map((sec) => (
                            <option key={sec.id} value={sec.name}>
                                {sec.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="px-3 py-2 text-sm border rounded-lg bg-white w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="age-asc">Age (Youngest)</option>
                        <option value="age-desc">Age (Oldest)</option>
                    </select>
                </div>


                <div className="mt-3 space-y-2">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-sm">Loading...</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white border rounded-lg shadow-sm overflow-hidden"
                        >
                            <div className="bg-gray-400 text-white text-lg font-semibold px-4 py-2 flex justify-between items-center">
                                <span>
                                    {pickMode === "students" ? "ALL STUDENT" : "ALL ADVISER"}
                                </span>
                            </div>

                            <div className="overflow-auto max-h-[50vh] overflow-x-auto">
                                <div className="">
                                    <table className="min-w-full text-xs md:text-sm border-collapse">
                                        <thead className="bg-blue-100 text-gray-700 font-semibold sticky top-0 z-10">
                                            <tr>
                                                {pickMode === "students" ? (
                                                    <>
                                                        <th className="px-4 py-2 text-left whitespace-nowrap">Name</th>
                                                        <th className="px-4 py-2 text-center whitespace-nowrap">Age</th>
                                                        <th className="px-4 py-2 text-center whitespace-nowrap">Sex</th>
                                                        <th className="px-4 py-2 text-center whitespace-nowrap">Grade</th>
                                                        <th className="px-4 py-2 text-center whitespace-nowrap">Assigned Section</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="px-4 py-2 text-left whitespace-nowrap">Name</th>
                                                        <th className="px-4 py-2 text-center whitespace-nowrap">Assigned Section</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>

                                        <tbody key={pickMode} className="divide-y divide-gray-200">
                                            {pickMode === "students"
                                                ? students
                                                    .filter((s) =>
                                                        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .filter((s) => {
                                                        if (!selectedSection) return true;
                                                        const assigned = getStudentSectionName(s.id);
                                                        return assigned === selectedSection;
                                                    })
                                                    .sort((a, b) => {
                                                        const ageA = a.age ?? 0;
                                                        const ageB = b.age ?? 0;

                                                        if (sortOption === "name-asc") {
                                                            return a.lastName.localeCompare(b.lastName);
                                                        } else if (sortOption === "name-desc") {
                                                            return b.lastName.localeCompare(a.lastName);
                                                        } else if (sortOption === "age-asc") {
                                                            return ageA - ageB;
                                                        } else if (sortOption === "age-desc") {
                                                            return ageB - ageA;
                                                        }
                                                        return 0;
                                                    })
                                                    .map((s) => {
                                                        const assigned = getStudentSectionName(s.id);
                                                        const bgColor = getSectionColor(assigned);
                                                        return (
                                                            <tr
                                                                key={s.id}
                                                                onClick={() => !isDisable && handleStudentClick(s.id)}
                                                                className={`cursor-pointer text-center hover:brightness-95 transition-all`}
                                                                style={{
                                                                    backgroundColor: assigned ? bgColor + "88" : "white",
                                                                }}
                                                            >
                                                                <td className="px-4 py-2 text-left font-medium text-gray-800 whitespace-nowrap">
                                                                    {s.lastName}, {s.firstName} {s.middleName} {s.suffix}
                                                                </td>
                                                                <td className="px-4 py-2 whitespace-nowrap">{s.age}</td>
                                                                <td className="px-4 py-2 whitespace-nowrap">{s.sex}</td>
                                                                <td className="px-4 py-2 whitespace-nowrap">{gradeForSY}</td>
                                                                <td className="px-4 py-2 font-semibold text-sm whitespace-nowrap">
                                                                    {assigned ? (
                                                                        <span className="text-green-700">{assigned}</span>
                                                                    ) : (
                                                                        <span className="text-gray-400">Not assigned</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                : advisers
                                                    .filter((s) =>
                                                        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map((a) => {
                                                        const assigned = getAdviserSectionName(a.id);
                                                        return (
                                                            <tr
                                                                key={a.id}
                                                                onClick={() => !isDisable && handleAdviserClick(a.id)}
                                                                className={`cursor-pointer text-center hover:bg-gray-50 transition-all ${assigned ? "bg-green-50 hover:bg-green-100" : "bg-white"
                                                                    }`}
                                                            >
                                                                <td className="px-4 py-2 text-left font-medium text-gray-800 whitespace-nowrap">
                                                                    {a.lastName}, {a.firstName}
                                                                </td>
                                                                <td className="px-4 py-2 font-semibold text-sm whitespace-nowrap">
                                                                    {assigned ? (
                                                                        <span className="text-green-700">{assigned}</span>
                                                                    ) : (
                                                                        <span className="text-gray-400">Not assigned</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </div>
            </motion.div>





            <div className="w-full md:w-2/3 flex flex-col gap-4 overflow-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold">Build School Year</h2>

                        <select
                            value={currentSchoolyear}
                            onChange={(e) => setCurrentSchoolyear(e.target.value)}
                            className="border px-2 py-1 rounded text-sm"
                        >
                            {allSchoolYears.map((sy) => (
                                <option key={sy} value={sy}>
                                    {sy}
                                </option>
                            ))}
                        </select>
                        <select value={gradeForSY} onChange={e => setGradeForSY(e.target.value as any)} className="border px-2 py-1 rounded text-sm">
                            <option value="Grade 11">Grade 11</option>
                            <option value="Grade 12">Grade 12</option>
                        </select>
                    </div>


                    <div className="flex items-center gap-3">
                        {!isDisable && (
                            <>
                                <button
                                    onClick={() => handleAddSection(gradeForSY)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-indigo-700 transition-all duration-150"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Section
                                </button>

                                <button
                                    onClick={handleCreateSY}
                                    disabled={!canCreateSY}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all duration-150 ${canCreateSY
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                        }`}
                                >
                                    {canCreateSY
                                        ? schoolYearMap[currentSchoolyear]?.[
                                            gradeForSY === "Grade 11" ? "isGrade11Created" : "isGrade12Created"
                                        ]
                                            ? `Update ${gradeForSY} SY`
                                            : `Create ${gradeForSY} SY`
                                        : "Unavailable"}
                                </button>
                            </>
                        )}

                        {schoolYearMap && schoolYearMap[currentSchoolyear] && schoolYearMap[currentSchoolyear].isGrade11Created &&
                            schoolYearMap[currentSchoolyear].isGrade12Created && !schoolYearMap[currentSchoolyear].isPublished && (
                                <button
                                    onClick={handlePublishSY}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-emerald-700 transition-all duration-150"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Publish School Year
                                </button>
                            )}
                        <input
                            type="text"
                            placeholder={`Search sections...`}
                            value={sectionSearch}
                            onChange={(e) => {
                                setSectionPage(0);
                                setSectionSearch(e.target.value);
                            }}
                            className="m-2 px-3 py-2 text-sm border rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>
                {!isDisable && !canCreateSY && (
                    <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-md">
                        ⚠️ Currently, you can't create a new School Year. This action is only
                        available between <span className="font-medium">March and May</span>,
                        when the current school year is ending.
                    </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 h-[100vh] max-h-[55vh] overflow-y-auto p-2 bg-gray-200 rounded-xl mr-3 border-gray-400 border-2">
                    {paginatedSections.map((sec) => {
                        const isEditing = editingSectionId === sec.id;

                        const handleNameDoubleClick = (e: React.MouseEvent) => {
                            e.stopPropagation();
                            setEditingSectionId(sec.id);
                            setEditingSectionName(sec.name);
                        };

                        const handleNameBlur = () => {
                            if (editingSectionName.trim() && editingSectionName !== sec.name) {
                                setSections((prev) =>
                                    prev.map((x) =>
                                        x.id === sec.id ? { ...x, name: editingSectionName.trim() } : x
                                    )
                                );
                            }
                            setEditingSectionId(null);
                            setEditingSectionName("");
                        };

                        const handleNameKeyDown = (e: React.KeyboardEvent) => {
                            if (e.key === "Enter") handleNameBlur();
                        };

                        return (
                            <div
                                key={sec.id}
                                className={`p-4 shadow-xl rounded-lg border cursor-auto transition-all ${selectedSectionId === sec.id
                                    ? "border-blue-500 border-3 bg-white"
                                    : `border-gray-200 border-3 bg-white ${!isDisable ? "hover:border-red-300 cursor-pointer" : ""}`
                                    }`}
                                onClick={() => !isDisable && setSelectedSectionId(sec.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <div className="font-semibold">
                                            {isEditing ? (
                                                <input
                                                    autoFocus
                                                    value={editingSectionName}
                                                    onChange={(e) => setEditingSectionName(e.target.value)}
                                                    onBlur={handleNameBlur}
                                                    onKeyDown={handleNameKeyDown}
                                                    className="border px-1 py-0.5 rounded text-sm w-full"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-start">
                                                    <span
                                                        onDoubleClick={(e: React.MouseEvent) => !isDisable && handleNameDoubleClick(e)}
                                                        className={!isDisable ? "cursor-pointer" : ""}
                                                    >
                                                        {sec.name}
                                                    </span>

                                                    {!isDisable && (
                                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                                className="w-3.5 h-3.5 mr-1"
                                                            >
                                                                <path d="M4 13.5V16h2.5l7.35-7.35-2.5-2.5L4 13.5zm9.85-8.35a.5.5 0 0 1 .7 0l1.3 1.3a.5.5 0 0 1 0 .7l-1.15 1.15-2-2 1.15-1.15z" />
                                                            </svg>
                                                            <span>Double-click to edit section name</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {!isDisable && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteSection(sec.id);
                                                }}
                                                className="mt-2 flex items-center gap-1 text-xl text-red-600 hover:text-red-800"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    className="w-4 h-4"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M6 8a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5A.75.75 0 0 1 6 8zm4 0a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5A.75.75 0 0 1 10 8zm4 .75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 1.5 0zM3.5 4.25A.75.75 0 0 1 4.25 3.5h11.5a.75.75 0 0 1 0 1.5H15v.75a2.25 2.25 0 0 1-2.25 2.25H7.25A2.25 2.25 0 0 1 5 5.75V5H4.25a.75.75 0 0 1-.75-.75zm3.25.75V5.75a.75.75 0 0 0 .75.75h5.5a.75.75 0 0 0 .75-.75V5H6.75z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span>Delete Section</span>
                                            </button>
                                        )}
                                        <div className="text-xs text-gray-500">{sec.grade}</div>


                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs">Adviser:</div>
                                        <div className="font-medium">
                                            {sec.adviserId
                                                ? (() => {
                                                    const adviser = advisers.find((a) => a.id === sec.adviserId);
                                                    return adviser
                                                        ? `${adviser.lastName}, ${adviser.firstName}`
                                                        : "Not assigned";
                                                })()
                                                : (
                                                    <span className="text-gray-400">Not assigned</span>
                                                )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <select
                                        className="border px-2 py-1 text-sm rounded mb-2"
                                        value={selectedGroupId || ""}
                                        onChange={(e) => setSelectedGroupId(e.target.value ? Number(e.target.value) : null)}
                                    >
                                        <option value="">All Groups</option>
                                        {groups.map((g: any) => (
                                            <option key={g.id} value={g.id}>
                                                {g.name}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex flex-wrap gap-2">
                                        {subjects
                                            .filter((subj) => {
                                                if (!selectedGroupId) return true;
                                                const group = groups.find((g: any) => g.id === selectedGroupId);
                                                if (!group) return true;
                                                return [
                                                    ...group.applied_subjects,
                                                    ...group.specialized_subjects,
                                                    ...group.core_subjects,
                                                ].some((s) => s.id === subj.id);
                                            })
                                            .map((subj) => {
                                                const isAssigned = sec.subjects.includes(subj.name);
                                                return (
                                                    <span
                                                        key={subj.id}
                                                        className={`px-2 py-1 rounded-full text-xs flex items-center gap-2 ${isAssigned ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"} ${isDisable ? "cursor-auto" : "cursor-pointer hover:bg-gray-300"}`}

                                                        onClick={(e) => {
                                                            if (isDisable) return;
                                                            e.stopPropagation();
                                                            setSections((prev) =>
                                                                prev.map((x) =>
                                                                    x.id === sec.id
                                                                        ? {
                                                                            ...x,
                                                                            subjects: isAssigned
                                                                                ? x.subjects.filter((ss) => ss !== subj.name)
                                                                                : [...x.subjects, subj.name],
                                                                        }
                                                                        : x
                                                                )
                                                            );
                                                        }}
                                                    >
                                                        {subj.name}
                                                        {isAssigned && <Trash className="w-3 h-3" />}
                                                    </span>
                                                );
                                            })}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium text-gray-800">Students</div>
                                        {!isDisable &&
                                            <div className="text-xs text-gray-500">Click students on left to assign</div>
                                        }
                                    </div>

                                    {sec.studentIds.length === 0 ? (
                                        <div className="text-xs text-gray-400 italic border rounded p-3 bg-white">
                                            No students assigned
                                        </div>
                                    ) : (
                                        <div className="overflow-auto min-h-[30vh] max-h-[30vh] border rounded-md shadow-2xl bg-white">
                                            <table className="min-w-full text-xs md:text-sm border-collapse whitespace-nowrap">
                                                <thead className="bg-blue-100 text-gray-700 font-semibold sticky top-0 z-10">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left">Name</th>
                                                        <th className="px-4 py-2 text-center">Grade</th>
                                                        <th className="px-4 py-2 text-center">Age</th>
                                                        <th className="px-4 py-2 text-center">Sex</th>
                                                        {!isDisable &&
                                                            <th className="px-4 py-2 text-center">Action</th>
                                                        }
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {sec.studentIds.map((id) => {
                                                        const s = students.find((st) => st.id === id);
                                                        if (!s) return null;
                                                        const assigned = getStudentSectionName(s.id);
                                                        const bgColor = getSectionColor(assigned);
                                                        return (
                                                            <tr key={id} className="hover:bg-gray-50 text-center transition"
                                                                style={{
                                                                    backgroundColor: assigned ? bgColor + "88" : "white",
                                                                }}>
                                                                <td className="px-4 py-2 text-left font-medium text-gray-800">
                                                                    {s.lastName}, {s.firstName}
                                                                </td>
                                                                <td className="px-4 py-2">{s.age}</td>
                                                                <td className="px-4 py-2">{s.age}</td>
                                                                <td className="px-4 py-2">{s.sex}</td>
                                                                {!isDisable &&
                                                                    <td className="px-4 py-2">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                removeStudentFromSection(sec.id, id);
                                                                            }}
                                                                            className="px-2 py-1 text-xs md:text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </td>
                                                                }
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredSections.length > sectionsPerPage && (
                    <div className="flex justify-center gap-2 mt-4">
                        <button
                            onClick={() => setSectionPage((prev) => Math.max(prev - 1, 0))}
                            disabled={sectionPage === 0}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Prev
                        </button>

                        <span className="px-3 py-1">
                            Page {sectionPage + 1} of {Math.ceil(filteredSections.length / sectionsPerPage)}
                        </span>

                        <button
                            onClick={() =>
                                setSectionPage((prev) =>
                                    Math.min(prev + 1, Math.ceil(filteredSections.length / sectionsPerPage) - 1)
                                )
                            }
                            disabled={sectionPage >= Math.ceil(filteredSections.length / sectionsPerPage) - 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}

            </div>


        </div>
    );
}
