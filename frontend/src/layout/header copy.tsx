// import { Home, Search, Settings, Bell, Users, Bug, Leaf, Box, MessageSquare } from "lucide-react";
// import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
// import { useState, useRef, useEffect, useMemo } from "react";
// const navItems = [
//     { name: "Dashboard", path: "/" },
//     { name: "Key Performance Metrics", path: "/kpi" },
//     { name: "SHS SF2 Monitoring", path: "/shssf2" },
//     { name: "SHS SF9 Monitoring", path: "/shssf9" },
//     { name: "Sprays", path: "/sprays" },
//     { name: "Accounts", path: "/accounts" },
//     { name: "Feedback", path: "/feedback" },
//     { name: "Settings", path: "/settings" },
// ];

// export default function Header() {
//     const navigate = useNavigate();
//     const location = useLocation();
    
//     const currentPage = useMemo(() => {
//         const match = navItems.find(item => item.path === location.pathname);
//         return match ? match.name : "Unknown";
//     }, [location.pathname]);

//     const [loading, setLoading] = useState(false);
//     const [notifications, setNotifications] = useState<any>([]);
//     const [showNotifications, setShowNotifications] = useState(false);
//     const notificationRef = useRef<HTMLDivElement>(null);
//     const notificationModalRef = useRef<HTMLDivElement>(null);
//     const [user, setUser] = useState<any>(null);

//     const [currentPageNotif, setCurrentPage] = useState(1);
//     const itemsPerPage = 3;

//     // For Modal Notification
//     const [selectedNotif, setSelectedNotif] = useState<any>(null);
//     const [showModal, setShowModal] = useState(false);

//     // Use for search
//     const [searchFocused, setSearchFocused] = useState(false);
//     const [showSearch, setShowSearch] = useState(false);
//     const [highlightIndex, setHighlightIndex] = useState(0);
//     const [query, setQuery] = useState("");
//     const [results, setResults] = useState<any[]>([]);

//     useEffect(() => {
//         const storedUser = localStorage.getItem("user");
//         if (storedUser) {
//             setUser(JSON.parse(storedUser));
//         }
//         const handleClickOutside = (event: MouseEvent) => {
//             if (
//                 notificationRef.current &&
//                 !notificationRef.current.contains(event.target as Node) && (
//                     !notificationModalRef.current
//                 )
//             ) {
//                 setShowNotifications(false);
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, []);

//     useEffect(() => {
//         // async function fetchNotifications() {
//         //     if (!user) return;
//         //     setLoading(true);
//         //     try {
//         //         const response = await RequestHandler.fetchData(
//         //             "get",
//         //             `notification/user/${99999}`
//         //         );
//         //         setNotifications(response.notifications || []);
//         //     } catch (err: any) {
//         //         console.error("Notification fetch error:", err);
//         //         showToast(err.message || "Failed to load notifications", "error");
//         //     } finally {
//         //         setLoading(false);
//         //     }
//         // }
//         // fetchNotifications();
//     }, [user]);

//     // useEffect(() => {
//     //     const handleKeyDown = (e: KeyboardEvent) => {
//     //         if (!searchFocused || results.length === 0) return;

//     //         if (e.key === "ArrowDown") {
//     //             e.preventDefault();
//     //             setHighlightIndex((prev) => (prev + 1) % results.length);
//     //         }
//     //         if (e.key === "ArrowUp") {
//     //             e.preventDefault();
//     //             setHighlightIndex((prev) => (prev - 1 + results.length) % results.length);
//     //         }
//     //         if (e.key === "Enter") {
//     //             e.preventDefault();

//     //             if (results.length === 1) {
//     //                 results[0].action();
//     //             } else {
//     //                 results[highlightIndex]?.action();
//     //             }

//     //             setQuery("");
//     //             setResults([]);
//     //             setHighlightIndex(0);
//     //         }
//     //     };

//     //     window.addEventListener("keydown", handleKeyDown);
//     //     return () => window.removeEventListener("keydown", handleKeyDown);
//     // }, [results, highlightIndex, searchFocused]);

