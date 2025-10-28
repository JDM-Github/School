import { motion } from "framer-motion";
import { Download, Loader2 } from "lucide-react";
import AdviserResponseTable from "../components/shssf2/AdviserResponseTable";
import { AdviserResponseAnalytics } from "../components/shssf2/AdviserResponseAnalytics";
import { useEffect, useMemo, useState } from "react";
import AdviserGroupSummaryTable from "../components/shssf2/AdviserGroupSummaryTable";
import RequestHandler from "../lib/utilities/RequestHandler";
import { useSY } from "../layout/syprovider";

interface GradeItem {
    grade_level?: string;
    section: string;
    program: string;
    adviser: string;
    months: string[];
}

type GradeData = GradeItem[];

export default function SHSSF2() {
    const { currentSY } = useSY();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [grade11Data, setGrade11Data] = useState<GradeData>([]);
    const [grade12Data, setGrade12Data] = useState<GradeData>([]);

    useEffect(() => {
        const fetchAdvisers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await RequestHandler.fetchData("GET", `adviser/get-all-shs-sf2-summary?school_year=${currentSY}`);

                if (response.success && Array.isArray(response.data)) {
                    const allData = response.data;
                    const grade11 = allData.filter((item: any) => item.grade_level === "Grade 11");
                    const grade12 = allData.filter((item: any) => item.grade_level === "Grade 12");

                    setGrade11Data(grade11);
                    setGrade12Data(grade12);
                } else {
                    setError(response.message || "Failed to load SHS SF2 data");
                }
            } catch (err: any) {
                setError(err.message || "Something went wrong while fetching SHS SF2 data");
            } finally {
                setLoading(false);
            }
        };

        fetchAdvisers();
    }, [currentSY]);

    const combinedData = useMemo(() => [...grade11Data, ...grade12Data], [grade11Data, grade12Data]);

    // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = event.target.files?.[0];
    //     if (file) {
    //         console.log("Uploaded file:", file.name);
    //         alert(`✅ ${file.name} uploaded successfully! (backend integration coming soon)`);
    //     }
    // };

    const handleDownload = () => {
        alert("📥 Download feature coming soon!");
    };

    return (
        <div className="flex flex-col lg:flex-row w-full p-4 bg-gray-50 text-gray-800 space-y-6 lg:space-y-0 lg:space-x-6">
            <motion.div
                className="lg:w-4/6 space-y-6 min-h-[90vh]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">SHS SF2 Monitoring</h1>
                        <span className="text-sm text-gray-500">School Year: {currentSY}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* <label
                            htmlFor="advisee-upload"
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all duration-300 ease-in-out hover:scale-105"
                        >
                            <Upload size={18} />
                            <span>Upload SHS SF2</span>
                        </label> */}
                        {/* <input
                            id="advisee-upload"
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            onChange={handleFileUpload}
                        /> */}
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105"
                        >
                            <Download size={18} />
                            <span>Download</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-[50vh]">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <span className="ml-3 text-gray-600 font-medium">Loading SHS SF2 data...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col justify-center items-center h-[50vh] text-red-600">
                        <p className="font-semibold mb-2 text-lg">❌ {error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        <AdviserResponseTable
                            title="GRADE 11 ADVISER RESPONSES"
                            gradeLevel="GRADE 11"
                            data={grade11Data}
                            onToggleEncode={(rowIndex, monthIndex) => {
                                setGrade11Data((prev) =>
                                    prev.map((item, i) =>
                                        i === rowIndex
                                            ? {
                                                ...item,
                                                months: item.months.map((m, j) =>
                                                    j === monthIndex ? (m === "ENCODED" ? "NOT ENCODED" : "ENCODED") : m
                                                ),
                                            }
                                            : item
                                    )
                                );
                            }}
                            delay={0.1}
                        />

                        <AdviserResponseTable
                            title="GRADE 12 ADVISER RESPONSES"
                            gradeLevel="GRADE 12"
                            data={grade12Data}
                            onToggleEncode={(rowIndex, monthIndex) => {
                                setGrade12Data((prev) =>
                                    prev.map((item, i) =>
                                        i === rowIndex
                                            ? {
                                                ...item,
                                                months: item.months.map((m, j) =>
                                                    j === monthIndex ? (m === "ENCODED" ? "NOT ENCODED" : "ENCODED") : m
                                                ),
                                            }
                                            : item
                                    )
                                );
                            }}
                            delay={0.3}
                        />

                        <AdviserGroupSummaryTable
                            title="Overall Adviser Response Summary by Group"
                            data={combinedData}
                            delay={0.5}
                        />
                    </>
                )}
            </motion.div>
            {!loading && !error && (
                <motion.div
                    className="lg:w-2/6 bg-white shadow border p-5 rounded-lg space-y-6 h-fit"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                >
                    <AdviserResponseAnalytics title="Grade 11 Adviser Response Analytics" color="#2563eb" data={grade11Data} />
                    <AdviserResponseAnalytics title="Grade 12 Adviser Response Analytics" color="#16a34a" data={grade12Data} />
                    <AdviserResponseAnalytics title="Overall Adviser Response Analytics" color="#10b981" data={combinedData} />
                </motion.div>
            )}
        </div>
    );
}
