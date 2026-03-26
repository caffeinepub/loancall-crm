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
import type { ViewLead } from "../backend.d";
import {
  useAddNote,
  useCreateLead,
  useDeleteLead,
  useUpdateLead,
} from "../hooks/useQueries";
import { LEAD_STAGES } from "../types/crm";

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
  lead?: ViewLead | null;
  onLogCall?: (lead: ViewLead) => void;
}

export default function LeadModal({
  open,
  onClose,
  lead,
  onLogCall,
}: LeadModalProps) {
  const isEditing = !!lead;
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const addNote = useAddNote();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [stage, setStage] = useState("new");
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: setState setters are stable, intentionally omitted
  useEffect(() => {
    if (lead) {
      setName(lead.name);
      setPhone(lead.phone);
      setEmail(lead.email);
      setLoanAmount(lead.loanAmount.toString());
      setStage(lead.stage as string);
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setLoanAmount("");
      setStage("new");
    }
    setNote("");
    setConfirmDelete(false);
  }, [lead, open]);

  const isPending = createLead.isPending || updateLead.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number.parseFloat(loanAmount);
    if (!name || !phone || !email || Number.isNaN(amount)) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      if (isEditing && lead) {
        await updateLead.mutateAsync({
          id: lead.id,
          name,
          phone,
          email,
          loanAmount: amount,
          stage: stage as any,
        });
        if (note.trim())
          await addNote.mutateAsync({ leadId: lead.id, note: note.trim() });
        toast.success("Lead updated");
      } else {
        await createLead.mutateAsync({
          name,
          phone,
          email,
          loanAmount: amount,
        });
        toast.success("Lead created");
      }
      onClose();
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete() {
    if (!lead) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await deleteLead.mutateAsync(lead.id);
      toast.success("Lead deleted");
      onClose();
    } catch {
      toast.error("Could not delete lead");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="lead.modal" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Lead" : "Add New Lead"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="lead-name">Full Name *</Label>
              <Input
                id="lead-name"
                data-ocid="lead.input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Mitchell"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-phone">Phone *</Label>
              <Input
                id="lead-phone"
                data-ocid="lead.phone.input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-email">Email *</Label>
              <Input
                id="lead-email"
                data-ocid="lead.email.input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@email.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-amount">Loan Amount ($) *</Label>
              <Input
                id="lead-amount"
                data-ocid="lead.amount.input"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="75000"
                min="0"
                required
              />
            </div>
            {isEditing && (
              <div className="space-y-1.5">
                <Label>Stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger data-ocid="lead.stage.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STAGES.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="lead-note">Add Note (optional)</Label>
              <Textarea
                id="lead-note"
                data-ocid="lead.textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this lead..."
                rows={2}
              />
            </div>
          )}

          {isEditing && lead?.notes && lead.notes.length > 0 && (
            <div className="space-y-1.5">
              <Label>Notes History</Label>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {lead.notes.map((n, noteIdx) => (
                  <p
                    key={`note-${noteIdx}-${n.slice(0, 8)}`}
                    className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded"
                  >
                    {n}
                  </p>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 pt-2">
            {isEditing && onLogCall && lead && (
              <Button
                type="button"
                variant="outline"
                data-ocid="lead.log_call.button"
                onClick={() => {
                  onClose();
                  onLogCall(lead);
                }}
              >
                Log Call
              </Button>
            )}
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                data-ocid="lead.delete_button"
                onClick={handleDelete}
                disabled={deleteLead.isPending}
                className="mr-auto"
              >
                {confirmDelete ? "Confirm Delete" : "Delete"}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              data-ocid="lead.cancel_button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="lead.submit_button"
              disabled={isPending}
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