//     const searchableItems = [
//         // {
//         //     id: "dashboard",
//         //     type: "link",
//         //     label: "Dashboard",
//         //     description: "Go to your main dashboard",
//         //     icon: <Home size={16} className="text-blue-400" />,
//         //     action: () => navigate("/"),
//         // },
//         // {
//         //     id: "model",
//         //     type: "link",
//         //     label: "Model",
//         //     description: "Manage your AI/ML models",
//         //     icon: <Box size={16} className="text-purple-400" />,
//         //     action: () => navigate("/model"),
//         // },
//         // {
//         //     id: "plants",
//         //     type: "link",
//         //     label: "Plants",
//         //     description: "View and manage plant data",
//         //     icon: <Leaf size={16} className="text-green-400" />,
//         //     action: () => navigate("/plants"),
//         // },
//         // {
//         //     id: "diseases",
//         //     type: "link",
//         //     label: "Diseases",
//         //     description: "Track and analyze plant diseases",
//         //     icon: <Bug size={16} className="text-red-400" />,
//         //     action: () => navigate("/diseases"),
//         // },
//         // {
//         //     id: "accounts",
//         //     type: "link",
//         //     label: "Accounts",
//         //     description: "Manage user accounts",
//         //     icon: <Users size={16} className="text-indigo-400" />,
//         //     action: () => navigate("/accounts"),
//         // },
//         // {
//         //     id: "feedback",
//         //     type: "link",
//         //     label: "Feedback",
//         //     description: "View user feedback",
//         //     icon: <MessageSquare size={16} className="text-pink-400" />,
//         //     action: () => navigate("/feedback"),
//         // },
//         // {
//         //     id: "settings",
//         //     type: "link",
//         //     label: "Settings",
//         //     description: "Go to system settings page",
//         //     icon: <Settings size={16} className="text-yellow-400" />,
//         //     action: () => navigate("/settings"),
//         // },
//         // {
//         //     id: "notifications",
//         //     type: "modal",
//         //     label: "Notifications",
//         //     description: "Check your recent alerts",
//         //     icon: <Bell size={16} className="text-red-400" />,
//         //     action: () => setShowNotifications(true),
//         // },
//     ];


//     useEffect(() => {
//         // if (query.trim() === "") {
//         //     setResults([]);
//         // } else {
// 		// 	setShowNotifications(false);
//         //     setResults(
//         //         searchableItems.filter((item) =>
//         //             item.label.toLowerCase().includes(query.toLowerCase())
//         //         )
//         //     );
//         // }
//     }, [query]);

//     return (
//         <>
//             <header className="w-full bg-blue-900/80 text-white px-4 py-3 flex items-center justify-between shadow-md">
//                 <div className="flex items-center space-x-3">
//                     <div className="p-2 bg-blue-900 rounded-lg">
//                         <Home size={20} className="text-blue-400" />
//                     </div>
//                     <span className="text-lg font-semibold">{currentPage}</span>
//                 </div>

//                 <div className="flex items-center space-x-3 md:space-x-5">
//                     <div className="relative hidden md:block">
//                         <input
//                             type="text"
//                             placeholder="Search..."
//                             value={query}
//                             onChange={(e) => {
//                                 setQuery(e.target.value);
//                                 setHighlightIndex(0);
//                             }}
//                             onFocus={() => setSearchFocused(true)}
//                             onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
//                             className="bg-gray-100 text-gray-700 text-sm px-3 py-2 w-64 rounded-md 
//                             focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
//                         />
// {/* 
//                         {searchFocused && query.trim() !== "" && results.length > 0 && (
//                             <div className="absolute mt-1 w-64 bg-gray-500 border border-gray-500 rounded-md shadow-xl z-50 overflow-hidden animate-fade-in">
//                                 {results.map((item, index) => (
//                                     <div
//                                         key={item.id}
//                                         className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition 
//                                             ${highlightIndex === index ? "bg-blue-700/70" : "hover:bg-blue-700/50"}`}
//                                         onClick={() => {
//                                             item.action();
//                                             setQuery("");
//                                             setResults([]);
//                                             setHighlightIndex(0);
//                                         }}
//                                     >
//                                         <span className="text-lg">{item.icon}</span>

