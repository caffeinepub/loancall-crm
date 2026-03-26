import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGetAllLeads, useLogCall } from "../hooks/useQueries";

interface CallModalProps {
  open: boolean;
  onClose: () => void;
  preselectedLeadId?: bigint | null;
}

export default function CallModal({
  open,
  onClose,
  preselectedLeadId,
}: CallModalProps) {
  const logCall = useLogCall();
  const { data: leads = [] } = useGetAllLeads();

  const [leadId, setLeadId] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [durationSec, setDurationSec] = useState("");
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: setState setters are stable, intentionally omitted
  useEffect(() => {
    if (preselectedLeadId != null) {
      setLeadId(preselectedLeadId.toString());
    } else {
      setLeadId("");
    }
    setDurationMin("");
    setDurationSec("");
    setOutcome("");
    setNotes("");
  }, [open, preselectedLeadId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadId || !outcome) {
      toast.error("Please select a lead and outcome");
      return;
    }
    const min = Number.parseInt(durationMin || "0");
    const sec = Number.parseInt(durationSec || "0");
    const totalSec = BigInt(min * 60 + sec);
    try {
      await logCall.mutateAsync({
        leadId: BigInt(leadId),
        duration: totalSec,
        outcome: outcome as any,
        notes,
      });
      toast.success("Call logged");
      onClose();
    } catch {
      toast.error("Could not log call");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="call.modal" className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log a Call</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Lead *</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger data-ocid="call.lead.select">
                <SelectValue placeholder="Select a lead..." />
              </SelectTrigger>
              <SelectContent>
                {leads.map((l) => (
                  <SelectItem key={l.id.toString()} value={l.id.toString()}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="call-min">Duration (min)</Label>
              <Input
                id="call-min"
                data-ocid="call.duration_min.input"
                type="number"
                min="0"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                placeholder="5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="call-sec">Duration (sec)</Label>
              <Input
                id="call-sec"
                data-ocid="call.duration_sec.input"
                type="number"
                min="0"
                max="59"
                value={durationSec}
                onChange={(e) => setDurationSec(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Outcome *</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger data-ocid="call.outcome.select">
                <SelectValue placeholder="Select outcome..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="callBack">Call Back</SelectItem>
                <SelectItem value="noAnswer">No Answer</SelectItem>
                <SelectItem value="notInterested">Not Interested</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="call-notes">Notes</Label>
            <Textarea
              id="call-notes"
              data-ocid="call.textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief notes about the call..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="call.cancel_button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="call.submit_button"
              disabled={logCall.isPending}
            >
              {logCall.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Log Call
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
