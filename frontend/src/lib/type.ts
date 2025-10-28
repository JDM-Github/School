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

export interface Group {
    id: string;
    name: string;
    applied_subjects: Subject[];
    specialized_subjects: Subject[];
    core_subjects: Subject[];
}

export interface Subject {
    id: string;
    name: string;
    groupName?: string;
    specialized_category?: string | null;
}

export interface SubjectAttendance {
    id: number;
    subject_id: number;
    january: string[];
    february: string[];
    march: string[];
    april: string[];
    may: string[];
    june: string[];
    july: string[];
    august: string[];
    september: string[];
    october: string[];
    november: string[];
    december: string[];
    subject: { id: number; name: string };
}

export interface Attendance {
    subjectAttendances: SubjectAttendance[];
}

export interface Section {
    section_name: string;
}

export interface Account {
    id: number;
    name: string;
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string | null;
    age: number;
    sex: string;
    email: string;
    password: string;
    graduated: boolean;
    status: string;
    isRepeater: boolean;
    retained: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Student {
    id: number;
    student_account_id: number;
    grade_level: string;
    section_id: number;
    attendance_id: number;
    school_year: string;
    createdAt: string;
    updatedAt: string;
    section: Section;
    account: Account;
    attendance: Attendance;
    subjects: Subject[];
    adviser_name: string;
}

export type Month =
    | "january"
    | "february"
    | "march"
    | "april"
    | "may"
    | "june"
    | "july"
    | "august"
    | "september"
    | "october"
    | "november"
    | "december";


export interface Adviser {
    id: number;
    program: string;
    school_year: string;
    grade_level: string;
    account: { id: number; name: string; age: number; sex: string, email: string; };
    section: { id: number; section_name: string };
    subjectStatuses: { id: number; subject: { id: number; name: string }; is_completed: boolean }[];
    studentCounts: { male: number, female: number, total: number };
}

export interface StudentAnalytics {
    id: number;
    student_account_id: number;
    section_id: number;
    attendance_id: number;
    grade_level: string;
    subjects_ids: number[];
    subject_grade_ids: number[];
    school_year: string;
    isNew: boolean;
    isStartedSY: boolean;
    startedSY: string;
    createdAt: string;
    updatedAt: string;
    section: Section;
    account: Account;
    attendance: Attendance;
    subjectGrades: SubjectGrade[];
    subjectAttendances: SubjectAttendance[];
}

export interface SubjectGrade {
    id: number;
    subject_id: number;
    first_quarter: string;
    second_quarter: string;
    third_quarter: string;
    final_quarter: string;
    createdAt: string;
    updatedAt: string;
}

export interface GradeStat {
    grade: "Grade 11" | "Grade 12";
    total: number;
}

export interface SubjectPerformance {
    subject: string;
    avg: number;
}
