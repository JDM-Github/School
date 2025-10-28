import { Dispatch, SetStateAction, useEffect } from "react";
import { KpiGroup } from "./KpiGroup";
import { KpiRow } from "./KpiRow";

export function KpiEnrollmentGroup({
    schoolYear,
    enrollmentData,
    setEnrollmentData,
    onDataChange,
}: {
    schoolYear: string;
    enrollmentData: {
        bosyTotal: string;
        bosyAge1617: string;
        projected: string;
    };
    setEnrollmentData: Dispatch<SetStateAction<{
        bosyTotal: string;
        bosyAge1617: string;
        projected: string;
    }>>;
    onDataChange?: (data: any) => void;
    dataUpdate?: (data: {
        bosyTotal?: string;
        bosyAge1617?: string;
        projected?: string;
    }) => void;
}) {

    const grossRate = ((+enrollmentData.bosyTotal / +enrollmentData.projected) * 100).toFixed(2) + "%";
    const netRate = ((+enrollmentData.bosyAge1617 / +enrollmentData.projected) * 100).toFixed(2) + "%";

    useEffect(() => {
        onDataChange?.({ ...enrollmentData, grossRate, netRate });
    }, [enrollmentData, grossRate, netRate]);

    return (
        <KpiGroup title="ENROLLMENT RATES" delay={0.1}>
            <KpiRow
                label={`BOSY Enrollment SY ${schoolYear}`}
                value={enrollmentData.bosyTotal}
                onValueChange={(v) => setEnrollmentData({ ...enrollmentData, bosyTotal: v })}
            />
            <KpiRow
                label={`BOSY Enrollment (aged 16-17) SY ${schoolYear}`}
                value={enrollmentData.bosyAge1617}
                onValueChange={(v) => setEnrollmentData({ ...enrollmentData, bosyAge1617: v })}
            />
            <KpiRow
                label="Projected Population of aged 16-17 (DepEd Central Office)"
                value={enrollmentData.projected}
                onValueChange={(v) => setEnrollmentData({ ...enrollmentData, projected: v })}
            />
            <KpiRow label="Gross Enrollment Rate" value={grossRate} highlight />
            <KpiRow label="Net Enrollment Rate" value={netRate} highlight />
        </KpiGroup>
    );
}
