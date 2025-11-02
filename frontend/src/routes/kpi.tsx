import { motion } from "framer-motion";
import { Calculator, Download } from "lucide-react";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
import { Formula } from "../components/kpi/Formula";
import { KpiLeaverGroup } from "../components/kpi/KpiLeaverGroup";
import { KpiEnrollmentGroup } from "../components/kpi/KpiEnrollment";
import { KpiGraduationGroup } from "../components/kpi/KpiGraduationGroup";
import { KpiDropoutGroup } from "../components/kpi/KpiDropoutGroup";
import { useEffect, useState } from "react";
import RequestHandler from "../lib/utilities/RequestHandler";
import { useSY } from "../layout/syprovider";

export default function KPIs() {
    const { currentSY } = useSY();

    const [_, setKpiData] = useState({
        enrollment: {},
        graduation: {},
        dropout: {},
        leaver: {},
    });

    const [enrollmentData, setEnrollmentData] = useState<{
        bosyTotal: string; bosyAge1617: string; projected: string;
    }>({ bosyTotal: "0", bosyAge1617: "0", projected: "0" });
    const [graduationData, setGraduationData] = useState({ graduates: "0", bosyG12: "0" });
    const [dropoutData, setDropoutData] = useState({ dropOut: "0", bosy: "0" });
    const [leaverData, setLeaverData] = useState({
        bosyPrev: "0",
        bosyCurr: "0",
        repeatersPrev: "0",
        repeatersCurr: "0",
    });

    useEffect(() => {
        const fetchKpi = async () => {
            try {
                const response = await RequestHandler.fetchData(
                    "GET",
                    `student/kpi?currentSchoolYear=${encodeURIComponent(currentSY)}`
                );
                if (response.success) {
                    const kpi = response.kpi;
                    setKpiData(kpi);

                    if (kpi.enrollment) setEnrollmentData({
                        bosyTotal: kpi.enrollment.bosyTotal?.toString() || "0",
                        bosyAge1617: kpi.enrollment.bosyAge1617?.toString() || "0",
                        projected: kpi.enrollment.projected?.toString() || "0",
                    });

                    if (kpi.graduation) setGraduationData({
                        graduates: kpi.graduation.graduates?.toString() || "0",
                        bosyG12: kpi.graduation.bosyG12?.toString() || "0",
                    });

                    if (kpi.dropout) setDropoutData({
                        dropOut: kpi.dropout.dropOut?.toString() || "0",
                        bosy: kpi.dropout.bosy?.toString() || "0",
                    });

                    if (kpi.leaver) setLeaverData({
                        bosyPrev: kpi.leaver.bosyPrev?.toString() || "0",
                        bosyCurr: kpi.leaver.bosyCurr?.toString() || "0",
                        repeatersPrev: kpi.leaver.repeatersPrev?.toString() || "0",
                        repeatersCurr: kpi.leaver.repeatersCurr?.toString() || "0",
                    });
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchKpi();
    }, [currentSY]);

    
    // const [transitionData, setTransitionData] = useState({
    //     g11Bosy: "0",
    //     g11Repeaters: "0",
    //     g10EnrollmentPrev: "0",
    // });
    // const [retentionData, setRetentionData] = useState({
    //     shsPrev: "0",
    //     retained: "0",
    //     shsCurr: "0",
    // });

    // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = event.target.files?.[0];
    //     if (!file) return;

    //     const reader = new FileReader();
    //     reader.onload = (e) => {
    //         const data = e.target?.result;
    //         if (!data) return;

    //         const workbook = XLSX.read(data, { type: "array" });
    //         const sheet = workbook.Sheets[workbook.SheetNames[0]];
    //         const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    //         const KPI_KEY_MAP: Record<string, string[]> = {
    //             "BOSY Enrollment SY 2024-2025": ["enrollmentrate", "dropoutrate", "leaverrate"],
    //             "BOSY Enrollment SY 2024-2025 (aged 16-17)": ["enrollmentrate"],
    //             "Projected Population of aged 16-17 from DepEd Central Office": ["enrollmentrate"],
    //             "Gross Enrollment Rate": ["enrollmentrate"],
    //             "Net Enrollment Rate": ["enrollmentrate"],
    //             "Graduates": ["graduationrate"],
    //             "G12 BOSY Enrollment SY 2024-2025": ["graduationrate"],
    //             "Graduate Rate": ["graduationrate"],
    //             "Drop-Out": ["dropoutrate"],
    //             "Drop-Out Rate": ["dropoutrate"],
    //             "BOSY Enrollment SY 2023-2024": ["leaverrate"],
    //             "Repeater SY 2023-2024": ["leaverrate"],
    //             "Repeater SY 2024-2025": ["leaverrate"],
    //             "Leaver Rate": ["leaverrate"],
    //             "G11 BOSY Enrollment SY 2024-2025": ["transitionrate"],
    //             "G11 Repeater SY 2024-2025": ["transitionrate"],
    //             "New Entrants (G11 BOSY Enrollment - G11 Repeater)": ["transitionrate"],
    //             "Grade 10 Enrollment SY 2023-2024": ["transitionrate"],
    //             "Transition Rate": ["transitionrate"],
    //             "SHS SY 2023-2024": ["retentionrate"],
    //             "Retained SY 2024-2025": ["retentionrate"],
    //             "SHS SY 2024-2025": ["retentionrate"],
    //             "Retention Rate": ["retentionrate"],
    //         };

    //         let kpiData: Record<string, Record<string, string>> = {
    //             enrollmentrate: {},
    //             graduationrate: {},
    //             dropoutrate: {},
    //             leaverrate: {},
    //             transitionrate: {},
    //             retentionrate: {},
    //         };

    //         const processedKeysPerGroup: Record<string, Set<string>> = {
    //             enrollmentrate: new Set(),
    //             graduationrate: new Set(),
    //             dropoutrate: new Set(),
    //             leaverrate: new Set(),
    //             transitionrate: new Set(),
    //             retentionrate: new Set(),
    //         };

    //         for (let row of rows) {
    //             const key = (row[0] || "").toString().trim();
    //             const value = (row[1] || "").toString().trim();
    //             if (!key) continue;

    //             const groups = KPI_KEY_MAP[key];
    //             if (!groups) continue;

    //             for (let g of groups) {
    //                 if (!processedKeysPerGroup[g].has(key)) {
    //                     kpiData[g][key] = value;
    //                     processedKeysPerGroup[g].add(key);
    //                 }
    //             }
    //         }

    //         if (kpiData.enrollmentrate) {
    //             setEnrollmentData((prev) => ({
    //                 bosyTotal: kpiData.enrollmentrate["BOSY Enrollment SY 2024-2025"] || prev.bosyTotal,
    //                 bosyAge1617: kpiData.enrollmentrate["BOSY Enrollment SY 2024-2025 (aged 16-17)"] || prev.bosyAge1617,
    //                 projected: kpiData.enrollmentrate["Projected Population of aged 16-17 from DepEd Central Office"] || prev.projected,
    //             }));
    //         }

    //         if (kpiData.graduationrate) {
    //             setGraduationData((prev) => ({
    //                 graduates: kpiData.graduationrate["Graduates"] || prev.graduates,
    //                 bosyG12: kpiData.graduationrate["G12 BOSY Enrollment SY 2024-2025"] || prev.bosyG12,
    //             }));
    //         }

    //         if (kpiData.dropoutrate) {
    //             setDropoutData((prev) => ({
    //                 dropOut: kpiData.dropoutrate["Drop-Out"] ?? prev.dropOut,
    //                 bosy: kpiData.dropoutrate["BOSY Enrollment SY 2024-2025"] ?? prev.bosy,
    //             }));
    //         }

    //         if (kpiData.leaverrate) {
    //             setLeaverData((prev) => ({
    //                 bosyPrev: kpiData.leaverrate["BOSY Enrollment SY 2023-2024"] ?? prev.bosyPrev,
    //                 bosyCurr: kpiData.leaverrate["BOSY Enrollment SY 2024-2025"] ?? prev.bosyCurr,
    //                 repeatersPrev: kpiData.leaverrate["Repeater SY 2023-2024"] ?? prev.repeatersPrev,
    //                 repeatersCurr: kpiData.leaverrate["Repeater SY 2024-2025"] ?? prev.repeatersCurr,
    //             }));
    //         }

    //         // if (kpiData.transitionrate) {
    //         //     setTransitionData((prev) => ({
    //         //         g11Bosy: kpiData.transitionrate["G11 BOSY Enrollment SY 2024-2025"] ?? prev.g11Bosy,
    //         //         g11Repeaters: kpiData.transitionrate["G11 Repeater SY 2024-2025"] ?? prev.g11Repeaters,
    //         //         g10EnrollmentPrev: kpiData.transitionrate["Grade 10 Enrollment SY 2023-2024"] ?? prev.g10EnrollmentPrev,
    //         //     }));
    //         // }

    //         // if (kpiData.retentionrate) {
    //         //     setRetentionData((prev) => ({
    //         //         shsPrev: kpiData.retentionrate["SHS SY 2023-2024"] ?? prev.shsPrev,
    //         //         retained: kpiData.retentionrate["Retained SY 2024-2025"] ?? prev.retained,
    //         //         shsCurr: kpiData.retentionrate["SHS SY 2024-2025"] ?? prev.shsCurr,
    //         //     }));
    //         // }
    //     };
    //     reader.readAsArrayBuffer(file);
    // };

    // const handleDownload = () => {
    //     const rows: any[] = [];

    //     rows.push([{ A: "KEY PERFORMANCE INDICATORS (KPIs)" }], []);

    //     const addKpiGroup = (title: string, values: Record<string, string>) => {
    //         rows.push([{ A: title }]);
    //         Object.entries(values).forEach(([key, value]) => {
    //             rows.push([{ A: key, B: value }]);
    //         });
    //         rows.push([]);
    //     };

    //     addKpiGroup("ENROLLMENT RATE", kpiData.enrollment);
    //     addKpiGroup("GRADUATION RATE", kpiData.graduation);
    //     addKpiGroup("DROP-OUT RATE", kpiData.dropout);
    //     addKpiGroup("LEAVER RATE", kpiData.leaver);
    //     // addKpiGroup("TRANSITION RATE", kpiData.transition);
    //     // addKpiGroup("RETENTION RATE", kpiData.retention);

    //     const ws = XLSX.utils.json_to_sheet(
    //         rows.map((r) => ({ ...r[0] })),
    //         { skipHeader: true }
    //     );

    //     const wb = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(wb, ws, "KPIs");
    //     const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    //     saveAs(new Blob([wbout], { type: "application/octet-stream" }), "shs_kpi_data.xlsx");
    // };

    return (
        <div className="flex flex-col lg:flex-row w-full p-4 bg-gray-0 text-gray-800 space-y-6 lg:space-y-0 lg:space-x-6">
            <motion.div
                className="lg:w-3/4 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Key Performance Indicators (KPIs)
                        </h1>
                        <span className="text-sm text-gray-500">School Year: {currentSY}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center gap-2">
                            {/* <label
                                htmlFor="kpi-upload"
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all duration-300 ease-in-out hover:scale-105"
                            >
                                <Upload size={18} />
                                <span>Upload SHS KPI</span>
                            </label>
                            <input
                                id="kpi-upload"
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                // onChange={handleFileUpload}
                            /> */}

                            <button
                                // onClick={handleDownload}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105"
                            >
                                <Download size={18} />
                                <span>Download XLSX</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-[75vh] overflow-y-auto pr-3 scrollbar-thin">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <KpiEnrollmentGroup
                            schoolYear={currentSY}
                            enrollmentData={enrollmentData}
                            setEnrollmentData={setEnrollmentData}
                            onDataChange={(values) => setKpiData((p) => ({ ...p, enrollment: values }))}
                        />
                        <KpiGraduationGroup
                            schoolYear={currentSY}
                            graduationData={graduationData}
                            setGraduationData={setGraduationData}
                            onDataChange={(values) => setKpiData((prev) => ({ ...prev, graduation: values }))}
                        />
                        <KpiDropoutGroup
                            schoolYear={currentSY}
                            dropoutData={dropoutData}
                            setDropoutData={setDropoutData}
                            onDataChange={(values) => setKpiData((prev) => ({ ...prev, dropout: values }))}
                        />
                        <KpiLeaverGroup
                            schoolYear={currentSY}
                            leaverData={leaverData}
                            setLeaverData={setLeaverData}
                            onDataChange={(values) => setKpiData((prev) => ({ ...prev, leaver: values }))}
                        />
                        {/* <KpiTransitionGroup
                            schoolYear={schoolYear}
                            transitionData={transitionData}
                            setTransitionData={setTransitionData}
                            onDataChange={(values) => setKpiData((prev) => ({ ...prev, transition: values }))}
                        />
                        <KpiRetentionGroup
                            schoolYear={schoolYear}
                            retentionData={retentionData}
                            setRetentionData={setRetentionData}
                            onDataChange={(values) => setKpiData((prev) => ({ ...prev, retention: values }))}
                        /> */}
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="lg:w-1/4 bg-white shadow border p-5 rounded-lg space-y-4 h-fit"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
                <div className="flex items-center gap-2 border-b pb-2">
                    <Calculator className="text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-700">Formulas</h2>
                </div>

                <Formula name="GROSS ENROLLMENT RATE" formula="(BOSY Enrollment ÷ Projected Population) × 100" />
                <Formula name="NET ENROLLMENT RATE" formula="(BOSY Enrollment aged 16–17 ÷ Projected Population) × 100" />
                <Formula name="GRADUATE RATE" formula="(Graduates ÷ G12 BOSY Enrollment) × 100" />
                <Formula name="DROP-OUT RATE" formula="(Drop-Out ÷ BOSY Enrollment) × 100" />
                <Formula name="LEAVER RATE" formula="[(BOSY prev SY - Repeaters prev SY) - (BOSY current SY - Repeaters current SY)] ÷ BOSY current SY × 100" />
                {/* <Formula name="TRANSITION RATE" formula="(New Entrants ÷ Grade 10 Enrollment prev SY) × 100" />
                <Formula name="RETENTION RATE" formula="(SHS current SY - Retained) ÷ BOSY Enrollment prev SY × 100" /> */}
            </motion.div>
        </div>
    );
}
