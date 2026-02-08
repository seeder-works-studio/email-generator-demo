"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CopyButton from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EmailRecord {
  id: number;
  recipient_name: string;
  recipient_title: string;
  company_name: string;
  company_url: string;
  industry: string;
  tone: string;
  variations: Array<{ subject: string; body: string }>;
  selected_variation: number | null;
  created_at: string;
}

export default function HistoryPage() {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const fetchHistory = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("generated_emails")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEmails(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: number) => {
    const supabase = createClient();
    await supabase.from("generated_emails").delete().eq("id", id);
    setEmails(emails.filter((e) => e.id !== id));
  };

  const handleClearAll = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("generated_emails")
        .delete()
        .eq("user_id", user.id);
      setEmails([]);
    }
    setClearDialogOpen(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSelectedVariation = (email: EmailRecord) => {
    const idx = email.selected_variation ?? 0;
    return email.variations[idx] || email.variations[0];
  };

  return (
    <div className="py-8 px-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Email History</h2>
        {emails.length > 0 && (
          <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Clear All</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear all emails?</DialogTitle>
                <DialogDescription>
                  This will permanently delete all your generated emails. This
                  action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setClearDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleClearAll}>
                  Delete All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : emails.length === 0 ? (
        <p className="text-gray-400 text-center py-12">
          No emails generated yet. Start by creating your first email.
        </p>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => {
            const variation = getSelectedVariation(email);
            const isExpanded = expanded === email.id;

            return (
              <div
                key={email.id}
                className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors ${
                  isExpanded ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
                onClick={() => setExpanded(isExpanded ? null : email.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-sm">
                      {email.recipient_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {" "}
                      · {email.recipient_title} at {email.company_name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(email.created_at)} · {email.tone}
                  </span>
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Subject: {variation.subject}
                </div>

                {!isExpanded && (
                  <p className="text-sm text-gray-400 mt-2 truncate">
                    {variation.body.substring(0, 120)}...
                  </p>
                )}

                {isExpanded && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <div className="bg-gray-100 rounded-lg p-4 mt-3 text-sm leading-relaxed whitespace-pre-line">
                      {variation.body}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <CopyButton
                        text={variation.subject}
                        label="Copy Subject"
                        size="sm"
                      />
                      <CopyButton
                        text={variation.body}
                        label="Copy Email"
                        size="sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(email.id)}
                        className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
