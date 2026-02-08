"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CopyButton from "@/components/copy-button";

interface EmailRecord {
  id: number;
  user_id: string;
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

export default function AdminGenerationsPage() {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("generated_emails")
        .select("*")
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      setEmails(data || []);
      setLoading(false);
    };
    fetchEmails();
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        All Generations
      </h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {emails.map((email) => {
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
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {email.recipient_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        · {email.recipient_title} at {email.company_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{email.tone}</Badge>
                      <Badge variant="outline">{email.industry}</Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(email.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {!isExpanded && (
                    <p className="text-sm text-gray-400 mt-1 truncate">
                      {email.variations[0]?.subject}
                    </p>
                  )}

                  {isExpanded && (
                    <div
                      className="mt-4 space-y-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {email.variations.map((v, i) => (
                        <div
                          key={i}
                          className={`border rounded-lg p-3 ${
                            email.selected_variation === i
                              ? "border-blue-500 bg-blue-50/30"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-blue-600 uppercase">
                              Variation {i + 1}
                            </span>
                            {email.selected_variation === i && (
                              <Badge className="bg-blue-600 text-xs">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-semibold mb-1">
                            {v.subject}
                          </p>
                          <p className="text-sm text-gray-600 whitespace-pre-line">
                            {v.body}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <CopyButton
                              text={v.subject}
                              label="Copy Subject"
                              size="sm"
                              variant="outline"
                            />
                            <CopyButton
                              text={v.body}
                              label="Copy Email"
                              size="sm"
                              variant="outline"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {emails.length === 0 && (
              <p className="text-gray-400 text-center py-12">
                No generations found
              </p>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">Page {page + 1}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={emails.length < pageSize}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
