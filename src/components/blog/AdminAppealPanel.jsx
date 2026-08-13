import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gavel, Check, X, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminAppealPanel() {
  const queryClient = useQueryClient();

  const { data: appeals = [] } = useQuery({
    queryKey: ["all-appeals"],
    queryFn: () => base44.entities.BanAppeal.list("-created_date", 20),
  });

  const pendingAppeals = appeals.filter((a) => a.status === "pending");

  const { mutate: resolveAppeal, isPending } = useMutation({
    mutationFn: async ({ appeal, action }) => {
      if (action === "approve") {
        const bans = await base44.entities.BannedGuest.filter({ guest_token: appeal.guest_token });
        await Promise.all(bans.map((b) => base44.entities.BannedGuest.delete(b.id)));
        await base44.entities.BanAppeal.update(appeal.id, { status: "approved" });
      } else {
        await base44.entities.BanAppeal.update(appeal.id, { status: "rejected" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-appeals"] });
      queryClient.invalidateQueries({ queryKey: ["banned"] });
    },
  });

  if (pendingAppeals.length === 0) return null;

  return (
    <div className="border-t border-border/40 p-3 bg-accent/5">
      <div className="flex items-center gap-1.5 mb-2">
        <Gavel className="w-3.5 h-3.5 text-accent" />
        <span className="text-xs font-semibold">Ban Appeals ({pendingAppeals.length})</span>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {pendingAppeals.map((appeal) => (
          <div key={appeal.id} className="rounded-lg bg-card/50 border border-border/40 p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">{appeal.guest_name}</span>
              <span className="text-[9px] text-muted-foreground">
                {appeal.created_date ? formatDistanceToNow(new Date(appeal.created_date), { addSuffix: true }) : ""}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">{appeal.appeal_message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => resolveAppeal({ appeal, action: "approve" })}
                disabled={isPending}
                className="flex items-center gap-1 text-[10px] font-medium text-green-600 hover:text-green-500 transition-colors disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Release Ban
              </button>
              <button
                onClick={() => resolveAppeal({ appeal, action: "reject" })}
                disabled={isPending}
                className="flex items-center gap-1 text-[10px] font-medium text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
