import { useState, useEffect } from "react";
import { Edit2, Save } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";

const VisionMissionCard = ({
    allVisionMissions,
    currentSY,
    updateVisionMission,
}: {
    allVisionMissions: Record<string, { vision: string; mission: string }>;
    currentSY: string;
    updateVisionMission: (school_year: string, vision: string, mission: string) => Promise<void>;
}) => {
    const [editField, setEditField] = useState<"vision" | "mission" | null>(null);
    const [tempVision, setTempVision] = useState("");
    const [tempMission, setTempMission] = useState("");

    // keep local text synced when school year changes
    useEffect(() => {
        setTempVision(allVisionMissions[currentSY]?.vision || "");
        setTempMission(allVisionMissions[currentSY]?.mission || "");
    }, [currentSY, allVisionMissions]);

    const handleEdit = (field: "vision" | "mission") => {
        if (editField === field) {
            setEditField(null);
            return;
        }
        if (field === "vision") setTempVision(allVisionMissions[currentSY]?.vision || "");
        if (field === "mission") setTempMission(allVisionMissions[currentSY]?.mission || "");
        setEditField(field);
    };

    const handleSave = async () => {
        await updateVisionMission(
            currentSY,
            editField === "vision" ? tempVision : allVisionMissions[currentSY]?.vision,
            editField === "mission" ? tempMission : allVisionMissions[currentSY]?.mission
        );
        setEditField(null);
    };

    return (
        <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 border-gray-300">
                Vision & Mission
            </h2>

            <div className="text-gray-700 space-y-3 mt-3">
                {/* Vision */}
                <div className="bg-blue-50 p-4 rounded-md relative">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-gray-800 font-medium">Vision</h3>
                        <Button onClick={() => handleEdit("vision")}>
                            <Edit2 size={16} />
                        </Button>
                    </div>

                    {editField === "vision" ? (
                        <div className="space-y-2">
                            <Textarea
                                value={tempVision}
                                onChange={(e) => setTempVision(e.target.value)}
                            />
                            <Button onClick={handleSave}>
                                <Save size={16} className="mr-1" /> Save
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm leading-relaxed">{allVisionMissions[currentSY]?.vision}</p>
                    )}
                </div>

                {/* Mission */}
                <div className="bg-green-50 p-4 rounded-md relative">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-gray-800 font-medium">Mission</h3>
                        <Button onClick={() => handleEdit("mission")}>
                            <Edit2 size={16} />
                        </Button>
                    </div>

                    {editField === "mission" ? (
                        <div className="space-y-2">
                            <Textarea
                                value={tempMission}
                                onChange={(e) => setTempMission(e.target.value)}
                            />
                            <Button onClick={handleSave}>
                                <Save size={16} className="mr-1" /> Save
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm leading-relaxed">{allVisionMissions[currentSY]?.mission}</p>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default VisionMissionCard;
