export interface Hackathon {
    eventId: number;
    eventName: string;
    startDate: string;
    endDate: string;
    title: string;
    address: string;
    season: string;
    seasonYear: number;
    description: Description;
    minTeam: number;
    maxTeam: number;
    maxTeamSize: number;
    minTeamSize: number;
    bannerUrl: string;
    registrationDeadline: string;
    workshopTime: string;
    workshopStatus: string;
    status: string;
    createAt: string;
    updateAt: string;
    categories: CategoryResponse[];
    rounds: RoundResponse[];
}

export interface CategoryResponse {
    categoryId: number;
    categoryName: string;
}

export interface RoundResponse {
    roundId: number;
    roundName: string;
    description: string;
    startDate: string;
    endDate: string;
    eventID: number;
    advancementRule: string;
    appliedListCategoryNames: string[];
    criteriaSetId: number;
    topN: number;
    orderIndex: number;
    status: string;
    submissionDeadline: string;
    submissionType: SubmissionType;
    allowedFileTypes: FileType[];
    maxFileCount: number;
    maxTotalSizeMb: number;
    customCriteriaDetatils: CriteriaDetailResponse[];
    categoryExperts: CategoryExpertAssignmentRes[];
    evaluationDeadline: string;
    resolveAppealDeadline: string;
}

export interface CriteriaDetailResponse {
    evaluationCriteriaId: number;
    criteriaName: string;
    customWeight: number;
    type: string;
    description: string;
}

export interface CategoryExpertAssignmentRes {
    categoryId: number;
    experts: ExpertAssginmentRes[];
}

export interface Category {
    categoryName: string;
}

export interface ExpertAssginmentRes {
    expertId: number;
    expertName: string;
    role: "MENTOR" | "GUEST_JUDGE" | "CORE_JUDGE";
}
export interface ExpertAssginment {
    expertId: number;
    expertName?: string;
    role: "MENTOR" | "GUEST_JUDGE" | "CORE_JUDGE";
}

export interface CategoryExpertAssignment {
    categoryId: number;
    experts: ExpertAssginment[];
}

export interface CriteriaSet {
    criteriaSetId: number;
    criteriaSetName: string;
    maxScore: number;
    criteriaDetails: CriteriaDetail[];
}

export interface CriteriaDetail {
    criteriaId: number;
    criteriaName: string;
    weight: number;
    type: string;
    description: string;
}

export interface CustomCriteriaDetail {
    evaluationCriteriaId: number;
    criteriaName: string;
    customWeight: number;
    type: string;
    description: string;
}

export interface Round {
    roundId: number
    roundName: string;
    description: string;
    startDate: string;
    endDate: string;
    advancementRule: string;
    topN: number;
    criteriaSetId: number;
    orderIndex: number;
    submissionType: SubmissionType;
    allowedFileTypes: FileType[];
    maxFileCount: number;
    submissionDeadline: string;
    evaluationDeadline: string;
    resolveAppealDeadline: string;
    customCriteriaDetatils: CustomCriteriaDetail[];
    categoryExperts: CategoryExpertAssignment[];
}

export const FILE_TYPES = {
    PDF: {
        mimeType: "application/pdf",
        group: "DOCUMENT",
    },
    DOC: {
        mimeType: "application/msword",
        group: "DOCUMENT",
    },
    DOCX: {
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        group: "DOCUMENT",
    },
    PPT: {
        mimeType: "application/vnd.ms-powerpoint",
        group: "DOCUMENT",
    },
    PPTX: {
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        group: "DOCUMENT",
    },
    XLS: {
        mimeType: "application/vnd.ms-excel",
        group: "DOCUMENT",
    },
    XLSX: {
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        group: "DOCUMENT",
    },
    ZIP: {
        mimeType: "application/zip",
        group: "ARCHIVE",
    },
    RAR: {
        mimeType: "application/x-rar-compressed",
        group: "ARCHIVE",
    },
    PNG: {
        mimeType: "image/png",
        group: "IMAGE",
    },
    JPG: {
        mimeType: "image/jpeg",
        group: "IMAGE",
    },
    JPEG: {
        mimeType: "image/jpeg",
        group: "IMAGE",
    },
    MP4: {
        mimeType: "video/mp4",
        group: "VIDEO",
    },
} as const;

export type FileType = keyof typeof FILE_TYPES;

export const SUBMISSION_TYPES = {
    FILE: "FILE",
    GITHUB_URL: "GITHUB_URL",
    BOTH: "BOTH",
} as const;

export type SubmissionType = keyof typeof SUBMISSION_TYPES;

export interface HackathonCreate {
    eventName: string;
    startDate: string;
    endDate: string;
    title: string;
    address: string;
    description: Description;
    maxTeam: number;
    minTeam: number;
    maxTeamSize: number;
    minTeamSize: number;
    bannerUrl: string;
    registrationDeadline: string;
    workshopTime: string;
    season: EventSeason;
    categories: Category[];
    rounds: Round[];
}

export type EventSeason = "SPRING" | "SUMMER" | "FALL" | "WINTER";

export interface Description {
    introduction: string;
    prizes: prizes[];
    participantBenefits: string[];
    disqualificationRules: string[];
    competitionRules: string[];
}

export interface prizes {
    title: string;
    reward: string;
}

export interface RoundTimeData {
    startDate: string;
    endDate: string;
    submissionDeadline: string;
    evaluationDeadline: string;
    resolveAppealDeadline: string;
}

export interface PublicStatis {
    eventCount: number;
    participantCount: number;
    teamCount: number;
}

export interface EventTimeRequest {
    registrationDeadline: string;
    workshopTime: string;
    startTime: string;
    endTime: string;
}