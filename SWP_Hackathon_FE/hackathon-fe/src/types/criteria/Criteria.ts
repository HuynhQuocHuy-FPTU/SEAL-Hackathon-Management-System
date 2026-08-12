export interface Criteria {
    criteriaSetId?: number;
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