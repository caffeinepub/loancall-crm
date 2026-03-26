import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface StatDashboard {
    totalLeadsAssignedToCaller: bigint;
    totalFunded: number;
    totalLeads: bigint;
    callsToday: bigint;
    avgLoanAmount: number;
    appsSubmitted: bigint;
}
export interface ViewLead {
    id: bigint;
    assignedTo: Principal;
    loanAmount: number;
    name: string;
    createdAt: Time;
    email: string;
    stage: LeadStage;
    notes: Array<string>;
    phone: string;
}
export interface Task {
    id: bigint;
    title: string;
    assignedTo: Principal;
    completed: boolean;
    dueTime: Time;
}
export interface CallLog {
    duration: bigint;
    user: Principal;
    calledAt: Time;
    leadId: bigint;
    notes: string;
    outcome: CallOutcome;
}
export interface UserProfile {
    name: string;
}
export enum CallOutcome {
    noAnswer = "noAnswer",
    callBack = "callBack",
    notInterested = "notInterested",
    interested = "interested"
}
export enum LeadStage {
    new_ = "new",
    application = "application",
    funded = "funded",
    approval = "approval",
    contacted = "contacted",
    qualified = "qualified"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addNoteToLead(leadId: bigint, note: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeTask(taskId: bigint): Promise<void>;
    createLead(name: string, phone: string, email: string, loanAmount: number): Promise<bigint>;
    createTask(title: string, dueTime: Time, assignedTo: Principal): Promise<bigint>;
    deleteLead(leadId: bigint): Promise<void>;
    deleteTask(taskId: bigint): Promise<void>;
    getAllCallLogsForCaller(): Promise<Array<CallLog>>;
    getAllLeads(): Promise<Array<ViewLead>>;
    getAllTasks(): Promise<Array<Task>>;
    getAllTasksForCaller(): Promise<Array<Task>>;
    getCallerLeads(): Promise<Array<ViewLead>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCallsForLead(leadId: bigint): Promise<Array<CallLog>>;
    getLead(leadId: bigint): Promise<ViewLead>;
    getLeadCountByStage(stage: LeadStage): Promise<bigint>;
    getLeadCountForCaller(): Promise<bigint>;
    getLeadsByLoanAmount(): Promise<Array<ViewLead>>;
    getLeadsByStage(stage: LeadStage): Promise<Array<ViewLead>>;
    getLeadsCreatedToday(): Promise<Array<ViewLead>>;
    getLeadsOrderedByCreatedAt(): Promise<Array<ViewLead>>;
    getOverdueTasksForCaller(): Promise<Array<Task>>;
    getStatsDashboard(): Promise<StatDashboard>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logCall(leadId: bigint, duration: bigint, outcome: CallOutcome, notes: string): Promise<void>;
    reassignLead(leadId: bigint, newOwner: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateLead(id: bigint, name: string, phone: string, email: string, loanAmount: number, stage: LeadStage): Promise<void>;
}
