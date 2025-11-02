import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import SemesterMasterlistTable from "../components/shssf9/SemesterMasterlist";
import SummaryTable from "../components/shssf9/SummaryTable";
import { SF9Analytics } from "../components/shssf9/SF9Analytics";
import RequestHandler from "../lib/utilities/RequestHandler";
import { SemesterMasterlist } from "../lib/type";
import { useSY } from "../layout/syprovider";

export default function SHSSF9() {
    const { currentSY } = useSY();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [grade11Data, setGrade11Data] = useState<SemesterMasterlist[]>([]);
    const [grade12Data, setGrade12Data] = useState<SemesterMasterlist[]>([]);
    const [viewType, __] = useState<"Detailed" | "Summary">("Summary");

    const fetchAdvisers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await RequestHandler.fetchData("GET", `adviser/get-all-shs-sf9-summary?school_year=${currentSY}`);

            if (response.success && Array.isArray(response.data)) {
                const allData = response.data;
                const grade11 = allData.filter((item: any) => item.grade_level === "Grade 11");
                const grade12 = allData.filter((item: any) => item.grade_level === "Grade 12");

                setGrade11Data(grade11);
                setGrade12Data(grade12);
            } else {
                setError(response.message || "Failed to load SHS SF9 data.");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong while fetching SHS SF9 data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdvisers();
    }, [currentSY]);

    const combinedData = useMemo(() => [...grade11Data, ...grade12Data], [grade11Data, grade12Data]);

    const handleDownload = (_: string): void => {
        console.log("Download not implemented yet.");
    };

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen p-4 bg-gray-50 text-gray-800 space-y-6 lg:space-y-0 lg:space-x-6 flex-1 overflow-hidden">
            <motion.div
                className="lg:w-4/6 space-y-6 overflow-y-auto pr-2 h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50 z-50 pb-2 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">SHS SF9 Monitoring Summary</h1>
                        <span className="text-sm text-gray-500">School Year: {currentSY}</span>
                    </div>

                    <div className="flex items-center space-x-4 mr-3">
                        <div className="relative">
                            {/* <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                {viewType} <ChevronDown size={16} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-20">
                                    {["Detailed", "Summary"].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setViewType(type as "Detailed" | "Summary");
                                                setDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            )} */}
                        </div>

                        <button
                            onClick={() => handleDownload(viewType)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105"
                        >
                            <Download size={18} />
                            <span>Download</span>
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm">Loading SHS SF9 data...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-red-500">
                        <p className="font-medium mb-2">{error}</p>
                        <button
                            onClick={fetchAdvisers}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <SemesterMasterlistTable
                            title="GRADE 11 - SF9 SEMESTER MASTERLIST SUMMARY"
                            data={grade11Data}
                            onToggleStatus={(rowIndex: number) => {
                                setGrade11Data((prevData) => {
                                    const newData = [...prevData];
                                    newData[rowIndex].status =
                                        newData[rowIndex].status === "COMPLETE"
                                            ? "INCOMPLETE"
                                            : "COMPLETE";
                                    return newData;
                                });
                            }}
                            delay={0.1}
                        />

                        <SemesterMasterlistTable
                            title="GRADE 12 - SF9 SEMESTER MASTERLIST SUMMARY"
                            data={grade12Data}
                            onToggleStatus={(rowIndex: number) => {
                                setGrade12Data((prevData) => {
                                    const newData = [...prevData];
                                    newData[rowIndex].status =
                                        newData[rowIndex].status === "COMPLETE"
                                            ? "INCOMPLETE"
                                            : "COMPLETE";
                                    return newData;
                                });
                            }}
                            delay={0.3}
                        />

                        <SummaryTable
                            title="Overall Semester Masterlist Summary"
                            combinedData={combinedData}
                        />
                    </>
                )}
            </motion.div>

            <motion.div
                className="lg:w-2/6 bg-white shadow border p-5 rounded-lg space-y-6 overflow-y-auto"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
                {!loading && !error ? (
                    <>
                        <SF9Analytics title="GRADE 11 - SF9 Overview Analytics" data={grade11Data} delay={0.1} />
                        <SF9Analytics title="GRADE 12 - SF9 Overview Analytics" data={grade12Data} delay={0.4} />
                        <SF9Analytics title="COMBINED - SF9 Overview Analytics" data={combinedData} delay={0.8} />
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
