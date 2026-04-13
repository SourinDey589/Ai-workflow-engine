"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { submitRequest } from "@/lib/api";

type FormData = { name: string; email: string; message: string };

export default function SubmitPage() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setErrorMsg("");
    try {
      await submitRequest(data);
      setStatus("success");
      reset();
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-10">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Request Submitted!
          </h2>
          <p className="text-gray-500 mb-6">
            Our AI is analyzing your request. Check the dashboard in a few
            seconds to see the results.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStatus("idle")}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Submit Another
            </button>
            <a
              href="/dashboard"
              className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-12 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Submit a Request
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          AI will automatically triage your request.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email",
                },
              })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              {...register("message", {
                required: "Message is required",
                minLength: {
                  value: 10,
                  message: "Message must be at least 10 characters",
                },
              })}
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Describe your issue or request in detail..."
            />
            {errors.message && (
              <p className="text-red-500 text-xs mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Error banner */}
          {status === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
