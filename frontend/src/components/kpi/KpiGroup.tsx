import { Card } from "../ui/card";
import { motion } from "framer-motion";

export function KpiGroup({
    title,
    children,
    delay = 0,
}: {
    title: string;
    children: React.ReactNode;
    delay?: number;
}) {
    return (
        <Card className="bg-white border shadow-sm rounded-lg overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay }}
            >
                <div className="bg-gray-400 text-white text-lg font-semibold px-4 py-2">
                    {title}
                </div>
                <div className="divide-y divide-gray-200">{children}</div>
            </motion.div>
        </Card>
    );
}
