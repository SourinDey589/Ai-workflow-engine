"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Could not load requests
      </h2>
      <p className="text-gray-500 mb-6">
        The API might be unreachable. Make sure your backend is running.
      </p>
      <button
        onClick={reset}
        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      >
        Retry
      </button>
    </div>
  );
}
