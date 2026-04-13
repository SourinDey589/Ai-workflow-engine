export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="flex gap-2 mb-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-9 w-20 bg-gray-200 rounded-full animate-pulse"
          />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse"
          >
            <div className="flex justify-between mb-3">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
            <div className="h-3 w-48 bg-gray-100 rounded mb-3" />
            <div className="h-3 w-full bg-gray-100 rounded mb-2" />
            <div className="h-3 w-3/4 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
