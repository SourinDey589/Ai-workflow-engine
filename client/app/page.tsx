export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        AI-Powered Request Triage
      </h1>
      <p className="text-xl text-gray-500 mb-8 max-w-xl">
        Submit your request and our AI will automatically categorize, summarize,
        and prioritize it for you.
      </p>
      <div className="flex gap-4">
        <a
          href="/submit"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Submit a Request
        </a>
        <a
          href="/dashboard"
          className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
        >
          View Dashboard
        </a>
      </div>
    </div>
  );
}
