const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface RequestRecord {
  _id: string;
  name: string;
  email: string;
  message: string;
  category: 'billing' | 'support' | 'feedback' | 'general' | null;
  summary: string | null;
  urgency: 'low' | 'medium' | 'high' | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestsResponse {
  data: RequestRecord[];
  total: number;
  page: number;
}

export async function submitRequest(payload: {
  name: string;
  email: string;
  message: string;
}) {
  const res = await fetch(`${API_BASE}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to submit request');
  }
  return res.json();
}

export async function fetchRequests(
  page = 1,
  category?: string
): Promise<RequestsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: '10' });
  if (category && category !== 'all') params.set('category', category);

  const res = await fetch(`${API_BASE}/requests?${params}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch requests');

  const json = await res.json();

  // Normalise — guard against the backend returning a plain array
  // instead of { data, total, page }
  if (Array.isArray(json)) {
    return { data: json, total: json.length, page };
  }

  return {
    data:  Array.isArray(json.data)              ? json.data  : [],
    total: typeof json.total === 'number'        ? json.total : 0,
    page:  typeof json.page  === 'number'        ? json.page  : page,
  };
}

// ── NEW: fetch a single record by ID 

export async function fetchRequestById(id: string): Promise<RequestRecord> {
  const res = await fetch(`${API_BASE}/requests/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to fetch request: ${id}`);
  return res.json();
}