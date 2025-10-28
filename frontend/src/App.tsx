import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./layout/header.tsx";
import Navbar from "./layout/nav.tsx";
import { useAuth } from "./context/auth.tsx";
import PrivateRoute from "./middleware/private.tsx";
import { SYProvider } from "./layout/syprovider.tsx";
import { ToastContainer } from "react-toastify";
const Dashboard = lazy(() => import("./routes/dash.tsx"));
const KPIs = lazy(() => import("./routes/kpi.tsx"));
const SHSSF2 = lazy(() => import("./routes/shssf2.tsx"));
const SHSSF9 = lazy(() => import("./routes/shssf9.tsx"));
const Students = lazy(() => import("./routes/students.tsx"));
const Advisers = lazy(() => import("./routes/advisers.tsx"));
const Subjects = lazy(() => import("./routes/subjects.tsx"));
const SchoolYearBuilder = lazy(() => import("./routes/schoolyearcreation.tsx"));
const SHSStudentProgress = lazy(() => import("./routes/progress.tsx"));

const TeacherDashboard = lazy(() => import("./routes/teacher/dash.tsx"));
const StudentsByAdviser = lazy(() => import("./routes/teacher/students.tsx"));

export default function App() {
	const { role } = useAuth();

	return (
		<PrivateRoute>
			<SYProvider>
				<div className="relative lg:flex md:flex sm:inline-block bg-gray-50 w-[100vw] min-h-[100vh]">
					<Navbar role={role}/>
					<div className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden">
						<Header />

						<Suspense fallback={<div className="p-4">Loading...</div>}>
							<Routes>
								{role === "admin" ? (
									<>
										<Route path="/" element={<Dashboard />} />
										<Route path="/kpi" element={<KPIs />} />
										<Route path="/shssf2" element={<SHSSF2 />} />
										<Route path="/shssf9" element={<SHSSF9 />} />
										<Route path="/subjects" element={<Subjects />} />
										<Route path="/advisers" element={<Advisers />} />
										<Route path="/students" element={<Students />} />
										<Route path="/createsy" element={<SchoolYearBuilder />} />
										<Route path="/progress" element={<SHSStudentProgress />} />
									</>
								) : (
									<>
										<Route path="/" element={<TeacherDashboard/>} />
										<Route path="/teacher/students" element={<StudentsByAdviser />}/>
									</>
								)}
							</Routes>
						</Suspense>

						<footer className="w-full bg-blue-700 text-white py-4 mt-6 text-center">
							<div className="text-sm md:text-base font-semibold">
								PARANAQUE NATIONAL HIGH SCHOOL
							</div>
							<div className="text-xs text-gray-300 mt-1">
								© {new Date().getFullYear()} All Rights Reserved
							</div>
						</footer>
					</div>
				</div>
				<ToastContainer />
			</SYProvider>
		</PrivateRoute>
	);
}