import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Camera,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function AdminProblemReview() {
  const { id } = useParams()

  const [problem, setProblem] = useState(null)
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchProblem()
  }, [id])

  async function fetchProblem() {
    setLoading(true)
    setMessage("")

    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error(error)
      setMessage("Unable to load this problem.")
      setLoading(false)
      return
    }

    setProblem(data)

    // Generate a temporary URL for the private image
    if (data.image_path) {
      const { data: imageData, error: imageError } =
        await supabase.storage
          .from("problem-images")
          .createSignedUrl(data.image_path, 60 * 60)

      if (imageError) {
        console.error("Image loading error:", imageError)
      } else {
        setImageUrl(imageData.signedUrl)
      }
    }

    setLoading(false)
  }

  async function updateStatus(newStatus) {
    setUpdating(true)
    setMessage("")

    const { data, error } = await supabase
      .from("problems")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(error)
      setMessage(error.message)
    } else {
      setProblem(data)
      setMessage(`Problem status changed to ${formatStatus(newStatus)}.`)
    }

    setUpdating(false)
  }

  function formatStatus(status) {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  function getStatusStyle(status) {
    if (status === "RESOLVED") {
      return "bg-green-100 text-green-700"
    }

    if (status === "VERIFIED") {
      return "bg-blue-100 text-blue-700"
    }

    if (status === "UNDER_REVIEW") {
      return "bg-yellow-100 text-yellow-700"
    }

    if (status === "REJECTED" || status === "DUPLICATE") {
      return "bg-red-100 text-red-700"
    }

    return "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading problem...</p>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-green-600"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="mt-8 bg-white border border-red-200 rounded-xl p-6">
          <p className="text-red-600">
            {message || "Problem not found."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-5">

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
          >
            <ArrowLeft size={17} />
            Back to Government Dashboard
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 mt-4">
            Review Citizen Problem
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Review the report and decide its current status.
          </p>

        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">

        {/* Message */}
        {message && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3">
            {message}
          </div>
        )}

        {/* Problem Details */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

          {/* Title */}
          <div className="p-6 border-b border-slate-200">

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

              <div>
                <p className="text-sm text-green-600 font-medium">
                  Citizen Report
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {problem.title}
                </h2>
              </div>

              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                  problem.status
                )}`}
              >
                {formatStatus(problem.status)}
              </span>

            </div>

          </div>

          {/* Information */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <p className="text-sm text-slate-500">
                Category
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {problem.category}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Severity
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {problem.severity || "Not assessed"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                District
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {problem.district}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Submitted On
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {new Date(problem.created_at).toLocaleString()}
              </p>
            </div>

          </div>

          {/* Location */}
          <div className="px-6 pb-6">

            <div className="bg-slate-50 rounded-lg p-4">

              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <MapPin size={18} />
                Location
              </div>

              {problem.address && (
                <p className="text-sm text-slate-600 mt-2">
                  {problem.address}
                </p>
              )}

              {(problem.latitude || problem.longitude) && (
                <p className="text-xs text-slate-500 mt-2">
                  Coordinates: {problem.latitude}, {problem.longitude}
                </p>
              )}

            </div>

          </div>

          {/* Description */}
          <div className="px-6 pb-6">

            <h3 className="font-semibold text-slate-900">
              Problem Description
            </h3>

            <div className="mt-3 bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 whitespace-pre-wrap">
                {problem.description}
              </p>
            </div>

          </div>

          {/* Problem Photo */}
          <div className="px-6 pb-6">

            <div className="border-t border-slate-200 pt-6">

              <div className="flex items-center gap-2 mb-4">
                <Camera
                  size={20}
                  className="text-green-700"
                />

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Problem Photo
                  </h3>

                  <p className="text-xs text-slate-500">
                    Photo submitted by the citizen
                  </p>
                </div>
              </div>

              {imageUrl ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={imageUrl}
                    alt={`Photo of ${problem.title}`}
                    className="w-full max-h-[500px] object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <Camera
                    size={30}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm text-slate-500">
                    No photo was submitted with this report.
                  </p>
                </div>
              )}

            </div>

          </div>

          {/* Government Actions */}
          <div className="p-6 border-t border-slate-200">

            <h3 className="font-semibold text-slate-900">
              Government Review
            </h3>

            <p className="text-sm text-slate-500 mt-1 mb-5">
              Select the appropriate action for this report.
            </p>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={() => updateStatus("UNDER_REVIEW")}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 disabled:opacity-50"
              >
                <Clock size={18} />
                Mark Under Review
              </button>

              <button
                onClick={() => updateStatus("VERIFIED")}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle size={18} />
                Verify Problem
              </button>

              <button
                onClick={() => updateStatus("REJECTED")}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle size={18} />
                Reject
              </button>

              <button
                onClick={() => updateStatus("DUPLICATE")}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-800 disabled:opacity-50"
              >
                <AlertTriangle size={18} />
                Mark Duplicate
              </button>

            </div>

          </div>

        </div>

      </main>
    </div>
  )
}

export default AdminProblemReview