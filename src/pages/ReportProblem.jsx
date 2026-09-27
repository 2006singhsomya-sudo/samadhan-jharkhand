import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  MapPin,
  Camera,
  X,
  AlertTriangle,
  Upload,
} from "lucide-react"
import { supabase } from "../lib/supabaseClient"

function ReportProblem() {
  const navigate = useNavigate()

  const categories = [
    { label: "Infrastructure", value: "INFRASTRUCTURE" },
    { label: "Water", value: "WATER" },
    { label: "Waste", value: "WASTE" },
    { label: "Electricity", value: "ELECTRICITY" },
    { label: "Environment", value: "ENVIRONMENT" },
    { label: "Transport", value: "TRANSPORT" },
    { label: "Healthcare", value: "HEALTHCARE" },
    { label: "Education", value: "EDUCATION" },
    { label: "Public Safety", value: "PUBLIC_SAFETY" },
    { label: "Other", value: "OTHER" },
  ]

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [district, setDistrict] = useState("")
  const [address, setAddress] = useState("")

  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  const [loading, setLoading] = useState(false)
  const [analyzingCategory, setAnalyzingCategory] = useState(false)
  const [categoryAnalyzed, setCategoryAnalyzed] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null)
  const [lastDuplicateCheckAt, setLastDuplicateCheckAt] = useState(0)
  const [message, setMessage] = useState("")

  function handleImageChange(event) {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) return

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage("Please select a JPG, PNG or WEBP image.")
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (selectedFile.size > maxSize) {
      setMessage("Image size must be less than 5 MB.")
      return
    }

    setMessage("")
    setImage(selectedFile)

    const previewUrl = URL.createObjectURL(selectedFile)
    setImagePreview(previewUrl)
  }

  function removeImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setImage(null)
    setImagePreview("")
  }

  async function handleAnalyzeCategory() {
  setMessage("")

  if (!title || !description) {
    setMessage("Please enter the problem title and description first.")
    return
  }

  setAnalyzingCategory(true)
  setCategoryAnalyzed(false)

  try {
    const { data: aiData, error: aiError } =
      await supabase.functions.invoke("analyze-problem", {
        body: {
          title,
          description,
          district,
          address,
        },
      })

    if (aiError) {
      throw aiError
    }

    const aiCategory = aiData?.analysis?.category

    if (!aiCategory) {
      throw new Error("AI could not determine a category.")
    }

    setAiAnalysisResult(aiData)
    setCategory(aiCategory)
    setCategoryAnalyzed(true)
  } catch (error) {
    console.error("AI category analysis error:", error)
    setMessage(
      error.message || "Unable to analyze the problem category."
    )
  } finally {
    setAnalyzingCategory(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage("")
    setLoading(true)

    try {
      // Get currently logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        setMessage("You must be logged in to report a problem.")
        return
      }

      // Basic validation
      if (!title || !description || !district) {
        setMessage("Please fill in all required fields.")
        return
      }

      let imagePath = null

      // Upload image if the citizen selected one
      if (image) {
        const fileExtension = image.name.split(".").pop()?.toLowerCase()
        const fileName = `${crypto.randomUUID()}.${fileExtension}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("problem-images")
          .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          throw uploadError
        }

        imagePath = filePath
      }

      // Insert problem into Supabase
      const { data: problem, error: problemError } = await supabase
        .from("problems")
        .insert({
          citizen_id: user.id,
          title: title,
          description: description,
          category: category || null,
          district: district,
          address: address,
          image_path: imagePath,
        })
        .select("id")
        .single()

      if (problemError) {
        // If database insertion fails after image upload,
        // try to remove the uploaded image.
        if (imagePath) {
          await supabase.storage
            .from("problem-images")
            .remove([imagePath])
        }

        throw problemError
      }

      // --------------------------------------------------
      // Ask AI to analyze the problem
      // --------------------------------------------------

      let finalCategory = category || null

      if (!category && aiAnalysisResult?.analysis?.category) {
        finalCategory = aiAnalysisResult.analysis.category

        const { error: categoryUpdateError } = await supabase
          .from("problems")
          .update({
            category: finalCategory,
          })
          .eq("id", problem.id)

        if (categoryUpdateError) {
          console.error(
            "Category update error:",
            categoryUpdateError
          )
        }
      }

      // --------------------------------------------------
      // Ask AI to check for duplicate problems
      // --------------------------------------------------

      const now = Date.now()
      const minimumDelay = 15000

      if (now - lastDuplicateCheckAt >= minimumDelay) {
        setLastDuplicateCheckAt(now)

        const { data: duplicateData, error: duplicateError } =
          await supabase.functions.invoke("find-duplicates", {
            body: {
              problemId: problem.id,
              title,
              description,
              district,
              category: finalCategory,
            },
          })

        if (duplicateError) {
          // Duplicate analysis should not cancel a successful report.
          console.error(
            "Duplicate detection error:",
            duplicateError
          )
        } else {
          console.log(
            "Duplicate detection result:",
            duplicateData
          )
        }
      } else {
        console.log(
          "Duplicate detection skipped because the 15-second cooldown is active."
        )
      }
      // Success
      setMessage("Problem reported successfully!")

      setTimeout(() => {
        navigate("/citizen")
      }, 1000)
    } catch (error) {
      console.error("Problem submission error:", error)
      setMessage(error.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <Link
            to="/citizen"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-green-700"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            Citizen Report
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Report a Problem
          </h1>

          <p className="mt-2 text-slate-600">
            Tell us about a problem in your community. Your report can help
            students, industries and government work toward a solution.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">

          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Problem Title *
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Large pothole near college gate"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <p className="mt-1.5 text-xs text-slate-500">
                Give your problem a short and clear title.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Describe the Problem *
              </label>

              <textarea
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what is happening, where it is happening and how it affects people..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none resize-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <p className="mt-1.5 text-xs text-slate-500">
                Please provide as much useful information as possible.
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Problem Category 
              </label>

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setCategoryAnalyzed(false)
                }}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                <option value="">
                  Select a category
                </option>

                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleAnalyzeCategory}
                  disabled={analyzingCategory || !title || !description}
                  className="rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {analyzingCategory ? "Analyzing..." : "Analyze Category"}
                </button>

                {categoryAnalyzed && (
                  <p className="text-sm font-medium text-green-700">
                    ✓ AI suggested:{" "}
                    {categories.find((item) => item.value === category)?.label ||
                      category}
                  </p>
                )}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Let AI analyze your problem and suggest the most suitable category.
              </p>
            </div>

            {/* Location */}
            <div className="border-t border-slate-200 pt-7">

              <div className="flex items-center gap-2 mb-5">
                <MapPin className="text-green-700" size={20} />

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Location
                  </h2>

                  <p className="text-xs text-slate-500">
                    Where is this problem located?
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    District *
                  </label>

                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Example: Ranchi"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Address / Landmark
                  </label>

                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Example: Near Main Gate"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

              </div>
            </div>

            {/* Photos */}
            <div className="border-t border-slate-200 pt-7">

              <div className="flex items-center gap-2 mb-4">
                <Camera className="text-green-700" size={20} />

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Problem Photo
                  </h2>

                  <p className="text-xs text-slate-500">
                    Add a photo to help government and AI understand the problem.
                  </p>
                </div>
              </div>

              {!imagePreview ? (
                <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50/30 transition">

                  <Upload
                    size={30}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Choose a photo
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    JPG, PNG or WEBP • Maximum 5 MB
                  </p>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50">

                  <img
                    src={imagePreview}
                    alt="Selected problem"
                    className="w-full max-h-96 object-contain"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-red-600 hover:bg-red-50"
                    title="Remove photo"
                  >
                    <X size={18} />
                  </button>

                  <div className="p-3 bg-white border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {image?.name}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Photo selected successfully
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Message */}
            {message && (
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">
                  {message}
                </p>
              </div>
            )}

            {/* Notice */}
            <div className="flex gap-3 rounded-xl bg-yellow-50 border border-yellow-200 p-4">
              <AlertTriangle
                size={20}
                className="text-yellow-700 shrink-0 mt-0.5"
              />

              <p className="text-sm text-yellow-800">
                Please provide accurate information. Reports may be reviewed
                by the appropriate government department.
              </p>
            </div>

            {/* Submit */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">

              <Link
                to="/citizen"
                className="px-5 py-3 rounded-xl border border-slate-300 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Problem"}
              </button>

            </div>

          </form>
        </div>
      </main>
    </div>
  )
}

export default ReportProblem