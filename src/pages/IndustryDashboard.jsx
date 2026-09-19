import { useEffect, useState } from "react"
import {
  Building2,
  CheckCircle2,
  Clock3,
  LogOut,
  HandHeart,
  Lightbulb,
  Users,
  XCircle,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

function IndustryDashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [problems, setProblems] = useState([])
  const [solutions, setSolutions] = useState([])
  const [support, setSupport] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const [selectedProblem, setSelectedProblem] = useState(null)
  const [selectedSolution, setSelectedSolution] = useState(null)

  const [supportType, setSupportType] = useState("FUNDING")
  const [supportMessage, setSupportMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    setMessage("")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      navigate("/login")
      return
    }

    setUser(user)

    const [
      { data: problemData, error: problemError },
      { data: solutionData, error: solutionError },
      { data: supportData, error: supportError },
    ] = await Promise.all([
      supabase
        .from("problems")
        .select("*")
        .in("status", ["VERIFIED", "IMPLEMENTATION"])
        .order("created_at", { ascending: false }),

      supabase
        .from("solutions")
        .select("*")
        .in("status", ["PROPOSED", "ACCEPTED"])
        .order("created_at", { ascending: false }),

      supabase
        .from("industry_support")
        .select("*")
        .eq("industry_id", user.id)
        .order("created_at", { ascending: false }),
    ])

    if (problemError) {
      setMessage(problemError.message)
    }

    if (solutionError) {
      setMessage(solutionError.message)
    }

    if (supportError) {
      setMessage(supportError.message)
    }

    setProblems(problemData || [])
    setSolutions(solutionData || [])
    setSupport(supportData || [])

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const openSupportModal = (problem, solution = null) => {
    setSelectedProblem(problem)
    setSelectedSolution(solution)
    setSupportType("FUNDING")
    setSupportMessage("")
  }

  const closeSupportModal = () => {
    if (submitting) return

    setSelectedProblem(null)
    setSelectedSolution(null)
    setSupportMessage("")
  }

  const submitSupport = async (e) => {
    e.preventDefault()

    if (!user || !selectedProblem) return

    if (!supportMessage.trim()) {
      setMessage("Please describe the support you want to provide.")
      return
    }

    setSubmitting(true)
    setMessage("")

    const { error } = await supabase
      .from("industry_support")
      .insert({
        industry_id: user.id,
        problem_id: selectedProblem.id,
        solution_id: selectedSolution?.id || null,
        support_type: supportType,
        message: supportMessage.trim(),
      })

    if (error) {
      setMessage(error.message)
      setSubmitting(false)
      return
    }

    closeSupportModal()
    await loadDashboard()
    setMessage("Support request submitted successfully.")
    setSubmitting(false)
  }

  const pendingCount = support.filter(
    (item) => item.status === "PENDING"
  ).length

  const acceptedCount = support.filter(
    (item) => item.status === "ACCEPTED"
  ).length

  const rejectedCount = support.filter(
    (item) => item.status === "REJECTED"
  ).length

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading industry dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
              <Building2 className="text-green-700" size={24} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Industrialist Dashboard
              </h1>

              <p className="text-sm text-slate-500">
                Support civic innovation in Jharkhand
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* Welcome */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-green-700">
            INDUSTRY PARTNER
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Help turn civic ideas into real solutions.
          </h2>

          <p className="mt-3 max-w-3xl text-slate-600">
            Review verified civic problems and student solutions, then offer
            funding, mentorship, resources, or industry expertise.
          </p>
        </section>

        {message && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {message}
          </div>
        )}

        {/* Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Verified Problems</p>
              <Lightbulb className="text-green-700" size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {problems.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Student Solutions</p>
              <Users className="text-blue-700" size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {solutions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Pending Support</p>
              <Clock3 className="text-amber-600" size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Accepted Support</p>
              <CheckCircle2 className="text-green-700" size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {acceptedCount}
            </p>
          </div>
        </section>

        {/* Problems */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Verified Civic Problems
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose a problem where your organization can contribute.
            </p>
          </div>

          {problems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-slate-500">
                No verified civic problems are available right now.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {problems.map((problem) => {
                const problemSolutions = solutions.filter(
                  (solution) => solution.problem_id === problem.id
                )

                return (
                  <article
                    key={problem.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          {problem.status}
                        </span>

                        <h3 className="mt-3 text-xl font-bold text-slate-900">
                          {problem.title}
                        </h3>
                      </div>

                      <Building2
                        size={22}
                        className="shrink-0 text-slate-400"
                      />
                    </div>

                    {problem.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {problem.description}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                      {problem.category && (
                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          {problem.category}
                        </span>
                      )}

                      {problem.district && (
                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          {problem.district}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => openSupportModal(problem)}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                    >
                      <HandHeart size={17} />
                      Support This Problem
                    </button>

                    {problemSolutions.length > 0 && (
                      <div className="mt-6 border-t border-slate-200 pt-5">
                        <h4 className="font-semibold text-slate-900">
                          Student Solutions
                        </h4>

                        <div className="mt-3 space-y-3">
                          {problemSolutions.map((solution) => (
                            <div
                              key={solution.id}
                              className="rounded-xl border border-slate-200 p-4"
                            >
                              <h5 className="font-semibold text-slate-900">
                                {solution.title}
                              </h5>

                              {solution.description && (
                                <p className="mt-1 text-sm text-slate-600">
                                  {solution.description}
                                </p>
                              )}

                              <button
                                onClick={() =>
                                  openSupportModal(problem, solution)
                                }
                                className="mt-3 text-sm font-semibold text-green-700 hover:text-green-800"
                              >
                                Support this solution →
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Support History */}
        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-900">
              My Support Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track support requests submitted by your organization.
            </p>
          </div>

          {support.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <HandHeart className="mx-auto text-slate-400" size={30} />

              <p className="mt-3 text-slate-500">
                You haven't submitted any support requests yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {support.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-green-700">
                        {item.support_type}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Submitted{" "}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "ACCEPTED"
                          ? "bg-green-100 text-green-700"
                          : item.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Rejected count */}
        {rejectedCount > 0 && (
          <p className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <XCircle size={16} />
            {rejectedCount} support request
            {rejectedCount === 1 ? "" : "s"} rejected.
          </p>
        )}
      </main>

      {/* Support Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-5 py-8">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-green-700">
                  INDUSTRY SUPPORT
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedSolution
                    ? `Support: ${selectedSolution.title}`
                    : selectedProblem.title}
                </h2>
              </div>

              <button
                onClick={closeSupportModal}
                disabled={submitting}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitSupport} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Type of Support
                </label>

                <select
                  value={supportType}
                  onChange={(e) => setSupportType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  <option value="FUNDING">Funding</option>
                  <option value="MENTORSHIP">Mentorship</option>
                  <option value="RESOURCES">Resources / Materials</option>
                  <option value="EXPERTISE">Industry Expertise</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Support Details
                </label>

                <textarea
                  rows="5"
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe how your organization can support this problem or solution..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeSupportModal}
                  disabled={submitting}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Support"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default IndustryDashboard