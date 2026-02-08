"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        if (profile) {
          setDisplayName(profile.display_name);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ display_name: displayName, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="py-8 px-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Name (used in email sign-off)
              </label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                This name appears at the end of every generated email.
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <Input type="email" value={email} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-400 mt-1">
                Contact your admin to change your email.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
              {saved && (
                <span className="text-green-600 text-sm font-semibold">
                  Saved
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
