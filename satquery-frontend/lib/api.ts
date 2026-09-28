const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface QueryTraceStep {
  node: string;
  summary: string;
}

export interface QueryResponse {
  query_id: string;
  answer: string;
  evidence_image_url?: string | null;
  confidence?: number | null;
  detected_task: "vqa" | "change_detection" | "grounding" | "fusion";
  trace: QueryTraceStep[];
}

export interface SubmitQueryParams {
  question: string;
  input_type: "single" | "bitemporal" | "optical_sar";
  image_single?: File;
  image_t1?: File;
  image_t2?: File;
  image_optical?: File;
  image_sar?: File;
}

export async function submitQuery(params: SubmitQueryParams): Promise<QueryResponse> {
  const formData = new FormData();
  formData.append("question", params.question);
  formData.append("input_type", params.input_type);

  if (params.image_single) formData.append("image_single", params.image_single);
  if (params.image_t1) formData.append("image_t1", params.image_t1);
  if (params.image_t2) formData.append("image_t2", params.image_t2);
  if (params.image_optical) formData.append("image_optical", params.image_optical);
  if (params.image_sar) formData.append("image_sar", params.image_sar);

  const res = await fetch(`${API_BASE_URL}/query`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Query failed (${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function getQuery(queryId: string): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE_URL}/query/${queryId}`);
  if (!res.ok) throw new Error(`Failed to fetch query ${queryId}`);
  return res.json();
}

export interface QueryHistoryItem {
  id: string;
  question: string;
  input_type: string;
  detected_task: string | null;
  created_at: string;
}

export async function listQueries(limit: number = 20): Promise<QueryHistoryItem[]> {
  const res = await fetch(`${API_BASE_URL}/queries?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch query history");
  return res.json();
}