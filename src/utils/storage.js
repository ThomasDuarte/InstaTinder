const STORAGE_KEY = "instaTinder";

/**
 * Save current progress to localStorage
 */
export function saveToStorage(data) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...data,
        savedAt: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

/**
 * Load saved progress from localStorage
 */
export function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);

      // Check if data is not too old (30 days)
      const savedAt = new Date(data.savedAt);
      const now = new Date();
      const daysDiff = (now - savedAt) / (1000 * 60 * 60 * 24);

      if (daysDiff > 30) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
  return null;
}

/**
 * Clear all saved data
 */
export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}

/**
 * Export decisions to JSON file for backup
 */
export function exportToJSON(decisions) {
  const data = {
    exportedAt: new Date().toISOString(),
    unfollow: decisions.unfollow.map((u) => u.username),
    keep: decisions.keep.map((u) => u.username),
    stats: {
      totalUnfollow: decisions.unfollow.length,
      totalKeep: decisions.keep.length,
    },
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `instagram-decisions-${new Date().toISOString().split("T")[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
}
