import { Dispatch, SetStateAction, useEffect } from "react";
import { KpiGroup } from "./KpiGroup";
import { KpiRow } from "./KpiRow";

export function KpiRetentionGroup({
    schoolYear,
    retentionData,
    setRetentionData,
    onDataChange,
}: {
    schoolYear: string;
    retentionData: {
        shsPrev: string;
        retained: string;
        shsCurr: string;
    };
    setRetentionData: Dispatch<SetStateAction<{
        shsPrev: string;
        retained: string;
        shsCurr: string;
    }>>;
    onDataChange?: (data: any) => void;
}) {
    const retentionRate =
        retentionData.shsPrev && +retentionData.shsPrev > 0
            ? (((+retentionData.shsCurr - +retentionData.retained) / +retentionData.shsPrev) * 100).toFixed(2) + "%"
            : "0.00%";

    useEffect(() => {
        onDataChange?.({ ...retentionData, retentionRate });
    }, [retentionData, retentionRate]);

    return (
        <KpiGroup title="RETENTION RATE" delay={0.6}>
            <KpiRow
                label="SHS Enrollment SY 2023–2024"
                value={retentionData.shsPrev}
                onValueChange={(v) => setRetentionData({ ...retentionData, shsPrev: v })}
            />
            <KpiRow
                label="Retained SY 2024–2025"
                value={retentionData.retained}
                onValueChange={(v) => setRetentionData({ ...retentionData, retained: v })}
            />
            <KpiRow
                label={`SHS Enrollment SY ${schoolYear}`}
                value={retentionData.shsCurr}
                onValueChange={(v) => setRetentionData({ ...retentionData, shsCurr: v })}
            />
            <KpiRow label="Retention Rate" value={retentionRate} highlight />
        </KpiGroup>
    );
}
