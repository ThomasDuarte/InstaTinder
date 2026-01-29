function Header({ step, stats, onReset, canUndo, onUndo }) {
  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">InstaTinder</h1>
          </div>

          {/* Progress & Actions */}
          <div className="flex items-center gap-4">
            {step === "swipe" && stats.total > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-white/80 text-sm">
                  <span className="font-bold text-white">
                    {stats.processed}
                  </span>
                  <span> / {stats.total}</span>
                </div>
                <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full progress-bar"
                    style={{
                      width: `${(stats.processed / stats.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {canUndo && (
              <button
                onClick={onUndo}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Annuler"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </button>
            )}

            {step !== "upload" && (
              <button
                onClick={onReset}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Recommencer
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
