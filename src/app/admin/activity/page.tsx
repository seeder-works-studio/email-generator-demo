"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityLog {
  id: number;
  user_email: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  login: "bg-green-100 text-green-800",
  generation: "bg-blue-100 text-blue-800",
  copy: "bg-purple-100 text-purple-800",
  select_variation: "bg-yellow-100 text-yellow-800",
  logout: "bg-gray-100 text-gray-800",
};

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const supabase = createClient();
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (filter !== "all") {
        query = query.eq("action", filter);
      }

      const { data } = await query;
      setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, [filter, page]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="generation">Generation</SelectItem>
            <SelectItem value="copy">Copy</SelectItem>
            <SelectItem value="select_variation">Selection</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Time
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    User
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Action
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Details
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{log.user_email || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={
                          ACTION_COLORS[log.action] || "bg-gray-100 text-gray-800"
                        }
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                      {log.metadata
                        ? JSON.stringify(log.metadata).slice(0, 100)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {log.ip_address || "—"}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No activity logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
              disabled={logs.length < pageSize}
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