//                                         <div className="flex-1">
//                                             <span className="block text-white font-medium">{item.label}</span>
//                                             <span className="block text-xs text-gray-400">
//                                                 {item.description}
//                                             </span>
//                                         </div>

//                                         <span
//                                             className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.type === "link"
//                                                     ? "bg-blue-900 text-blue-300"
//                                                     : "bg-purple-900 text-purple-300"
//                                                 }`}
//                                         >
//                                             {item.type}
//                                         </span>
//                                     </div>
//                                 ))}
//                             </div>
//                         )} */}
//                     </div>
//                     <div className="p-2 hidden md:block bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-300 transition"
//                         onClick={() => setShowSearch(true)}>
//                         <Search size={20} />
//                     </div>

//                     <NavLink
//                         to="/settings"
//                         className="p-2 bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-300 transition"
//                     >
//                         <Settings size={20} />
//                     </NavLink>

//                     {/* <div className="relative" ref={notificationRef}> */}
//                         {/* <button
//                             className="p-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-green-700 transition duration-200 ease-in-out shadow-md"
//                             onClick={() => setShowNotifications(!showNotifications)}
//                         >
//                             <Bell size={20} className="text-white" />
//                             {notifications.filter((n: any) => !n.isRead).length > 0 && (
//                                 <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white px-1.5 py-0.5 rounded-full shadow-sm">
//                                     {notifications.filter((n: any) => !n.isRead).length}
//                                 </span>
//                             )}
//                         </button> */}

//                         {/* {showNotifications && (
//                             <div className="absolute right-0 mt-2 w-100 bg-gray-900 shadow-xl rounded-lg p-4 text-white text-sm border border-gray-700 z-50 animate-fade-in">
//                                 <h3 className="text-md font-semibold border-b border-gray-700 pb-2 mb-2">
//                                     Notifications
//                                 </h3>

//                                 {loading ? (
//                                     <div className="flex justify-center items-center py-6">
//                                         <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
//                                     </div>
//                                 ) : notifications.length === 0 ? (
//                                     <p className="text-gray-400 text-center py-4">
//                                         No notifications found
//                                     </p>
//                                 ) : (
//                                     <ul className="space-y-2 max-h-64 overflow-y-auto">
//                                         {[...notifications]
//                                             .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
//                                             .slice((currentPageNotif - 1) * itemsPerPage, currentPageNotif * itemsPerPage)
//                                             .map((notif: any) => {
//                                                 const typeColors: Record<string, string> = {
//                                                     info: "from-blue-900/30 to-blue-800/20 border-l-4 border-blue-400",
//                                                     warning: "from-yellow-900/30 to-yellow-800/20 border-l-4 border-yellow-400",
//                                                     success: "from-green-900/30 to-green-800/20 border-l-4 border-green-400",
//                                                     error: "from-red-900/30 to-red-800/20 border-l-4 border-red-500",
//                                                     system: "from-purple-900/30 to-purple-800/20 border-l-4 border-purple-400",
//                                                 };

//                                                 const typeIcons: Record<string, string> = {
//                                                     info: "ℹ️",
//                                                     warning: "⚠️",
//                                                     success: "✅",
//                                                     error: "❌",
//                                                     system: "⚙️",
//                                                 };

//                                                 return (
//                                                     <li
//                                                         key={notif.id}
//                                                         onClick={() => {
//                                                             setSelectedNotif(notif);
//                                                             setShowModal(true);

