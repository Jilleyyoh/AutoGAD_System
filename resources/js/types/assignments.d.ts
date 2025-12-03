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
        organization: {
            id: number;
            name: string;
        };
    };
    domainExpertise?: {
        id: number;
        name: string;
    };
    implementationPhase?: {
        id: number;
        name: string;
    };
    evaluator: {
        id: number;
        name: string;
        email: string;
    } | null;
}

export interface Evaluator {
    id: number;
    name: string;
    email: string;
    domains: Array<{
        id: number;
        name: string;
    }>;
}

export interface AssignmentResponse {
    message: string;
}