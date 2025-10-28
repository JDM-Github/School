import { Dispatch, SetStateAction, useEffect } from "react";
import { KpiGroup } from "./KpiGroup";
import { KpiRow } from "./KpiRow";

export function KpiLeaverGroup({
    schoolYear,
    leaverData,
    setLeaverData,
    onDataChange,
}: {
    schoolYear: string;
    leaverData: {
        bosyPrev: string;
        bosyCurr: string;
        repeatersPrev: string;
        repeatersCurr: string;
    };
    setLeaverData: Dispatch<SetStateAction<{
        bosyPrev: string;
        bosyCurr: string;
        repeatersPrev: string;
        repeatersCurr: string;
    }>>;
    onDataChange?: (data: any) => void;
}) {
    const [currentStart, currentEnd] = schoolYear.split("-").map(Number);
    const previousSchoolYear = `${currentStart - 1}-${currentEnd - 1}`;

    const leaverRate =
        +leaverData.bosyCurr > 0
            ? (((+leaverData.bosyPrev - +leaverData.repeatersPrev) -
                (+leaverData.bosyCurr - +leaverData.repeatersCurr)) / +leaverData.bosyCurr * 100
            ).toFixed(2) + "%"
            : "0.00%";

    useEffect(() => {
        onDataChange?.({ ...leaverData, leaverRate });
    }, [leaverData, leaverRate]);

    return (
        <KpiGroup title="LEAVER RATE" delay={0.4}>
            <KpiRow
                label={`BOSY Enrollment SY ${previousSchoolYear}`}
                value={leaverData.bosyPrev}
                onValueChange={(v) => setLeaverData({ ...leaverData, bosyPrev: v })}
            />
            <KpiRow
                label={`BOSY Enrollment SY ${schoolYear}`}
                value={leaverData.bosyCurr}
                onValueChange={(v) => setLeaverData({ ...leaverData, bosyCurr: v })}
            />
            <KpiRow
                label={`Repeaters SY ${previousSchoolYear}`}
                value={leaverData.repeatersPrev}
                onValueChange={(v) => setLeaverData({ ...leaverData, repeatersPrev: v })}
            />
            <KpiRow
                label={`Repeaters SY ${schoolYear}`}
                value={leaverData.repeatersCurr}
                onValueChange={(v) => setLeaverData({ ...leaverData, repeatersCurr: v })}
            />
            <KpiRow label="Leaver Rate" value={leaverRate} highlight />
        </KpiGroup>
    );
}
