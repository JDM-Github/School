import { Home, Search, LogOut, Download, Upload, Database } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useAuth } from "../context/auth";
import AdviserPasswordManager from "../components/dashboard/changePassword";
import RequestHandler from "../lib/utilities/RequestHandler";
import { confirmToast, removeToast, showToast } from "../components/toast";

const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Subjects", path: "/subjects" },
    { name: "Create School Year", path: "/createsy" },
    { name: "Student Progress", path: "/progress" },
    { name: "Advisers", path: "/advisers" },
    { name: "Students", path: "/students" },
    { name: "Key Performance Metrics", path: "/kpi" },
    { name: "SHS SF2 Monitoring", path: "/shssf2" },
    { name: "SHS SF9 Monitoring", path: "/shssf9" },
    { name: "Sprays", path: "/sprays" },
    { name: "Accounts", path: "/accounts" },
    { name: "Feedback", path: "/feedback" },
    { name: "Settings", path: "/settings" },
    { name: "My Students", path: "/teacher/students" },
    { name: "Change SY", path: null },
];

export default function Header() {
    const { user, role } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [isCreatingBackup, setIsCreatingBackup] = useState(false);
    const [isRestoringBackup, setIsRestoringBackup] = useState(false);

    const currentPage = useMemo(() => {
        const match = navItems.find(item => item.path === location.pathname);
        return match ? match.name : "Unknown";
    }, [location.pathname]);

    const handleLogout = () => {
        Cookies.remove("token");
        localStorage.removeItem("user");
        navigate("/");
        window.location.reload();
    };

    const handleCreateBackup = async () => {
        confirmToast(
            "Are you sure you want to create a database backup?",
            async () => {
                setIsCreatingBackup(true);
                const loadingToast = showToast("Creating database backup...", "loading");

                try {
                    const response = await RequestHandler.fetchData(
                        "GET",
                        "backup/create-backup"
                    );

                    if (response.success) {
                        const blob = new Blob([JSON.stringify(response.backup, null, 2)], {
                            type: "application/json",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        removeToast(loadingToast);
                        showToast(
                            `Backup created successfully! Tables: ${response.summary.totalTables}, Rows: ${response.summary.totalRows}`,
                            "success",
                            4000
                        );
                    } else {
                        removeToast(loadingToast);
                        showToast(`Failed to create backup: ${response.message}`, "error", 4000);
                    }
                } catch (error) {
                    console.error("Backup error:", error);
                    removeToast(loadingToast);
                    showToast("Failed to create backup. Please try again.", "error", 4000);
                } finally {
                    setIsCreatingBackup(false);
                }
            }
        );
    };

    const handleRestoreBackup = async () => {
        confirmToast(
            "⚠️ WARNING: This will replace ALL current database data with the backup. Are you sure?",
            () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".json";

                input.onchange = async (e: any) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    setIsRestoringBackup(true);
                    const loadingToast = showToast("Restoring database backup...", "loading");

                    try {
                        const text = await file.text();
                        const backup = JSON.parse(text);

                        const response = await RequestHandler.fetchData(
                            "POST",
                            "backup/restore-backup",
                            { backup }
                        );

                        if (response.success) {
                            removeToast(loadingToast);
                            showToast(
                                `Backup restored successfully! Tables: ${response.summary.totalTablesRestored}, Rows: ${response.summary.totalRowsRestored}`,
                                "success",
                                4000
                            );
                            setTimeout(() => window.location.reload(), 2000);
                        } else {
                            removeToast(loadingToast);
                            showToast(`Failed to restore backup: ${response.message}`, "error", 4000);
                        }
                    } catch (error) {
                        console.error("Restore error:", error);
                        removeToast(loadingToast);
                        showToast("Failed to restore backup. Please check the file format.", "error", 4000);
                    } finally {
                        setIsRestoringBackup(false);
                    }
                };

                input.click();
            }
        );
    };

    return (
        <>
            <header className="w-full bg-blue-900/80 text-white px-4 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-900 rounded-lg">
                        <Home size={20} className="text-blue-400" />
                    </div>
                    <span className="text-lg font-semibold">{currentPage}</span>
                </div>

                <div className="flex items-center space-x-3 md:space-x-5">
                    <div className="relative hidden md:block">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-gray-100 text-gray-700 text-sm px-3 py-2 w-64 rounded-md 
                            focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
                        />
                    </div>

                    <div className="p-2 hidden md:block bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-300 transition">
                        <Search size={20} />
                    </div>

                    {/* Database Backup Section */}
                    <div className="hidden lg:flex items-center gap-2 bg-blue-800/50 px-3 py-2 rounded-lg border border-blue-700/50">
                        <Database size={18} className="text-blue-300" />
                        <span className="text-xs font-medium text-blue-200">Database</span>
                        <div className="flex gap-2 ml-2">
                            <button
                                onClick={handleCreateBackup}
                                disabled={isCreatingBackup}
                                className="px-3 py-1.5 bg-green-600 rounded-md hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm"
                                title="Create Database Backup"
                            >
                                <Download size={16} />
                                <span className="font-medium">Backup</span>
                            </button>

                            <button
                                onClick={handleRestoreBackup}
                                disabled={isRestoringBackup}
                                className="px-3 py-1.5 bg-orange-600 rounded-md hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm"
                                title="Restore Database Backup"
                            >
                                <Upload size={16} />
                                <span className="font-medium">Restore</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile/Tablet View - Icon Only */}
                    <div className="flex lg:hidden items-center gap-2">
                        <button
                            onClick={handleCreateBackup}
                            disabled={isCreatingBackup}
                            className="p-2 bg-green-600 rounded-lg hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Create Database Backup"
                        >
                            <Download size={20} />
                        </button>

                        <button
                            onClick={handleRestoreBackup}
                            disabled={isRestoringBackup}
                            className="p-2 bg-orange-600 rounded-lg hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Restore Database Backup"
                        >
                            <Upload size={20} />
                        </button>
                    </div>

                    <AdviserPasswordManager role={role || "admin"} user={user} />

                    <button
                        onClick={handleLogout}
                        className="p-2 bg-red-500 rounded-lg cursor-pointer hover:bg-red-300 transition"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>
            <div className="w-full bg-blue-900/50 py-2 px-6 text-sm text-gray-300/50">
                <Link
                    to="/"
                    className="hover:text-gray-50 transition-colors duration-200"
                >
                    DASHBOARD
                </Link>
                {currentPage !== "Dashboard" && (
                    <> / {currentPage}</>
                )}
            </div>
        </>
    );
}