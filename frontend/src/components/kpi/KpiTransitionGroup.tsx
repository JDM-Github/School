import { Dispatch, SetStateAction, useEffect } from "react";
import { KpiGroup } from "./KpiGroup";
import { KpiRow } from "./KpiRow";

export function KpiTransitionGroup({
    schoolYear,
    transitionData,
    setTransitionData,
    onDataChange,
}: {
    schoolYear: string;
    transitionData: {
        g11Bosy: string;
        g11Repeaters: string;
        g10EnrollmentPrev: string;
    };
    setTransitionData: Dispatch<SetStateAction<{
        g11Bosy: string;
        g11Repeaters: string;
        g10EnrollmentPrev: string;
    }>>;
    onDataChange?: (data: any) => void;
}) {
    const newEntrants = (+transitionData.g11Bosy - +transitionData.g11Repeaters).toString();
    const transitionRate =
        +transitionData.g10EnrollmentPrev > 0
            ? ((+newEntrants / +transitionData.g10EnrollmentPrev) * 100).toFixed(2) + "%"
            : "0.00%";


    useEffect(() => {
        onDataChange?.({ ...transitionData, newEntrants, transitionRate });
    }, [transitionData, newEntrants, transitionRate]);

    return (
        <KpiGroup title="TRANSITION RATE" delay={0.5}>
            <KpiRow
                label={`G11 BOSY Enrollment SY ${schoolYear}`}
                value={transitionData.g11Bosy}
                onValueChange={(v) => setTransitionData({ ...transitionData, g11Bosy: v })}
            />
            <KpiRow
                label="G11 Repeaters"
                value={transitionData.g11Repeaters}
                onValueChange={(v) => setTransitionData({ ...transitionData, g11Repeaters: v })}
            />
            <KpiRow
                label="New Entrants (G11 BOSY - G11 Repeaters)"
                value={newEntrants}
            />
            <KpiRow
                label="Grade 10 Enrollment SY 2023–2024"
                value={transitionData.g10EnrollmentPrev}
                onValueChange={(v) => setTransitionData({ ...transitionData, g10EnrollmentPrev: v })}
            />
            <KpiRow label="Transition Rate" value={transitionRate} highlight />
        </KpiGroup>
    );
}
