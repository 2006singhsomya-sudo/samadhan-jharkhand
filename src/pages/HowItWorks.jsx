import {
  Megaphone,
  GraduationCap,
  Building2,
  ShieldCheck,
  ArrowRight,
  Leaf,
} from "lucide-react"

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Report",
      description:
        "Citizens report local problems with descriptions, photographs and locations.",
      icon: Megaphone,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      number: "02",
      title: "Innovate",
      description:
        "College students discover problems and propose practical solutions.",
      icon: GraduationCap,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      number: "03",
      title: "Support",
      description:
        "Industries provide funding, resources, expertise and mentorship.",
      icon: Building2,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      number: "04",
      title: "Resolve",
      description:
        "Government monitors implementation and verifies completed solutions.",
      icon: ShieldCheck,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ]

  return (
    <div className="min-h-screen overflow-hidden bg-white">
      {/* Hero section */}
      <section className="relative px-6 pt-10 pb-16 sm:px-8 lg:px-12">
        {/* Soft decorative background */}
        <div className="pointer-events-none absolute left-0 top-20 h-64 w-64 rounded-full bg-green-50 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-10 h-72 w-72 rounded-full bg-emerald-50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          {/* Label */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-5 py-2 text-sm font-semibold text-green-800">
              <Leaf size={16} />
              <span>How It Works</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mx-auto mt-8 max-w-5xl text-center">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              From problem to{" "}
              <span className="relative inline-block text-green-700">
                solution
                <span className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-green-600" />
              </span>
              ,
              <br />
              one step at a time.
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              A collaborative process connecting citizens, students,
              industries and government — turning everyday challenges into
              real, verified impact.
            </p>
          </div>

          {/* Steps */}
          <div className="relative mx-auto mt-16 max-w-7xl">
            {/* Connecting line */}
            <div className="pointer-events-none absolute left-[12%] right-[12%] top-12 hidden border-t border-dashed border-green-200 lg:block" />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => {
                const Icon = step.icon

                return (
                  <div key={step.number} className="relative">
                    {/* Arrow between cards */}
                    {index < steps.length - 1 && (
                      <div className="pointer-events-none absolute -right-5 top-10 z-20 hidden h-10 w-10 items-center justify-center rounded-full border border-green-200 bg-white text-green-600 shadow-sm lg:flex">
                        <ArrowRight size={19} />
                      </div>
                    )}

                    <div className="group h-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                      {/* Icon */}
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${step.iconBg}`}
                      >
                        <Icon
                          size={30}
                          strokeWidth={2}
                          className={step.iconColor}
                        />
                      </div>

                      {/* Step number */}
                      <div className="mt-7">
                        <span className="text-sm font-bold tracking-wide text-green-700">
                          STEP {step.number}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="mt-3 text-2xl font-bold text-slate-900">
                        {step.title}
                      </h2>

                      {/* Description */}
                      <p className="mt-3 text-base leading-7 text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom message */}
          <div className="mt-16 flex items-center justify-center gap-4 text-green-700">
            <div className="hidden h-px w-16 bg-green-300 sm:block" />

            <Leaf size={18} />

            <p className="text-center text-lg font-semibold italic">
              Together for a Better Tomorrow
            </p>

            <Leaf size={18} />

            <div className="hidden h-px w-16 bg-green-300 sm:block" />
          </div>
        </div>

        {/* Bottom soft waves */}
        <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-20 overflow-hidden">
          <div className="absolute -bottom-10 left-[-5%] h-24 w-[110%] rounded-[50%] bg-green-50" />
          <div className="absolute -bottom-16 left-[20%] h-24 w-[90%] rounded-[50%] bg-emerald-100/60" />
        </div>
      </section>
    </div>
  )
}

export default HowItWorks