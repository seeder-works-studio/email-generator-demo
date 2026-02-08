"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

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
    scraped_context: any;
}

export default function SpreadsheetPage() {
    const [emails, setEmails] = useState<EmailRecord[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleExport = () => {
        const data = emails.map((e) => {
            const selected = e.selected_variation ?? 0;
            const variation = e.variations[selected] || e.variations[0];
            const context = e.scraped_context || {};

            return {
                Date: new Date(e.created_at).toLocaleDateString(),
                "Recipient Name": e.recipient_name,
                "Recipient Title": e.recipient_title,
                Company: e.company_name,
                "Company URL": e.company_url,
                Industry: e.industry,
                Tone: e.tone,
                Subject: variation.subject,
                Body: variation.body,
                "Company Description": context.description || "N/A",
                "Services": context.services || "N/A",
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Emails");

        // Auto-width columns
        const maxWidth = 50;
        const wscols = Object.keys(data[0] || {}).map((key) => ({ wch: 20 }));
        worksheet["!cols"] = wscols;

        XLSX.writeFile(workbook, "SeederWorks_Emails.xlsx");
    };

    return (
        <div className="w-full h-[calc(100vh-64px)] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Spreadsheet View</h1>
                    <p className="text-sm text-gray-500">
                        {emails.length} generated emails
                    </p>
                </div>
                <Button onClick={handleExport} disabled={loading || emails.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Download XLSX
                </Button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50 p-6">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : emails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
                        <p>No data found.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-4 py-3 border-b">Date</th>
                                        <th className="px-4 py-3 border-b">Recipient</th>
                                        <th className="px-4 py-3 border-b">Company</th>
                                        <th className="px-4 py-3 border-b">Subject</th>
                                        <th className="px-4 py-3 border-b">Preview</th>
                                        <th className="px-4 py-3 border-b">Tone</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {emails.map((e) => {
                                        const selected = e.selected_variation ?? 0;
                                        const variation = e.variations[selected] || e.variations[0];
                                        return (
                                            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-gray-500">
                                                    {new Date(e.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {e.recipient_name}
                                                    <span className="text-gray-400 ml-1 font-normal">
                                                        ({e.recipient_title})
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {e.company_name}
                                                </td>
                                                <td className="px-4 py-3 text-blue-600 max-w-xs truncate">
                                                    {variation.subject}
                                                </td>
                                                <td className="px-4 py-3 text-gray-400 max-w-xs truncate">
                                                    {variation.body}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        {e.tone}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
