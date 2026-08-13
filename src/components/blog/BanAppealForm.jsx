import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, Send, Loader2, Clock, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function BanAppealForm({ guestToken, guestName, onClose }) {
  const queryClient = useQueryClient();
  const [appealText, setAppealText] = useState("");

  const { data: appeals = [] } = useQuery({
    queryKey: ["ban-appeals", guestToken],
    queryFn: () => base44.entities.BanAppeal.filter({ guest_token: guestToken }),
  });

  const pendingAppeal = appeals.find((a) => a.status === "pending");
  const rejectedAppeal = appeals.find((a) => a.status === "rejected");

  const { mutate: submitAppeal, isPending } = useMutation({
    mutationFn: () =>
      base44.entities.BanAppeal.create({
        guest_token: guestToken,
        guest_name: guestName,
        appeal_message: appealText.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ban-appeals", guestToken] });
      setAppealText("");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!appealText.trim()) return;
    submitAppeal();
  };

  return (
    <div className="p-5 text-center">
      <div className="flex justify-end -mt-2 -mr-2 mb-1">
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <Ban className="w-8 h-8 text-destructive mx-auto mb-3" />
      <p className="text-sm font-medium text-foreground mb-1">You have been banned from chat.</p>
      <p className="text-xs text-muted-foreground mb-4">Submit an appeal and our moderators will review it.</p>

      {pendingAppeal ? (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-3">
          <Clock className="w-4 h-4 animate-pulse" />
          <span>Your appeal is under review.</span>
        </div>
      ) : (
        <>
          {rejectedAppeal && (
            <div className="flex items-center justify-center gap-2 text-xs text-destructive mb-3">
              <XCircle className="w-4 h-4" />
              <span>Your previous appeal was rejected.</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-2 text-left">
            <Textarea
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              placeholder="Why should your ban be lifted?"
              className="text-xs min-h-[80px]"
              maxLength={500}
              autoFocus
            />
            <Button type="submit" disabled={isPending || !appealText.trim()} size="sm" className="w-full">
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit Appeal
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
