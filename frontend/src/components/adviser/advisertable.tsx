import { useState, useMemo } from "react";
import { Card } from "../ui/card";
import { motion } from "framer-motion";
import { Adviser } from "../../lib/type";
import { Button } from "../ui/button";
import { Edit2, Key } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import RequestHandler from "../../lib/utilities/RequestHandler";
import { removeToast, showToast } from "../toast";

interface AdviserTableProps {
    title: string;
    data: Adviser[];
    delay?: number;
    selectedSection: string;
    selectedSubjects: string[];
    selectedProgram: string;
    fetchAdvisers: any;
}

export default function AdviserTable({
    title,
    data,
    delay = 0,
    selectedSection,
    selectedSubjects,
    selectedProgram,
    fetchAdvisers
}: AdviserTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAdviser, setSelectedAdviser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        email: "",
        age: "",
        sex: "",
    });
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return data
            .filter(
                (a) =>
                    a.account?.name?.toLowerCase().includes(term) ||
                    (a.section?.section_name?.toLowerCase() || "not set").includes(term)
            )
            .filter((a) => {
                const programMatch = selectedProgram === "ALL" || a.program === selectedProgram;
                const sectionMatch =
                    selectedSection === "ALL" ||
                    (a.section?.section_name || "NOT SET") === selectedSection;
                const subjectMatch =
                    selectedSubjects.length === 0 ||
                    a.subjectStatuses.some((subj) =>
                        selectedSubjects.includes(subj.subject.name)
                    );
                return sectionMatch && subjectMatch && programMatch;
            });
    }, [data, searchTerm, selectedSection, selectedSubjects, selectedProgram]);

    const openEditModal = (adviser: Adviser) => {
        setSelectedAdviser(adviser);
        setForm({
            firstName: adviser.account.firstName,
            middleName: adviser.account.middleName,
            lastName: adviser.account.lastName,
            suffix: adviser.account.suffix,
            email: adviser.account.email,
            age: adviser.account.age.toString(),
            sex: adviser.account.sex,
        });
        setIsModalOpen(true);
    };

    const openPasswordModal = (adviser: Adviser) => {
        setSelectedAdviser(adviser);
        setNewPassword("");
        setConfirmPassword("");
        setIsPasswordModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdate = async () => {
        const toastId = showToast("Updating adviser...", "loading");
        setLoading(true);
        try {
            const res = await RequestHandler.fetchData("POST", "adviser/update-adviser-account", {
                adviserAccountId: selectedAdviser.adviser_id,
                ...form,
            });
            removeToast(toastId);
            if (res.success) {
                showToast("Adviser updated successfully.", "success");
                setIsModalOpen(false);
                fetchAdvisers();
            } else {
                showToast(res.message || "Failed to update adviser.", "error");
            }
        } catch (err) {
            console.error(err);
            removeToast(toastId);
            showToast("Error updating adviser.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!newPassword.trim()) return showToast("Password cannot be empty.", "error");
        if (newPassword !== confirmPassword) return showToast("Passwords do not match.", "error");

        const toastId = showToast("Updating password...", "loading");
        setLoading(true);
        try {
            const res = await RequestHandler.fetchData(
                "POST",
                "adviser/update-adviser-password-admin",
                { adviserId: selectedAdviser.adviser_id, newPassword }
            );
            removeToast(toastId);
            if (res.success) {
                showToast("Password updated successfully.", "success");
                setIsPasswordModalOpen(false);
            } else {
                showToast(res.message || "Error updating password.", "error");
            }
        } catch (err) {
            console.error(err);
            removeToast(toastId);
            showToast("Error updating password.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white border shadow-sm rounded-lg overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay }}
            >
                <div className="bg-gray-400 text-white text-lg font-semibold px-4 py-2 flex justify-between items-center">
                    <span>{title}</span>
                    <input
                        type="text"
                        placeholder="Search by name or section..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-50 placeholder-gray-50 w-72"
                    />
                </div>

                <div className="overflow-auto max-h-[50vh] mt-3">
                    <table className="min-w-max text-xs md:text-sm border-collapse">
                        <thead className="bg-blue-100 text-gray-700 font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 text-center">Actions</th>
                                <th className="px-4 py-2 text-center">ID</th>
                                <th className="px-4 py-2 text-center">SCHOOL YEAR</th>
                                <th className="px-4 py-2 text-center">HANDLE GRADE LEVEL</th>
                                <th className="px-4 py-2 text-center">EMAIL</th>
                                <th className="px-4 py-2 text-center">NAME</th>
                                <th className="px-4 py-2 text-center">AGE</th>
                                <th className="px-4 py-2 text-center">SEX</th>
                                <th className="px-4 py-2 text-center">PROGRAM</th>
                                <th className="px-4 py-2 text-center">SECTION</th>
                                <th className="px-4 py-2 text-center">STUDENT MALE</th>
                                <th className="px-4 py-2 text-center">STUDENT FEMALE</th>
                                <th className="px-4 py-2 text-center">STUDENT TOTAL</th>
                                <th className="px-4 py-2 text-center">SUBJECTS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map((adviser) => (
                                <tr key={adviser.id} className="hover:bg-gray-50 text-center">
                                    <td className="px-4 py-2 flex justify-center gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(adviser)}>
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-green-600 hover:text-green-800"
                                            onClick={() => openPasswordModal(adviser)}
                                        >
                                            <Key size={16} />
                                        </Button>
                                    </td>
                                    <td className="px-4 py-2">{adviser.id}</td>
                                    <td className="px-4 py-2">{adviser.school_year}</td>
                                    <td className="px-4 py-2">{adviser.grade_level}</td>
                                    <td className="px-4 py-2">{adviser.account.email}</td>
                                    <td className="px-4 py-2">{adviser.account.name}</td>
                                    <td className="px-4 py-2">{adviser.account.age}</td>
                                    <td className="px-4 py-2">{adviser.account.sex}</td>
                                    <td className="px-4 py-2">{adviser.program}</td>
                                    <td className="px-4 py-2">{adviser.section?.section_name ?? "NOT SET"}</td>
                                    <td className="px-4 py-2">{adviser.studentCounts.male}</td>
                                    <td className="px-4 py-2">{adviser.studentCounts.female}</td>
                                    <td className="px-4 py-2">{adviser.studentCounts.total}</td>
                                    <td className="px-4 py-2">
                                        {adviser.subjectStatuses.map((s) => s.subject.name).join(", ")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Edit Adviser Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Adviser Account</DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col gap-3 mt-2">
                            {Object.keys(form).map((key) => (
                                <div key={key}>
                                    <label className="text-sm font-medium text-gray-700 capitalize">
                                        {key}
                                    </label>
                                    <Input
                                        name={key}
                                        value={form[key as keyof typeof form]}
                                        onChange={handleChange}
                                        type={key === "age" ? "number" : "text"}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="destructive" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} disabled={loading} variant="outline">
                                {loading ? "Updating..." : "Save"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Change Password Modal */}
                <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Change Adviser Password</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 mt-2">
                            <div>
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="destructive" onClick={() => setIsPasswordModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handlePasswordUpdate} disabled={loading} variant="outline">
                                {loading ? "Updating..." : "Save"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </Card>
    );
}
