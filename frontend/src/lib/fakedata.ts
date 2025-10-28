import { faker } from "@faker-js/faker";

export interface SemesterMasterlist {
    grade_level: string;
    section: string;
    program: string;
    adviser: string;
    male: number;
    female: number;
    total: number;
    sub1: number;
    sub2: number;
    sub3: number;
    sub4: number;
    completedSubjects: number;
    incompleteSubjects: number;
    totalSubjects: number;
    notEncoded: number;
    status: "COMPLETE" | "INCOMPLETE" | "NO INPUT";
}

export const generateFakeSF9Data = (numRows = 20): SemesterMasterlist[] => {
    return Array.from({ length: numRows }).map((_, idx) => {
        const male = faker.number.int({ min: 10, max: 25 });
        const female = faker.number.int({ min: 10, max: 30 });
        const completedSubjects = faker.number.int({ min: 0, max: 9 });
        const incompleteSubjects = 9 - completedSubjects;
        const totalSubjects = 9;
        const notEncoded = incompleteSubjects > 0 ? faker.number.int({ min: 0, max: incompleteSubjects }) : 0;

        return {
            grade_level: faker.helpers.arrayElement(["GRADE 11", "GRADE 12"]),
            section: (idx + 1).toString(),
            program: faker.helpers.arrayElement(["ABM", "TVL", "HUMSS", "STEM"]),
            adviser: faker.person.fullName(),
            male,
            female,
            total: male + female,
            sub1: faker.number.int({ min: 0, max: 5 }),
            sub2: faker.number.int({ min: 0, max: 5 }),
            sub3: faker.number.int({ min: 0, max: 5 }),
            sub4: faker.number.int({ min: 0, max: 5 }),
            completedSubjects,
            incompleteSubjects,
            totalSubjects,
            notEncoded,
            status:
                incompleteSubjects === 0
                    ? "COMPLETE"
                    : completedSubjects === 0
                        ? "INCOMPLETE"
                        : "NO INPUT",
        };
    });
};

export const fakeSF9Data = generateFakeSF9Data(20);
