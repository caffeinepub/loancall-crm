import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CallOutcome, LeadStage } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllLeads() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStatsDashboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallLogs() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callLogs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCallLogsForCaller();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallsForLead(leadId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callsForLead", leadId?.toString()],
    queryFn: async () => {
      if (!actor || leadId === null) return [];
      return actor.getCallsForLead(leadId);
    },
    enabled: !!actor && !isFetching && leadId !== null,
  });
}

export function useGetAllTasks() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateLead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      email: string;
      loanAmount: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createLead(
        data.name,
        data.phone,
        data.email,
        data.loanAmount,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      phone: string;
      email: string;
      loanAmount: number;
      stage: LeadStage;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateLead(
        data.id,
        data.name,
        data.phone,
        data.email,
        data.loanAmount,
        data.stage,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (leadId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteLead(leadId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useLogCall() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      leadId: bigint;
      duration: bigint;
      outcome: CallOutcome;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.logCall(
        data.leadId,
        data.duration,
        data.outcome,
        data.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callLogs"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      qc.invalidateQueries({ queryKey: ["callsForLead"] });
    },
  });
}

export function useCompleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.completeTask(taskId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      dueTime: bigint;
      assignedTo: any;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTask(data.title, data.dueTime, data.assignedTo);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useAddNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { leadId: bigint; note: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addNoteToLead(data.leadId, data.note);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}
