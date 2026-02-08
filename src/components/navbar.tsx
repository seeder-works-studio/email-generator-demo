"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar({
  email,
  displayName,
}: {
  email?: string;
  displayName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const linkClass = (path: string) =>
    `text-sm transition-colors ${
      pathname === path
        ? "text-blue-600 font-semibold"
        : "text-gray-500 hover:text-gray-700"
    }`;

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
        <Image src="/seederworkslogo.svg" alt="SeederWorks Logo" width={32} height={32} />
        SeederWorks
      </Link>
      <div className="flex gap-6 items-center">
        <Link href="/generate" className={linkClass("/generate")}>
          Generate
        </Link>
        <Link href="/history" className={linkClass("/history")}>
          History
        </Link>
        <Link href="/settings" className={linkClass("/settings")}>
          Settings
        </Link>
        <Link href="/spreadsheet" className={linkClass("/spreadsheet")}>
          Spreadsheets
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-xs text-gray-400" disabled>
              {email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
