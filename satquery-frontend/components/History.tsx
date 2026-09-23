"use client";

import React, { useEffect, useState } from "react";
import { Clock, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listQueries, QueryHistoryItem, getQuery, QueryResponse } from "@/lib/api";

const TASK_LABELS: Record<string, string> = {
  vqa: "Visual QA",
  change_detection: "Bi-Temporal",
  grounding: "Grounding",
  fusion: "Optical+SAR",
};

export function HistoryPanel({ onSelectQuery }: { onSelectQuery: (query: QueryResponse) => void }) {
  const [queries, setQueries] = useState<QueryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    try {
      const data = await listQueries(20);
      setQueries(data);
    } catch (error) {
      console.error("Failed to load queries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (query: QueryHistoryItem) => {
    if (expandedId === query.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(query.id);
    try {
      const fullQuery = await getQuery(query.id);
      onSelectQuery(fullQuery);
    } catch (error) {
      console.error("Failed to load query details:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card className="h-full border border-neutral-800 bg-neutral-950">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-7 w-7 animate-spin text-neutral-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border border-neutral-800 bg-neutral-950 shadow-xl">
      <CardContent className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <h3 className="font-bold text-base text-neutral-100 flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-500" />
            <span>Query History</span>
          </h3>
          <span className="text-xs font-mono text-neutral-600">{queries.length} runs</span>
        </div>

        {queries.length === 0 ? (
          <div className="text-center py-10 text-neutral-600">
            <div className="h-10 w-10 mx-auto mb-2 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <Clock className="h-5 w-5 text-neutral-600" />
            </div>
            <p className="text-sm font-medium text-neutral-500">No queries logged</p>
            <p className="text-xs text-neutral-600 mt-1">Submit a query to populate history</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {queries.map((query) => (
              <div
                key={query.id}
                className={cn(
                  "group p-3 rounded-xl border transition-all cursor-pointer",
                  expandedId === query.id
                    ? "border-neutral-600 bg-neutral-900 shadow-md"
                    : "border-neutral-800 bg-black hover:border-neutral-700 hover:bg-neutral-900/60"
                )}
                onClick={() => handleExpand(query)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm text-neutral-300 truncate group-hover:text-white transition-colors">
                      {query.question}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[10px] py-0 px-2 border-neutral-700 text-neutral-500 font-mono">
                        {TASK_LABELS[query.detected_task || "vqa"]}
                      </Badge>
                      <span className="text-[11px] text-neutral-600 font-mono">{formatDate(query.created_at)}</span>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-neutral-600 flex-shrink-0 transition-transform mt-1",
                      expandedId === query.id && "rotate-90 text-white"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HistoryPanel;