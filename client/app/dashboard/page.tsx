import { fetchRequests } from "@/lib/api";
import DashboardClient from "@/components/DashboardClient";

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category || "all";
  const page = Number(params.page) || 1;

  // fetchRequests now always returns { data: [], total: 0, page } — never undefined
  const { data, total } = await fetchRequests(page, category);

  return (
    <DashboardClient
      initialData={data} // guaranteed to be RequestRecord[], never undefined
      total={total}
      category={category}
      page={page}
    />
  );
}
