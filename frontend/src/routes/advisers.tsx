import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import * as Dialog from "@radix-ui/react-dialog";
import RequestHandler from "../lib/utilities/RequestHandler";
import AdviserTable from "../components/adviser/advisertable";
import { useSY } from "../layout/syprovider";
import { removeToast, showToast } from "../components/toast";
import { Plus } from "lucide-react";

export default function Advisers() {
    const { currentSY } = useSY();
    const [advisers, setAdvisers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedSection, setSelectedSection] = useState("ALL");
    const [selectedProgram, setSelectedProgram] = useState("ALL");
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    const handleDownloadExcel = () => {
        if (!advisers.length) return;

        const data = advisers.map(a => ({
            "Adviser Name": a.account?.name || "",
            "First Name": a.account?.firstName || "",
            "Middle Name": a.account?.middleName || "",
            "Last Name": a.account?.lastName || "",
            "Suffix": a.account?.suffix || "",
            "Sex": a.account?.sex || "",
            "Age": a.account?.age || "",
            "Email": a.account?.email || "",
            "Program": a.program || "",
            "Section": a.section?.section_name || "NOT SET",
            "Grade Level": a.grade_level || "",
            "Total Students": a.studentCounts?.total || 0,
            "Male Students": a.studentCounts?.male || 0,
            "Female Students": a.studentCounts?.female || 0,
            "Subjects": a.subjectStatuses?.map((s: any) => s.subject?.name).join(", ") || "",
            "School Year": a.school_year || "",
            "Created At": new Date(a.createdAt).toLocaleString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Advisers");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `Advisers_${currentSY}.xlsx`);
    };

    const handleUploadAdvisers = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const data = new Uint8Array(evt.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet);

            const toastId = showToast("Uploading advisers...", "loading");

            for (const row of rows as any[]) {
                await RequestHandler.fetchData("POST", "adviser/add", {
                    firstName: row["First Name"],
                    middleName: row["Middle Name"],
                    lastName: row["Last Name"],
                    suffix: row["Suffix"],
                    age: row["Age"] || null,
                    sex: row["Sex"],
                    email: row["Email"],
                    program: row["Program"] || null,
                    currentSY: row["SY"] || currentSY,
                });
            }

            removeToast(toastId);
            showToast("Advisers uploaded successfully.", "success");
            fetchAdvisers();
            e.target.value = ""; 
        };

        reader.readAsArrayBuffer(file);
    };



    const fetchAdvisers = async () => {
        setLoading(true);
        try {
            const response = await RequestHandler.fetchData("GET", `adviser/get-all-with-student-counts?school_year=${currentSY}`);
            if (response.success) setAdvisers(response.advisers || []);
            else setError(response.message || "Failed to load advisers");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdvisers();
    }, [currentSY]);

    const programs = Array.from(new Set(advisers.map(a => a.program)));
    const sections = Array.from(
        new Set(
            advisers.map(a => a.section?.section_name || "NOT SET")
        )
    );
    const subjects = Array.from(new Set(advisers.flatMap(a => a.subjectStatuses.map((s: any) => s.subject.name))));

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen p-4 bg-gray-50 text-gray-800 space-y-6 lg:space-y-0 lg:space-x-6 flex-1 overflow-hidden">
            <motion.div
                className="lg:w-4/6 flex-1 space-y-6 overflow-y-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50 z-50 pb-2 shadow-sm px-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">All Advisers</h1>
                        <span className="text-sm text-gray-500">School Year: {currentSY}</span>
                    </div>
                    <div className="flex gap-2">
                        <label className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition cursor-pointer">
                            Upload Advisers
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleUploadAdvisers}
                                className="hidden"
                            />
                        </label>
                        <button
                            onClick={handleDownloadExcel}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                        >
                            Download Excel
                        </button>
                        <AddAdviserDialog onSuccess={fetchAdvisers} />
                    </div>
                </div>

                {loading && <div>Loading advisers...</div>}
                {error && <div className="text-red-500">{error}</div>}

                {!loading && !error && (
                    <>
                        <AdviserTable
                            title="ADVISERS"
                            data={advisers}
                            selectedSection={selectedSection}
                            selectedSubjects={selectedSubjects}
                            selectedProgram={selectedProgram}
                            fetchAdvisers={fetchAdvisers}
                        />
                    </>
                )}
            </motion.div>
            <motion.div
                className="lg:w-2/6 bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-200 p-6 rounded-2xl space-y-6 overflow-y-auto"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    <h2 className="text-gray-800 font-semibold text-xl">Filters</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Section</label>
                        <select
                            value={selectedSection}
                            onChange={e => setSelectedSection(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none hover:border-gray-400 transition"
                        >
                            <option value="ALL">All Sections</option>
                            {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Program</label>
                        <select
                            value={selectedProgram}
                            onChange={e => setSelectedProgram(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none hover:border-gray-400 transition"
                        >
                            <option value="ALL">All Programs</option>
                            {programs.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Subjects</label>
                        <div className="flex flex-wrap gap-2">
                            {subjects.map((sub: string) => {
                                const isSelected = selectedSubjects.includes(sub);
                                return (
                                    <button
                                        key={sub}
                                        type="button"
                                        onClick={() =>
                                            setSelectedSubjects(prev =>
                                                isSelected ? prev.filter(s => s !== sub) : [...prev, sub]
                                            )
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border
                                        ${isSelected
                                                ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                                            }`}
                                    >
                                        {sub}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <button
                        onClick={() => {
                            setSelectedSection('ALL')
                            setSelectedSubjects([])
                            setSelectedProgram('ALL')
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition"
                    >
                        Reset Filters
                    </button>
                </div>
            </motion.div>

        </div>
    );
}


function AddAdviserDialog({ onSuccess }: { onSuccess: () => void }) {
    const { currentSY } = useSY();
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [suffix, setSuffix] = useState("");
    const [age, setAge] = useState<number | "">("");
    const [sex, setSex] = useState<"Male" | "Female" | "Other">("Male");
    const [email, setEmail] = useState("");
    const [program, setProgram] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const toastId = showToast("Creating adviser...", "loading");

        const response = await RequestHandler.fetchData("POST", "adviser/add", {
            firstName,
            middleName,
            lastName,
            suffix,
            age: age || null,
            sex,
            email,
            program: program || null,
            currentSY
        });

        setLoading(false);
        removeToast(toastId);

        if (response.success) {
            showToast("Adviser added successfully.", "success");
            onSuccess();

            setFirstName("");
            setMiddleName("");
            setLastName("");
            setSuffix("");
            setAge("");
            setSex("Male");
            setEmail("");
            setProgram("");
        } else {
            setError(response.message || "Failed to add adviser.");
            showToast(response.message || "Failed to add adviser.", "error");
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    <Plus size={16} /> Add Adviser
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg z-50">
                    <Dialog.Title className="text-lg font-semibold mb-3">Add New Adviser</Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                required
                                className="w-full border rounded-md px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Middle Name"
                                value={middleName}
                                onChange={e => setMiddleName(e.target.value)}
                                required
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                required
                                className="w-full border rounded-md px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Suffix"
                                value={suffix}
                                onChange={e => setSuffix(e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>

                        <input
                            type="number"
                            placeholder="Age"
                            value={age}
                            onChange={e => setAge(Number(e.target.value))}
                            min={1}
                            className="w-full border rounded-md px-3 py-2"
                        />

                        <select
                            value={sex}
                            onChange={e => setSex(e.target.value as "Male" | "Female" | "Other")}
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
                            onChange={e => setEmail(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        />

                        <input
                            type="text"
                            placeholder="Program"
                            value={program}
                            onChange={e => setProgram(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        />


                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white w-full py-2 rounded-md hover:bg-blue-700 transition"
                        >
                            {loading ? "Adding..." : "Add Adviser"}
                        </button>
                    </form>

                    <Dialog.Close asChild>
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
