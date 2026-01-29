import { useMemo } from "react";
import TinderCard from "react-tinder-card";

function SwipeCard({ users, currentIndex, onSwipe, stats }) {
  // Show only current and next few cards for performance
  const visibleCards = useMemo(() => {
    return users.slice(currentIndex, currentIndex + 3).reverse();
  }, [users, currentIndex]);

  const swiped = (direction, user) => {
    onSwipe(direction, user);
  };

  const swipe = (dir) => {
    if (currentIndex < users.length) {
      // Programmatic swipe - the TinderCard will handle animation
      const currentUser = users[currentIndex];
      swiped(dir, currentUser);
    }
  };

  const currentUser = users[currentIndex];

  if (!currentUser) {
    return null;
  }

  // Generate a placeholder avatar with initials
  const getInitials = (username) => {
    return username.substring(0, 2).toUpperCase();
  };

  // Generate a consistent color based on username
  const getAvatarColor = (username) => {
    const colors = [
      "from-pink-400 to-rose-500",
      "from-purple-400 to-indigo-500",
      "from-blue-400 to-cyan-500",
      "from-green-400 to-emerald-500",
      "from-yellow-400 to-orange-500",
      "from-red-400 to-pink-500",
    ];
    const charIndex = username.charCodeAt(0) % colors.length;
    return colors[charIndex];
  };

  return (
    <div className="flex flex-col items-center">
      {/* Card Container */}
      <div className="relative w-full max-w-sm h-[500px] card-stack">
        {visibleCards.map((user) => (
          <TinderCard
            key={user.username}
            className="swipe absolute"
            onSwipe={(dir) => swiped(dir, user)}
            preventSwipe={["up", "down"]}
          >
            <div className="card bg-white h-[480px] select-none">
              {/* Profile Image / Avatar */}
              <div className="profile-image-container relative h-80 bg-gray-100">
                {user.profilePicUrl ? (
                  <img
                    src={user.profilePicUrl}
                    alt={user.username}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${getAvatarColor(user.username)} flex items-center justify-center`}
                  >
                    <span className="text-6xl font-bold text-white/90">
                      {getInitials(user.username)}
                    </span>
                  </div>
                )}

                {/* Username overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <h2 className="text-2xl font-bold text-white">
                    @{user.username}
                  </h2>
                  {user.timestamp && (
                    <p className="text-white/80 text-sm mt-1">
                      Suivi depuis le{" "}
                      {new Date(user.timestamp * 1000).toLocaleDateString(
                        "fr-FR",
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Info */}
              <div className="card-content p-6">
                <div className="flex items-center justify-center gap-4 text-gray-500">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="text-sm">Ne vous suit pas</span>
                  </div>
                </div>

                {/* Instagram link */}
                <a
                  href={`https://instagram.com/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-center text-pink-500 hover:text-pink-600 text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  Voir le profil sur Instagram →
                </a>
              </div>
            </div>
          </TinderCard>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-8 mt-8">
        <button
          onClick={() => swipe("left")}
          className="action-btn w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 group"
        >
          <svg
            className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center">
          <p className="text-white/80 text-sm">
            {stats.total - stats.processed} restant
            {stats.total - stats.processed > 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => swipe("right")}
          className="action-btn w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-50 group"
        >
          <svg
            className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-white/70 text-sm">
        <p>
          ← Swipe gauche pour{" "}
          <span className="text-red-300 font-medium">Unfollow</span>
        </p>
        <p>
          Swipe droite pour{" "}
          <span className="text-green-300 font-medium">Garder</span> →
        </p>
      </div>
    </div>
  );
}

export default SwipeCard;
