function Leaderboard() {
  const students = [
    { rank: 1, name: "Aarav Kumar", points: 1240 },
    { rank: 2, name: "Priya Singh", points: 1120 },
    { rank: 3, name: "Rahul Verma", points: 980 },
  ]

  const rankStyles = {
    1: {
      badge: "🥇",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    2: {
      badge: "🥈",
      bg: "bg-slate-50",
      border: "border-slate-200",
    },
    3: {
      badge: "🥉",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-green-700">
            🏆 Student Innovation
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Monthly Leaderboard
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Students making an impact by solving real problems and creating
            meaningful change in their communities.
          </p>
        </div>

        {/* Leaderboard */}
        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {students.map((student) => {
            const style = rankStyles[student.rank]

            return (
              <div
                key={student.rank}
                className={`group flex items-center justify-between rounded-2xl border ${style.border} ${style.bg} px-5 py-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:px-7`}
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Rank */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                    {style.badge}
                  </div>

                  {/* Student */}
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {student.name}
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {student.rank === 1
                        ? "Top Innovator"
                        : `Rank #${student.rank}`}
                    </p>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="text-xl font-extrabold text-green-700 sm:text-2xl">
                    {student.points.toLocaleString()}
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Points
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom message */}
        <div className="mt-12 text-center">
          <p className="text-sm font-medium text-slate-500">
            Keep innovating. Keep solving. Keep making an impact. 🌱
          </p>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard