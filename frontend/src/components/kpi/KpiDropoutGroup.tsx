import { Dispatch, SetStateAction, useEffect } from "react";
import { KpiGroup } from "./KpiGroup";
import { KpiRow } from "./KpiRow";

export function KpiDropoutGroup({
    schoolYear,
    dropoutData,
    setDropoutData,
    onDataChange,
}: {
    schoolYear: string;
    dropoutData: { dropOut: string; bosy: string };
    setDropoutData: Dispatch<SetStateAction<{ dropOut: string; bosy: string }>>;
    onDataChange?: (data: any) => void;
}) {
    const dropOutRate =
        dropoutData.bosy && +dropoutData.bosy > 0
            ? ((+dropoutData.dropOut / +dropoutData.bosy) * 100).toFixed(2) + "%"
            : "0.00%";

    useEffect(() => {
        onDataChange?.({ ...dropoutData, dropOutRate });
    }, [dropoutData, dropOutRate]);

    return (
        <KpiGroup title="DROP-OUT RATE" delay={0.3}>
            <KpiRow
                label="Drop-Out"
                value={dropoutData.dropOut}
                onValueChange={(v) => setDropoutData({ ...dropoutData, dropOut: v })}
            />
            <KpiRow
                label={`BOSY Enrollment SY ${schoolYear}`}
                value={dropoutData.bosy}
                onValueChange={(v) => setDropoutData({ ...dropoutData, bosy: v })}
            />
            <KpiRow label="Drop-Out Rate" value={dropOutRate} highlight />
        </KpiGroup>
    );
}
