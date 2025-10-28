import { Dispatch, SetStateAction, useEffect } from "react";
import { KpiGroup } from "./KpiGroup";
import { KpiRow } from "./KpiRow";

export function KpiGraduationGroup({
    schoolYear,
    graduationData,
    setGraduationData,
    onDataChange,
}: {
    schoolYear: string;
    graduationData: { graduates: string; bosyG12: string };
    setGraduationData: Dispatch<SetStateAction<{ graduates: string; bosyG12: string }>>;
    onDataChange?: (data: any) => void;
}) {
    const gradRate =
        graduationData.bosyG12 && +graduationData.bosyG12 > 0
            ? ((+graduationData.graduates / +graduationData.bosyG12) * 100).toFixed(2) + "%"
            : "0%";

    useEffect(() => {
        onDataChange?.({ ...graduationData, gradRate });
    }, [graduationData, gradRate]);

    return (
        <KpiGroup title="GRADUATION RATE" delay={0.2}>
            <KpiRow
                label="Graduates"
                value={graduationData.graduates}
                onValueChange={(v) => setGraduationData({ ...graduationData, graduates: v })}
            />
            <KpiRow
                label={`G12 BOSY Enrollment SY ${schoolYear}`}
                value={graduationData.bosyG12}
                onValueChange={(v) => setGraduationData({ ...graduationData, bosyG12: v })}
            />
            <KpiRow label="Graduate Rate" value={gradRate} highlight />
        </KpiGroup>
    );
}
