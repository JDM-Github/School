import { useState, useMemo } from "react";
import { Card } from "../ui/card";
import { motion } from "framer-motion";
import { Subject } from "../../lib/type";

interface SubjectTableProps {
    title: string;
    data: Subject[];
    delay?: number;
}

export default function SubjectTable({
    title,
    data,
    delay = 0
}: SubjectTableProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const isSpecialized = title.toUpperCase().includes("SPECIALIZED");

    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return data.filter(
            (item) =>
                item.name.toLowerCase().includes(term) ||
                (item.specialized_category &&
                    item.specialized_category.toLowerCase().includes(term))
        );
    }, [searchTerm, data]);

    return (
        <Card className="bg-white border shadow-sm rounded-lg overflow-hidden flex flex-col w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay }}
                className="flex flex-col flex-1"
            >
                <div className="bg-gray-400 text-white text-lg font-semibold px-4 py-2 flex items-center justify-between">
                    <span>{title}</span>
                    <input
                        type="text"
                        placeholder={
                            isSpecialized
                                ? "Search subject name, or category..."
                                : "Search subject name..."
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-transparent focus:border-gray-50 w-64 bg-white"
                    />
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm border-collapse table-auto">
                        <thead className="bg-blue-100 text-gray-700 font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 text-center w-[10%]">ID</th>
                                <th className="px-4 py-2 text-center">PROGRAM</th>
                                <th className="px-4 py-2 text-center">SUBJECT</th>
                                {isSpecialized && (
                                    <th className="px-4 py-2 text-center w-[20%]">
                                        SPECIALIZED CATEGORY
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.length > 0 ? (
                                filteredData.map((item, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className="hover:bg-gray-50 text-center"
                                    >
                                        <td className="px-4 py-2">{item.id}</td>
                                        <td className="px-4 py-2">{item.groupName}</td>
                                        <td className="px-4 py-2">{item.name}</td>
                                        {isSpecialized && (
                                            <td className="px-4 py-2">
                                                {item.specialized_category || "—"}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={isSpecialized ? 3 : 2}
                                        className="text-center text-gray-500 py-4"
                                    >
                                        No subjects found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </Card>
    );
}
