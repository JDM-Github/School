import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState, ChangeEvent } from "react";
import { useSY } from "../layout/syprovider";

interface ChangeSYModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ChangeSYModal({ open, onOpenChange }: ChangeSYModalProps) {
    const { currentSY, setSY } = useSY();
    const currentYear = new Date().getFullYear() - 1;

    const syOptions = Array.from({ length: 3 }, (_, i) => {
        const start = currentYear + i;
        const end = start + 1;
        return `${start}-${end}`;
    });

    const [newSY, setNewSY] = useState<string>(currentSY);

    const handleSave = () => {
        if (!newSY.trim()) return;
        setSY(newSY);
        onOpenChange(false);
    };

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setNewSY(e.target.value);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 z-200" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 z-200">
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-lg font-semibold">
                            Change School Year
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-gray-500 hover:text-gray-700">
                                <X size={18} />
                            </button>
                        </Dialog.Close>
                    </div>

                    <label className="block text-sm font-medium mb-2">
                        Select new SY
                    </label>
                    <select
                        value={newSY}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        {syOptions.map((sy) => (
                            <option key={sy} value={sy}>
                                {sy}
                            </option>
                        ))}
                    </select>

                    <div className="flex justify-end gap-2 mt-6">
                        <Dialog.Close asChild>
                            <button className="px-3 py-2 text-sm border rounded hover:bg-gray-100">
                                Cancel
                            </button>
                        </Dialog.Close>
                        <button
                            onClick={handleSave}
                            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
