import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, ChevronDown } from "lucide-react";
import SubjectTable from "../components/subjects/subjecttable";
import { Group } from "../lib/type";
import { GroupAnalytics } from "../components/subjects/groupanalytics";
import { GroupSubjectCountBar } from "../components/subjects/groupsubject";
import RequestHandler from "../lib/utilities/RequestHandler";
import { useSY } from "../layout/syprovider";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Upload, Download } from "lucide-react";
import { removeToast, showToast } from "../components/toast";


export default function Subjects() {
    const { currentSY } = useSY();
    const [viewType, setViewType] = useState<string>("ALL");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGroups = async () => {
        setLoading(true);
        setError(null);
        const response = await RequestHandler.fetchData("GET", "group/get-all");
        if (response.success) setGroups(response.groups || []);
        else setError(response.message || "Failed to load groups");
        setLoading(false);
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const filteredGroups = useMemo(() => {
        if (viewType === "ALL") return groups;
        return groups.filter((g) => g.name.toUpperCase().includes(viewType));
    }, [viewType, groups]);

    const handleDownload = () => {
        const data: any[] = [];
        groups.forEach(group => {
            const maxRows = Math.max(
                group.applied_subjects.length,
                group.specialized_subjects.length,
                group.core_subjects.length
            );

            for (let i = 0; i < maxRows; i++) {
                data.push({
                    Group: i === 0 ? group.name : "",
                    "Applied Subjects": group.applied_subjects[i]?.name || "",
                    "Applied Category": group.applied_subjects[i]?.specialized_category || "",
                    "Specialized Subjects": group.specialized_subjects[i]?.name || "",
                    "Specialized Category": group.specialized_subjects[i]?.specialized_category || "",
                    "Core Subjects": group.core_subjects[i]?.name || "",
                    "Core Category": group.core_subjects[i]?.specialized_category || "",
                });
            }
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Groups_Subjects");

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "groups_subjects.xlsx");
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const input = e.target;
        const loadingToast = showToast("Uploading and syncing data...", "loading");

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows: any[] = XLSX.utils.sheet_to_json(sheet);

            let currentGroup = "";
            const grouped: Record<string, any[]> = {};

            rows.forEach(row => {
                if (row["Group"] && row["Group"].trim()) {
                    currentGroup = row["Group"].trim();
                }

                if (!currentGroup) return;
                if (!grouped[currentGroup]) grouped[currentGroup] = [];

                grouped[currentGroup].push(row);
            });

            for (const [groupName, entries] of Object.entries(grouped)) {
                const groupRes = await RequestHandler.fetchData("POST", "group/create", { name: groupName });
                const groupId = groupRes.group?.id;
                if (!groupId) continue;

                for (const entry of entries) {
                    const sets = [
                        { type: "APPLIED", name: entry["Applied Subjects"], cat: entry["Applied Category"] },
                        { type: "SPECIALIZED", name: entry["Specialized Subjects"], cat: entry["Specialized Category"] },
                        { type: "CORE", name: entry["Core Subjects"], cat: entry["Core Category"] },
                    ];

                    for (const s of sets) {
                        if (!s.name || !s.name.trim()) continue;

                        await RequestHandler.fetchData("POST", "group/add-subject", {
                            name: s.name.trim(),
                            specialized_category: s.cat?.trim() || null,
                            group_id: groupId,
                            subject_type: s.type,
                        });
                    }
                }
            }

            await fetchGroups();
            input.value = "";
            removeToast(loadingToast);
            showToast("Upload complete.", "success");
        } catch (error) {
            console.error(error);
            removeToast(loadingToast);
            showToast("Upload failed. Please check your file.", "error");
        }
    };


    return (
        <div className="flex flex-col lg:flex-row w-full min-h-screen h-screen p-4 bg-gray-50 text-gray-800 space-y-6 lg:space-y-0 lg:space-x-6 flex-1 overflow-hidden">
            <motion.div
                className="lg:w-3/6 space-y-6 overflow-y-auto pr-2 h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sticky top-0 bg-gray-50 z-50 pb-3 shadow-sm space-y-3 sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">All Subjects</h1>
                        <span className="text-sm text-gray-500">School Year: {currentSY}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1 bg-gray-200 px-3 py-2 rounded-md hover:bg-gray-300 transition text-sm"
                            >
                                {viewType} <ChevronDown size={16} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-20">
                                    {["ALL", ...Array.from(new Set(groups.map(g => g.name.split(" ")[0].toUpperCase())))].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setViewType(type);
                                                setDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <details className="relative">
                            <summary className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition text-sm select-none">
                                More Actions
                            </summary>

                            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg p-2 flex flex-col gap-2 z-20">
                                <AddSubjectDialog groups={groups} onSuccess={async () => await fetchGroups()} />
                                <AddGroupDialog onSuccess={async () => await fetchGroups()} />

                                <button
                                    onClick={() => handleDownload()}
                                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition text-sm w-full justify-center"
                                >
                                    <Download size={16} /> Download XLSX
                                </button>

                                <label className="flex items-center justify-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition cursor-pointer text-sm w-full">
                                    <Upload size={16} /> Upload XLSX
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={handleUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </details>
                    </div>
                </div>


                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm">Loading groups...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-red-500">
                        <p className="font-medium mb-2">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {viewType === "ALL" ? (
                            <>
                                <SubjectTable
                                    title="APPLIED SUBJECTS"
                                    data={filteredGroups.flatMap(g =>
                                        g.applied_subjects.map(s => ({ ...s, groupName: g.name }))
                                    )}
                                    delay={0.1}
                                />
                                <SubjectTable
                                    title="SPECIALIZED SUBJECTS"
                                    data={filteredGroups.flatMap(g =>
                                        g.specialized_subjects.map(s => ({ ...s, groupName: g.name }))
                                    )}
                                    delay={0.2}
                                />
                                <SubjectTable
                                    title="CORE SUBJECTS"
                                    data={filteredGroups.flatMap(g =>
                                        g.core_subjects.map(s => ({ ...s, groupName: g.name }))
                                    )}
                                    delay={0.3}
                                />
                            </>
                        ) : (
                            filteredGroups.map(g => (
                                <div key={g.id}>
                                    <SubjectTable
                                        title="APPLIED SUBJECTS"
                                        data={g.applied_subjects.map(s => ({ ...s, groupName: g.name }))}
                                        delay={0.1}
                                    />
                                    <SubjectTable
                                        title="SPECIALIZED SUBJECTS"
                                        data={g.specialized_subjects.map(s => ({ ...s, groupName: g.name }))}
                                        delay={0.2}
                                    />
                                    <SubjectTable
                                        title="CORE SUBJECTS"
                                        data={g.core_subjects.map(s => ({ ...s, groupName: g.name }))}
                                        delay={0.3}
                                    />
                                </div>
                            ))
                        )}
                    </>
                )}
            </motion.div>

            <motion.div
                className="lg:w-3/6 bg-white shadow border p-5 rounded-lg space-y-6 overflow-y-auto"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
                {!loading && !error ? (
                    <>
                        <GroupAnalytics title="Group Subject Distribution" color="#2563eb" data={filteredGroups} />
                        <GroupSubjectCountBar title="Subject Category Totals" color="#f59e0b" data={filteredGroups} />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        {loading ? "Loading analytics..." : "No analytics available"}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function AddSubjectDialog({
    groups,
    onSuccess,
}: {
    groups: Group[];
    onSuccess: () => void;
}) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [groupId, setGroupId] = useState<number | "">("");
    const [type, setType] = useState("APPLIED");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const toastId = showToast("Processing...", "loading");
        const response = await RequestHandler.fetchData("POST", "group/add-subject", {
            name,
            specialized_category: category || null,
            group_id: groupId,
            subject_type: type,
        });

        setLoading(false);
        removeToast(toastId);
        if (response.success) {
            showToast("Subject added successfully.", "success");
            onSuccess();
        } else {
            setError(response.message || "Failed to add subject.");
            showToast(response.message || "Failed to add subject.", "error");
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    <Plus size={16} /> Add Subject
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-200" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] z-200 max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg">
                    <Dialog.Title className="text-lg font-semibold mb-3">Add New Subject</Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Specialized Category (optional)
                            </label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Group</label>
                            <select
                                value={groupId}
                                onChange={(e) => setGroupId(Number(e.target.value))}
                                className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                                required
                            >
                                <option value="">Select a group...</option>
                                {groups.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                            >
                                <option value="APPLIED">Applied Subject</option>
                                <option value="SPECIALIZED">Specialized Subject</option>
                                <option value="CORE">Core Subject</option>
                            </select>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white w-full py-2 rounded-md hover:bg-blue-700 transition"
                        >
                            {loading ? "Adding..." : "Add Subject"}
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

function AddGroupDialog({ onSuccess }: { onSuccess: () => void }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const toastId = showToast("Creating group...", "loading");
        const response = await RequestHandler.fetchData("POST", "group/create", {
            name,
        });

        setLoading(false);
        removeToast(toastId);
        if (response.success) {
            showToast("Group created successfully.", "success");
            onSuccess();
        } else {
            setError(response.message || "Failed to create group.");
            showToast(response.message || "Failed to create group.", "error");
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                    <Plus size={16} /> Add Group
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-200" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] z-200 max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg">
                    <Dialog.Title className="text-lg font-semibold mb-3">Create New Group</Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-green-200"
                                required
                            />
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white w-full py-2 rounded-md hover:bg-green-700 transition"
                        >
                            {loading ? "Creating..." : "Create Group"}
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