//                                                             if (!notif.isRead) {
//                                                                 setNotifications((prev: any[]) =>
//                                                                     prev.map((n) =>
//                                                                         n.id === notif.id ? { ...n, isRead: true } : n
//                                                                     )
//                                                                 );
//                                                                 RequestHandler.fetchData("put", `notification/mark-read/${notif.id}`)
//                                                                     .catch((err) => console.error("Failed to mark read:", err));
//                                                             }
//                                                         }}
//                                                         className={`flex items-start gap-2 p-3 rounded-lg transition duration-150 cursor-pointer bg-gradient-to-r ${typeColors[notif.type]} hover:brightness-110`}
//                                                     >
//                                                         <span className="text-lg">{typeIcons[notif.type]}</span>
//                                                         <div className="flex-1">
//                                                             <span className="block font-medium">{notif.title}</span>
//                                                             <span className="block text-gray-400 text-xs">
//                                                                 {notif.message.length > 50
//                                                                     ? notif.message.slice(0, 50) + "..."
//                                                                     : notif.message}
//                                                             </span>
//                                                             <span className="block text-gray-500 text-xs mt-1">
//                                                                 {new Date(notif.createdAt).toLocaleString()}
//                                                             </span>
//                                                         </div>
//                                                         {!notif.isRead && (
//                                                             <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
//                                                         )}
//                                                     </li>
//                                                 );
//                                             })}
//                                     </ul>
//                                 )} */}

//                                 {/* <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
//                                     <button
//                                         onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                                         disabled={currentPageNotif === 1}
//                                         className={`px-2 py-1 rounded ${currentPageNotif === 1 ? "opacity-20 select-none" : "hover:bg-gray-700"
//                                             }`}
//                                     >
//                                         Prev
//                                     </button>
//                                     <span>
//                                         Page {currentPageNotif} of {Math.ceil(notifications.length / itemsPerPage)}
//                                     </span>
//                                     <button
//                                         onClick={() =>
//                                             setCurrentPage((p) =>
//                                                 p < Math.ceil(notifications.length / itemsPerPage) ? p + 1 : p
//                                             )
//                                         }
//                                         disabled={currentPageNotif === Math.ceil(notifications.length / itemsPerPage)}
//                                         className={`px-2 py-1 rounded ${currentPageNotif === Math.ceil(notifications.length / itemsPerPage)
//                                             ? "opacity-20 select-none"
//                                             : "hover:bg-gray-700"
//                                             }`}
//                                     >
//                                         Next
//                                     </button>
//                                 </div>
//                             </div>
//                         )} */}

//                     {/* </div> */}

//                     {user &&
//                         (user.profileImage ? (
//                             <img
//                                 src={user.profileImage}
//                                 alt="User Profile"
//                                 className="w-10 h-10 rounded-full object-cover border-2 border-green-300"
//                             />
//                         ) : (
//                             <div className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-full text-white font-semibold">
//                                 {user.username
//                                     .split(" ")
//                                     .map((n: any) => n[0])
//                                     .join("")
//                                     .toUpperCase()}
//                             </div>
//                         ))}
//                 </div>
//             </header>
//             <div className="w-full bg-blue-900/50 py-2 px-6 text-sm text-gray-300/50">
//                 <Link
//                     to="/"
//                     className="hover:text-gray-50 transition-colors duration-200"
//                 >
//                     DASHBOARD
//                 </Link>
//                 {currentPage !== "Dashboard" && (
//                     <> / {currentPage}</>
//                 )}
//             </div>

//             {showModal && selectedNotif && (
//                 <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
//                     <div className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 
//                     border border-gray-700 rounded-2xl shadow-2xl w-[28rem] p-6 
//                     animate-fade-in-up" ref={notificationModalRef}>

//                         <button
//                             onClick={() => setShowModal(false)}
//                             className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
//                         >
//                             ✕
//                         </button>

//                         <h2
//                             className={`text-xl font-semibold mb-3 ${selectedNotif.type === "info"
//                                 ? "text-blue-400"
//                                 : selectedNotif.type === "warning"
//                                     ? "text-yellow-400"
//                                     : selectedNotif.type === "success"
//                                         ? "text-green-400"
//                                         : selectedNotif.type === "error"
//                                             ? "text-red-400"
//                                             : "text-purple-400"
//                                 }`}
//                         >
//                             {selectedNotif.title}
//                         </h2>


