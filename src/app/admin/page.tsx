import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get total users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Get total generations
  const { count: totalGenerations } = await supabase
    .from("generated_emails")
    .select("*", { count: "exact", head: true });

  // Get today's generations
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayGenerations } = await supabase
    .from("generated_emails")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Generations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalGenerations || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Generations Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayGenerations || 0}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h2>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentActivity?.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">{log.user_email || "—"}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {log.metadata
                    ? JSON.stringify(log.metadata).slice(0, 80)
                    : "—"}
                </td>
              </tr>
            ))}
            {(!recentActivity || recentActivity.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No activity yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
