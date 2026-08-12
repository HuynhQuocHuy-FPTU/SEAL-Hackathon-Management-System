export interface MetricResultDTO {
    groupByTarget: string;
    countEvaluations: number;
    mean: number;
    variance: number;
    standardDeviation: number;
    min: number;
    max: number;
}

export interface ReliabilityResultDTO {
    eventId: number;
    totalEvaluations: number;
    cronbachAlpha: MetricDetail;
    icc: MetricDetail;
}

interface MetricDetail {
    value: number;
    interpretation: string;
}

export interface StudentCount {
    externalStudentCount: number;
    fptStudentCount: number;
}