//                         <p className="text-gray-300 leading-relaxed">
//                             {selectedNotif.message}
//                         </p>

//                         <p className="text-xs text-gray-500 mt-4 border-t border-gray-700 pt-2">
//                             {new Date(selectedNotif.createdAt).toLocaleString()}
//                         </p>

//                         <div className="mt-5 flex justify-end gap-3 text-white">
//                             <button
//                                 onClick={() => setShowModal(false)}
//                                 className="px-4 py-2 rounded-lg bg-gray-700 text-sm hover:bg-gray-600 transition"
//                             >
//                                 Close
//                             </button>
//                             <button
//                                 onClick={() => {
//                                     setShowModal(false);
//                                 }}
//                                 className="px-4 py-2 rounded-lg bg-green-600 text-sm hover:bg-green-500 transition shadow-md text-white"
//                             >
//                                 Got it
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

// 			{showSearch && (
// 				<div className="fixed inset-0 bg-black/90 bg-opacity-70 flex items-start justify-center z-50 p-4">
// 					<div className="bg-gray-50 w-full max-w-lg rounded-lg shadow-lg p-4 relative">
// 						<input
// 							type="text"
// 							autoFocus
// 							value={query}
// 							onChange={(e) => {
// 								setQuery(e.target.value);
// 								setHighlightIndex(0); 
// 							}}
// 							placeholder="Search anything..."
// 							className="w-full px-4 py-2 rounded-md bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
// 							onKeyDown={(e) => {
// 								if (results.length === 0) return;

// 								if (e.key === "ArrowDown") {
// 									e.preventDefault();
// 									setHighlightIndex((prev) => (prev + 1) % results.length);
// 								}
// 								if (e.key === "ArrowUp") {
// 									e.preventDefault();
// 									setHighlightIndex((prev) => (prev - 1 + results.length) % results.length);
// 								}
// 								if (e.key === "Enter") {
// 									e.preventDefault();
// 									if (results.length === 1) {
// 										results[0].action();
// 									} else {
// 										results[highlightIndex]?.action();
// 									}
// 									setShowSearch(false);
// 									setQuery("");
// 								}
// 								if (e.key === "Escape") {
// 									setShowSearch(false);
// 								}
// 							}}
// 						/>

// 						<div className="mt-3">
// 							{query.trim() === "" ? (
// 								<p className="text-gray-500 text-sm text-center py-6">
// 									Type something to search...
// 								</p>
// 							) : (
// 								results.map((item, index) => (
// 									<div
// 										key={item.id}
// 										className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition mb-1
// 								${highlightIndex === index
// 												? "bg-green-700/70"
// 												: "hover:bg-green-700/50 group"
// 											}`}
// 										onClick={() => {
// 											item.action();
// 											setShowSearch(false);
// 											setQuery("");
// 										}}
// 									>
// 										<span className="text-xl">{item.icon}</span>

// 										<div className="flex-1">
// 											<span className={`block font-medium text-white ${highlightIndex === index ? "text-green-300" : "group-hover:text-green-300"
// 												}`}>
// 												{item.label}
// 											</span>
// 											<span className="block text-xs text-gray-400">{item.description}</span>
// 										</div>

// 										<span
// 											className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.type === "link"
// 													? "bg-blue-900 text-blue-300"
// 													: "bg-blue-900 text-blue-300"
// 												}`}
// 										>
// 											{item.type}
// 										</span>
// 									</div>
// 								))
// 							)}
// 						</div>

// 						<button
// 							onClick={() => setShowSearch(false)}
// 							className="absolute top-4 right-4 text-gray-400 hover:text-white"
// 						>
// 							✖
// 						</button>
// 					</div>
// 				</div>
// 			)}


//         </>
//     );
// }

