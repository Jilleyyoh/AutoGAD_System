export interface ProjectAssignment {
    id: number;
    project_code: string;
    title: string;
    status: number;
    submission_date: string;
    domain_id: number;
    implementation_phase_id: number;
    proponent?: {
        id: number;
        organization?: {
            id: number;
            name: string;
        };
    } | null;
    domainExpertise?: {
        id: number;
        name: string;
    } | null;
    implementationPhase?: {
        id: number;
        name: string;
    } | null;
    evaluator?: {
        id: number;
        name: string;
        email: string;
    } | null;
}
