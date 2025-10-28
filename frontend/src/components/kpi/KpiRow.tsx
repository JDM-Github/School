import { useState } from "react";

export function KpiRow({
    label,
    value,
    highlight = false,
    onValueChange,
}: {
    label: string;
    value: string;
    highlight?: boolean;
    onValueChange?: (newValue: string) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const handleDoubleClick = () => {
        if (!highlight) setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (onValueChange) onValueChange(editValue);
    };

    return (
        <div
            onDoubleClick={handleDoubleClick}
            className={`flex justify-between items-center px-4 py-2 text-sm ${highlight ? "bg-blue-50 font-semibold text-blue-700" : "bg-white cursor-pointer"
                }`}
        >
            <span>{label}</span>
            {isEditing ? (
                <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => e.key === "Enter" && handleBlur()}
                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            ) : (
                <span>{value}</span>
            )}
        </div>
    );
}