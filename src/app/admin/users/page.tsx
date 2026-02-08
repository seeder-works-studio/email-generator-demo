import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const serviceClient = await createServiceClient();

  // Get all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Get generation counts per user
  const { data: genCounts } = await supabase
    .from("generated_emails")
    .select("user_id");

  const countMap: Record<string, number> = {};
  genCounts?.forEach((g) => {
    countMap[g.user_id] = (countMap[g.user_id] || 0) + 1;
  });

  // Get auth users for email/last_sign_in
  const {
    data: { users: authUsers },
  } = await serviceClient.auth.admin.listUsers();

  const authMap: Record<string, { email: string; last_sign_in_at: string | null }> = {};
  authUsers?.forEach((u) => {
    authMap[u.id] = {
      email: u.email || "",
      last_sign_in_at: u.last_sign_in_at || null,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Display Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Role
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Generations
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Last Login
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {profiles?.map((profile) => {
              const auth = authMap[profile.id];
              return (
                <tr key={profile.id}>
                  <td className="px-4 py-3 font-medium">
                    {auth?.email || "—"}
                  </td>
                  <td className="px-4 py-3">{profile.display_name}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        profile.role === "admin" ? "default" : "secondary"
                      }
                    >
                      {profile.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{countMap[profile.id] || 0}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {auth?.last_sign_in_at
                      ? new Date(auth.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
            {(!profiles || profiles.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
