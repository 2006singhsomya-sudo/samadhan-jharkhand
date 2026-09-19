import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { User, Mail, Phone, Shield, ArrowLeft, LogOut } from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function CitizenProfile() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        navigate("/login")
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, role")
        .eq("id", user.id)
        .single()

      if (error) {
        throw error
      }

      setProfile({
        ...data,
        email: user.email,
      })
    } catch (error) {
      console.error("Profile loading error:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Logout error:", error)
      return
    }

    navigate("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium">
              Citizen Portal
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              My Profile
            </h1>
          </div>

          <button
            onClick={() => navigate("/citizen")}
            className="flex items-center gap-2 text-slate-600 hover:text-green-700"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-green-50 px-6 py-8 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center">
              <User size={38} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {profile?.full_name || "Citizen"}
              </h2>

              <p className="text-slate-600 mt-1">
                Citizen Account
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <User className="text-green-600" size={22} />

              <div>
                <p className="text-xs text-slate-500">
                  Full Name
                </p>

                <p className="font-medium text-slate-900">
                  {profile?.full_name || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <Mail className="text-green-600" size={22} />

              <div>
                <p className="text-xs text-slate-500">
                  Email
                </p>

                <p className="font-medium text-slate-900">
                  {profile?.email || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <Phone className="text-green-600" size={22} />

              <div>
                <p className="text-xs text-slate-500">
                  Phone
                </p>

                <p className="font-medium text-slate-900">
                  {profile?.phone || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <Shield className="text-green-600" size={22} />

              <div>
                <p className="text-xs text-slate-500">
                  Account Role
                </p>

                <p className="font-medium text-slate-900">
                  {profile?.role || "CITIZEN"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-3 font-semibold hover:bg-slate-800 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CitizenProfile