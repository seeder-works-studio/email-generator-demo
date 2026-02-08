import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
        <span className="font-bold text-xl text-gray-900">SeederWorks</span>
        <div>
          {user ? (
            <Link
              href="/generate"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Go to App
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <div className="text-center py-16 px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Cold Emails That
          <br />
          Actually Get Replies
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          Paste a company URL. Our AI reads their website, understands their
          business, and writes 3 personalized cold email variations in seconds.
        </p>
        <Link
          href={user ? "/generate" : "/login"}
          className="inline-block bg-blue-600 text-white px-7 py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Generate Your First Email
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-12 max-w-4xl mx-auto">
        <div className="text-center p-6 border border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <h3 className="font-semibold mb-2">Personalized in Seconds</h3>
          <p className="text-sm text-gray-500">
            AI reads their website and crafts emails specific to their business, not generic templates.
          </p>
        </div>
        <div className="text-center p-6 border border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h3 className="font-semibold mb-2">Consultative, Not Spammy</h3>
          <p className="text-sm text-gray-500">
            Framework-driven approach that positions you as a trusted advisor, not another cold emailer.
          </p>
        </div>
        <div className="text-center p-6 border border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
          </div>
          <h3 className="font-semibold mb-2">3 Variations, Your Pick</h3>
          <p className="text-sm text-gray-500">
            Get three different angles for every email. Edit inline, pick your favorite, copy and send.
          </p>
        </div>
      </div>

      <footer className="border-t border-gray-200 py-4 px-8">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>SeederWorks — AI Solutions Partner</span>
          <span>Powered by LLM Gateway</span>
        </div>
      </footer>
    </div>
  );
}
