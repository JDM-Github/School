import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
	Menu,
	Home,
	Users,
	BarChart2,
	LogOut,
	BookOpen,
	PlusCircle,
	TrendingUp,
	UserCheck,
	RefreshCcw,
} from "lucide-react";
import Cookies from "js-cookie";
import ChangeSYModal from "../components/changesy";

const adminNavItems = [
	{ name: "Dashboard", icon: <Home size={20} />, path: "/" },
	{ name: "Subjects", icon: <BookOpen size={20} />, path: "/subjects" },
	{ name: "Create SY", icon: <PlusCircle size={20} />, path: "/createsy" },
	{ name: "Change SY", icon: <RefreshCcw size={20} />, path: null }, 
	{ name: "Progress", icon: <TrendingUp size={20} />, path: "/progress" },
	{ name: "Advisers", icon: <UserCheck size={20} />, path: "/advisers" },
	{ name: "Students", icon: <Users size={20} />, path: "/students" },
	{ name: "KPIs", icon: <BarChart2 size={20} />, path: "/kpi" },
	{ name: "SHS SF2", icon: <Users size={20} />, path: "/shssf2" },
	{ name: "SHS SF9", icon: <Users size={20} />, path: "/shssf9" },
	{ name: "Logout", icon: <LogOut size={20} />, path: "/logout" },
];

const teacherNavItems = [
	{ name: "Dashboard", icon: <Home size={20} />, path: "/" },
	{ name: "Change SY", icon: <RefreshCcw size={20} />, path: null }, 
	{ name: "My Students", icon: <Users size={20} />, path: "/teacher/students" },
	{ name: "Logout", icon: <LogOut size={20} />, path: "/logout" },
];

export default function Navbar({ role }: { role: string | null}) {
	const [active, setActive] = useState("Dashboard");
	const [menuOpen, setMenuOpen] = useState(false);
	const [openSYModal, setOpenSYModal] = useState(false);

	const navItems = role === "teacher" ? teacherNavItems : adminNavItems;
	const navigate = useNavigate();
	const handleLogout = () => {
		Cookies.remove("token");
		localStorage.removeItem("user");
		navigate("/");
		window.location.reload(); 
	}

	return (
		<header className="z-50">
			<aside className="hidden lg:flex h-screen w-80 bg-gradient-to-b from-gray-300 to-gray-300/80 text-white flex-col shadow-lg border-r-2 border-blue-700/20">
				<div className="flex flex-col items-center mb-8 mt-3">
					<img
						src="/icon.png"
						alt="Logo"
						className="w-48 h-48 bg-gray-50 p-3 rounded-full shadow-xl border-4 border-blue-300"
					/>
				</div>

				<nav className="flex-1">
					<ul>
						{navItems.map((item) => (
							<li key={item.name} className="py-1">
								{item.name === "Logout" ? (
									<button
										onClick={handleLogout}
										className="flex items-center w-full py-3 p-5 hover:bg-gray-400 transition-all"
									>
										<span className="text-blue-700 mr-4">{item.icon}</span>
										<span className="text-gray-800 text-md">{item.name}</span>
									</button>
								) : item.path ? (
									<NavLink
										to={item.path}
										className={({ isActive }) =>
											`flex items-center w-full py-3 p-5 border-blue-400 transition-all ${isActive
												? "border-l-4 bg-gradient-to-r from-gray-400 to-gray-300 text-white"
												: "hover:bg-gray-400"
											}`
										}
									>
										<span className="text-blue-700 mr-4">{item.icon}</span>
										<span className="text-gray-800 text-md">{item.name}</span>
									</NavLink>
								) : (
									<button
										onClick={() => setOpenSYModal(true)}
										className="flex items-center w-full py-3 p-5 hover:bg-gray-400 transition-all"
									>
										<span className="text-blue-700 mr-4">{item.icon}</span>
										<span className="text-gray-800 text-md">{item.name}</span>
									</button>
								)}
							</li>
						))}

					</ul>
				</nav>
			</aside>

			{/* Mobile Navbar */}
			<div className="inline-block md:hidden lg:hidden min-w-screen bg-gray-900">
				<div className="container mx-auto py-1 flex items-center justify-between">
					<img src="/LOGO TEXT.webp" alt="Logo" className="h-10 w-auto" />
					<button
						onClick={() => setMenuOpen(!menuOpen)}
						className="p-2 text-white hover:scale-110 transition-transform"
					>
						<Menu size={28} />
					</button>
				</div>

				{menuOpen && (
					<div className="bg-gray-800 absolute top-16 left-0 w-full animate-slide-in z-20">
						<ul className="flex flex-col items-start">
							{navItems.map((item) => (
								<li key={item.name} className="w-full">
									{item.name === "Logout" ? (
										<button
											onClick={() => {
												setMenuOpen(false);
												handleLogout();
											}}
											className="flex items-center w-full px-5 py-3 hover:bg-gray-700 transition-all"
										>
											<span className="text-blue-400 mr-4">{item.icon}</span>
											<span className="text-gray-200 text-md">{item.name}</span>
										</button>
									) : item.path ? (
										<button
											onClick={() => {
												setActive(item.name);
												setMenuOpen(false);
												navigate(item.path);
											}}
											className={`flex items-center w-full px-5 py-3 transition-all duration-300 ease-in-out ${active === item.name
													? "bg-gradient-to-r from-gray-900 to-blue-900 text-white"
													: "hover:bg-gray-700"
												}`}
										>
											<span className="text-blue-400 mr-4">{item.icon}</span>
											<span className="text-gray-200 text-md">{item.name}</span>
										</button>
									) : (
										<button
											onClick={() => {
												setMenuOpen(false);
												setOpenSYModal(true);
											}}
											className="flex items-center w-full px-5 py-3 hover:bg-gray-700 transition-all"
										>
											<span className="text-blue-400 mr-4">{item.icon}</span>
											<span className="text-gray-200 text-md">{item.name}</span>
										</button>
									)}

								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			<ChangeSYModal open={openSYModal} onOpenChange={setOpenSYModal} />
		</header>
	);
}
