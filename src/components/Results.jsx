import { useEffect, useState } from "react";

// Composant UserItem - clic sur "Voir" marque automatiquement comme fait
const UserItem = ({ user, type, onMarkDone, isDone }) => {
  const handleViewClick = (e) => {
    // Marquer comme fait quand on clique pour voir le profil (seulement pour unfollow)
    if (type === "unfollow" && !isDone) {
      onMarkDone(user.username);
    }
    // Le lien s'ouvre normalement grâce à l'attribut href
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl transition-all ${
        isDone ? "bg-gray-100 opacity-60" : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
            isDone
              ? "bg-gray-400"
              : type === "unfollow"
                ? "bg-gradient-to-br from-red-400 to-pink-500"
                : "bg-gradient-to-br from-green-400 to-emerald-500"
          }`}
        >
          {isDone ? "✓" : user.username.substring(0, 1).toUpperCase()}
        </div>
        <div>
          <p
            className={`font-medium ${isDone ? "text-gray-500 line-through" : "text-gray-800"}`}
          >
            @{user.username}
          </p>
          {isDone && <p className="text-xs text-green-600">Déjà unfollowé ✓</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={`https://instagram.com/${user.username}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleViewClick}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            type === "unfollow" && !isDone
              ? "bg-pink-500 text-white hover:bg-pink-600"
              : "text-pink-500 hover:text-pink-600"
          }`}
        >
          {type === "unfollow" && !isDone ? "Ouvrir & Marquer ✓" : "Voir →"}
        </a>
      </div>
    </div>
  );
};

// Composant UserList
const UserList = ({ users, type, doneUsers, onMarkDone }) => (
  <div className="space-y-2 max-h-96 overflow-y-auto">
    {users.length === 0 ? (
      <p className="text-gray-500 text-center py-8">
        Aucun compte dans cette catégorie
      </p>
    ) : (
      users.map((user) => (
        <UserItem
          key={user.username}
          user={user}
          type={type}
          isDone={doneUsers.includes(user.username)}
          onMarkDone={onMarkDone}
        />
      ))
    )}
  </div>
);

function Results({ decisions, onReset }) {
  const [activeTab, setActiveTab] = useState("unfollow");
  const [copied, setCopied] = useState(false);
  const [doneUsers, setDoneUsers] = useState([]);

  // Charger les utilisateurs déjà unfollowés depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("instaTinder_done");
    if (saved) {
      setDoneUsers(JSON.parse(saved));
    }
  }, []);

  // Sauvegarder quand doneUsers change
  useEffect(() => {
    localStorage.setItem("instaTinder_done", JSON.stringify(doneUsers));
  }, [doneUsers]);

  const handleMarkDone = (username) => {
    setDoneUsers((prev) => [...prev, username]);
  };

  const handleUndoDone = (username) => {
    setDoneUsers((prev) => prev.filter((u) => u !== username));
  };

  const pendingUnfollows = decisions.unfollow.filter(
    (u) => !doneUsers.includes(u.username),
  );
  const completedUnfollows = decisions.unfollow.filter((u) =>
    doneUsers.includes(u.username),
  );

  const handleCopyUsernames = () => {
    // Ne copier que les usernames pas encore traités
    const usernames = pendingUnfollows.map((u) => u.username).join("\n");
    navigator.clipboard.writeText(usernames);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = "username,action,status,timestamp\n";
    const unfollowRows = decisions.unfollow
      .map(
        (u) =>
          `${u.username},unfollow,${doneUsers.includes(u.username) ? "done" : "pending"},${new Date().toISOString()}`,
      )
      .join("\n");
    const keepRows = decisions.keep
      .map((u) => `${u.username},keep,n/a,${new Date().toISOString()}`)
      .join("\n");

    const csv = headers + unfollowRows + "\n" + keepRows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `instagram-decisions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Analyse terminée ! 🎉
          </h2>
          <p className="text-gray-600">Voici le résumé de vos décisions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-red-50 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-red-500 stat-number">
              {pendingUnfollows.length}
            </div>
            <p className="text-red-600 font-medium text-sm mt-1">À unfollow</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-500 stat-number">
              {completedUnfollows.length}
            </div>
            <p className="text-blue-600 font-medium text-sm mt-1">Déjà fait</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-green-500 stat-number">
              {decisions.keep.length}
            </div>
            <p className="text-green-600 font-medium text-sm mt-1">À garder</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("unfollow")}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === "unfollow"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            À Unfollow ({pendingUnfollows.length})
          </button>
          <button
            onClick={() => setActiveTab("done")}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === "done"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Déjà fait ({completedUnfollows.length})
          </button>
          <button
            onClick={() => setActiveTab("keep")}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === "keep"
                ? "text-green-500 border-b-2 border-green-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            À Garder ({decisions.keep.length})
          </button>
        </div>

        {/* User Lists */}
        {activeTab === "unfollow" && (
          <UserList
            users={pendingUnfollows}
            type="unfollow"
            doneUsers={doneUsers}
            onMarkDone={handleMarkDone}
          />
        )}
        {activeTab === "done" && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {completedUnfollows.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun compte traité pour l'instant
              </p>
            ) : (
              completedUnfollows.map((user) => (
                <div
                  key={user.username}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        @{user.username}
                      </p>
                      <p className="text-xs text-blue-600">Unfollowé ✓</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUndoDone(user.username)}
                    className="px-3 py-1.5 bg-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === "keep" && (
          <UserList
            users={decisions.keep}
            type="keep"
            doneUsers={[]}
            onMarkDone={() => {}}
          />
        )}

        {/* Actions */}
        <div className="mt-8 space-y-3">
          {pendingUnfollows.length > 0 && (
            <button
              onClick={handleCopyUsernames}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copié !
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copier les {pendingUnfollows.length} restants
                </>
              )}
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Exporter en CSV
          </button>

          <button
            onClick={onReset}
            className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            Recommencer avec de nouveaux fichiers
          </button>
        </div>

        {/* Warning */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-800">⚠️ Important</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Cliquez sur "✓ Fait" après avoir unfollowé chaque compte sur
                Instagram. Ne dépassez pas 50-100 unfollows par jour pour éviter
                un ban.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;
