import { Home, Search, LogOut, Key } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import Cookies from "js-cookie";
import { useAuth } from "../context/auth";
import AdviserPasswordManager from "../components/dashboard/changePassword";

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

    const currentPage = useMemo(() => {
        const match = navItems.find(item => item.path === location.pathname);
        return match ? match.name : "Unknown";
    }, [location.pathname]);

    const navigate = useNavigate();
    const handleLogout = () => {
        Cookies.remove("token");
        localStorage.removeItem("user");
        navigate("/");
        window.location.reload();
    }

    const updatePassword = async () => {
        alert(JSON.stringify(user));
    }

    // const [showNotifications, setShowNotifications] = useState(false);
    // const notificationRef = useRef<HTMLDivElement>(null);
    // const notificationModalRef = useRef<HTMLDivElement>(null);
    // const [user, setUser] = useState<any>(null);

    // const [currentPageNotif, setCurrentPage] = useState(1);
    // const itemsPerPage = 3;

    // // For Modal Notification
    // const [selectedNotif, setSelectedNotif] = useState<any>(null);
    // const [showModal, setShowModal] = useState(false);

    // // Use for search
    // const [searchFocused, setSearchFocused] = useState(false);
    // const [showSearch, setShowSearch] = useState(false);
    // const [highlightIndex, setHighlightIndex] = useState(0);
    // const [query, setQuery] = useState("");
    // const [results, setResults] = useState<any[]>([]);

    // useEffect(() => {
    //     const storedUser = localStorage.getItem("user");
    //     if (storedUser) {
    //         setUser(JSON.parse(storedUser));
    //     }
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (
    //             notificationRef.current &&
    //             !notificationRef.current.contains(event.target as Node) && (
    //                 !notificationModalRef.current
    //             )
    //         ) {
    //             setShowNotifications(false);
    //         }
    //     };
    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, []);

    // useEffect(() => {
    //     // async function fetchNotifications() {
    //     //     if (!user) return;
    //     //     setLoading(true);
    //     //     try {
    //     //         const response = await RequestHandler.fetchData(
    //     //             "get",
    //     //             `notification/user/${99999}`
    //     //         );
    //     //         setNotifications(response.notifications || []);
    //     //     } catch (err: any) {
    //     //         console.error("Notification fetch error:", err);
    //     //         showToast(err.message || "Failed to load notifications", "error");
    //     //     } finally {
    //     //         setLoading(false);
    //     //     }
    //     // }
    //     // fetchNotifications();
    // }, [user]);

    // // useEffect(() => {
    // //     const handleKeyDown = (e: KeyboardEvent) => {
    // //         if (!searchFocused || results.length === 0) return;

    // //         if (e.key === "ArrowDown") {
    // //             e.preventDefault();
    // //             setHighlightIndex((prev) => (prev + 1) % results.length);
    // //         }
    // //         if (e.key === "ArrowUp") {
    // //             e.preventDefault();
    // //             setHighlightIndex((prev) => (prev - 1 + results.length) % results.length);
    // //         }
    // //         if (e.key === "Enter") {
    // //             e.preventDefault();

    // //             if (results.length === 1) {
    // //                 results[0].action();
    // //             } else {
    // //                 results[highlightIndex]?.action();
    // //             }

    // //             setQuery("");
    // //             setResults([]);
    // //             setHighlightIndex(0);
    // //         }
    // //     };

    // //     window.addEventListener("keydown", handleKeyDown);
    // //     return () => window.removeEventListener("keydown", handleKeyDown);
    // // }, [results, highlightIndex, searchFocused]);

    // const searchableItems = [
    //     // {
    //     //     id: "dashboard",
    //     //     type: "link",
    //     //     label: "Dashboard",
    //     //     description: "Go to your main dashboard",
    //     //     icon: <Home size={16} className="text-blue-400" />,
    //     //     action: () => navigate("/"),
    //     // },
    //     // {
    //     //     id: "model",
    //     //     type: "link",
    //     //     label: "Model",
    //     //     description: "Manage your AI/ML models",
    //     //     icon: <Box size={16} className="text-purple-400" />,
    //     //     action: () => navigate("/model"),
    //     // },
    //     // {
    //     //     id: "plants",
    //     //     type: "link",
    //     //     label: "Plants",
    //     //     description: "View and manage plant data",
    //     //     icon: <Leaf size={16} className="text-green-400" />,
    //     //     action: () => navigate("/plants"),
    //     // },
    //     // {
    //     //     id: "diseases",
    //     //     type: "link",
    //     //     label: "Diseases",
    //     //     description: "Track and analyze plant diseases",
    //     //     icon: <Bug size={16} className="text-red-400" />,
    //     //     action: () => navigate("/diseases"),
    //     // },
    //     // {
    //     //     id: "accounts",
    //     //     type: "link",
    //     //     label: "Accounts",
    //     //     description: "Manage user accounts",
    //     //     icon: <Users size={16} className="text-indigo-400" />,
    //     //     action: () => navigate("/accounts"),
    //     // },
    //     // {
    //     //     id: "feedback",
    //     //     type: "link",
    //     //     label: "Feedback",
    //     //     description: "View user feedback",
    //     //     icon: <MessageSquare size={16} className="text-pink-400" />,
    //     //     action: () => navigate("/feedback"),
    //     // },
    //     // {
    //     //     id: "settings",
    //     //     type: "link",
    //     //     label: "Settings",
    //     //     description: "Go to system settings page",
    //     //     icon: <Settings size={16} className="text-yellow-400" />,
    //     //     action: () => navigate("/settings"),
    //     // },
    //     // {
    //     //     id: "notifications",
    //     //     type: "modal",
    //     //     label: "Notifications",
    //     //     description: "Check your recent alerts",
    //     //     icon: <Bell size={16} className="text-red-400" />,
    //     //     action: () => setShowNotifications(true),
    //     // },
    // ];


    // useEffect(() => {
    //     // if (query.trim() === "") {
    //     //     setResults([]);
    //     // } else {
    // 	// 	setShowNotifications(false);
    //     //     setResults(
    //     //         searchableItems.filter((item) =>
    //     //             item.label.toLowerCase().includes(query.toLowerCase())
    //     //         )
    //     //     );
    //     // }
    // }, [query]);

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
                        {/* 
                        {searchFocused && query.trim() !== "" && results.length > 0 && (
                            <div className="absolute mt-1 w-64 bg-gray-500 border border-gray-500 rounded-md shadow-xl z-50 overflow-hidden animate-fade-in">
                                {results.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition 
                                            ${highlightIndex === index ? "bg-blue-700/70" : "hover:bg-blue-700/50"}`}
                                        onClick={() => {
                                            item.action();
                                            setQuery("");
                                            setResults([]);
                                            setHighlightIndex(0);
                                        }}
                                    >
                                        <span className="text-lg">{item.icon}</span>

                                        <div className="flex-1">
                                            <span className="block text-white font-medium">{item.label}</span>
                                            <span className="block text-xs text-gray-400">
                                                {item.description}
                                            </span>
                                        </div>

                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.type === "link"
                                                    ? "bg-blue-900 text-blue-300"
                                                    : "bg-purple-900 text-purple-300"
                                                }`}
                                        >
                                            {item.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )} */}
                    </div>
                    <div className="p-2 hidden md:block bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-300 transition">
                        <Search size={20} />
                    </div>

                    <AdviserPasswordManager role={role || "admin"} user={user}/>
                    <button
                        onClick={handleLogout}
                        className="p-2 bg-red-500 rounded-lg cursor-pointer hover:bg-red-300 transition"
                    >
                        <LogOut size={20} />
                    </button>

                    {/* <div className="relative" ref={notificationRef}> */}
                    {/* <button
                            className="p-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-green-700 transition duration-200 ease-in-out shadow-md"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} className="text-white" />
                            {notifications.filter((n: any) => !n.isRead).length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white px-1.5 py-0.5 rounded-full shadow-sm">
                                    {notifications.filter((n: any) => !n.isRead).length}
                                </span>
                            )}
                        </button> */}

                    {/* {showNotifications && (
                            <div className="absolute right-0 mt-2 w-100 bg-gray-900 shadow-xl rounded-lg p-4 text-white text-sm border border-gray-700 z-50 animate-fade-in">
                                <h3 className="text-md font-semibold border-b border-gray-700 pb-2 mb-2">
                                    Notifications
                                </h3>

                                {loading ? (
                                    <div className="flex justify-center items-center py-6">
                                        <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <p className="text-gray-400 text-center py-4">
                                        No notifications found
                                    </p>
                                ) : (
                                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                                        {[...notifications]
                                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                            .slice((currentPageNotif - 1) * itemsPerPage, currentPageNotif * itemsPerPage)
                                            .map((notif: any) => {
                                                const typeColors: Record<string, string> = {
                                                    info: "from-blue-900/30 to-blue-800/20 border-l-4 border-blue-400",
                                                    warning: "from-yellow-900/30 to-yellow-800/20 border-l-4 border-yellow-400",
                                                    success: "from-green-900/30 to-green-800/20 border-l-4 border-green-400",
                                                    error: "from-red-900/30 to-red-800/20 border-l-4 border-red-500",
                                                    system: "from-purple-900/30 to-purple-800/20 border-l-4 border-purple-400",
                                                };

                                                const typeIcons: Record<string, string> = {
                                                    info: "ℹ️",
                                                    warning: "⚠️",
                                                    success: "✅",
                                                    error: "❌",
                                                    system: "⚙️",
                                                };

                                                return (
                                                    <li
                                                        key={notif.id}
                                                        onClick={() => {
                                                            setSelectedNotif(notif);
                                                            setShowModal(true);

                                                            if (!notif.isRead) {
                                                                setNotifications((prev: any[]) =>
                                                                    prev.map((n) =>
                                                                        n.id === notif.id ? { ...n, isRead: true } : n
                                                                    )
                                                                );
                                                                RequestHandler.fetchData("put", `notification/mark-read/${notif.id}`)
                                                                    .catch((err) => console.error("Failed to mark read:", err));
                                                            }
                                                        }}
                                                        className={`flex items-start gap-2 p-3 rounded-lg transition duration-150 cursor-pointer bg-gradient-to-r ${typeColors[notif.type]} hover:brightness-110`}
                                                    >
                                                        <span className="text-lg">{typeIcons[notif.type]}</span>
                                                        <div className="flex-1">
                                                            <span className="block font-medium">{notif.title}</span>
                                                            <span className="block text-gray-400 text-xs">
                                                                {notif.message.length > 50
                                                                    ? notif.message.slice(0, 50) + "..."
                                                                    : notif.message}
                                                            </span>
                                                            <span className="block text-gray-500 text-xs mt-1">
                                                                {new Date(notif.createdAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        {!notif.isRead && (
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                )} */}

                    {/* <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                        disabled={currentPageNotif === 1}
                                        className={`px-2 py-1 rounded ${currentPageNotif === 1 ? "opacity-20 select-none" : "hover:bg-gray-700"
                                            }`}
                                    >
                                        Prev
                                    </button>
                                    <span>
                                        Page {currentPageNotif} of {Math.ceil(notifications.length / itemsPerPage)}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setCurrentPage((p) =>
                                                p < Math.ceil(notifications.length / itemsPerPage) ? p + 1 : p
                                            )
                                        }
                                        disabled={currentPageNotif === Math.ceil(notifications.length / itemsPerPage)}
                                        className={`px-2 py-1 rounded ${currentPageNotif === Math.ceil(notifications.length / itemsPerPage)
                                            ? "opacity-20 select-none"
                                            : "hover:bg-gray-700"
                                            }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )} */}

                    {/* </div> */}

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

