import Papa from "papaparse";

/**
 * Parse Instagram CSV export file
 * Expected format: username,profile_url or just username per line
 */
export function parseInstagramCSV(csvText) {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase().trim(),
  });

  // Try to find username column
  const usernameColumns = ["username", "user", "name", "account", "handle"];
  let usernameKey = null;

  if (result.meta.fields) {
    for (const col of usernameColumns) {
      if (result.meta.fields.includes(col)) {
        usernameKey = col;
        break;
      }
    }
  }

  // If no header found, treat as simple list
  if (!usernameKey && result.data.length > 0) {
    // Check if it's a simple list without headers
    const firstRow = result.data[0];
    const firstValue = Object.values(firstRow)[0];

    if (
      firstValue &&
      typeof firstValue === "string" &&
      !firstValue.includes(",")
    ) {
      return result.data
        .map((row) => ({
          username: Object.values(row)[0]?.trim(),
          timestamp: null,
          profilePicUrl: null,
        }))
        .filter((u) => u.username);
    }
  }

  return result.data
    .map((row) => ({
      username: (row[usernameKey] || row[Object.keys(row)[0]])?.trim(),
      timestamp: row.timestamp || row.date || null,
      profilePicUrl: row.profile_pic || row.avatar || row.photo || null,
    }))
    .filter((u) => u.username);
}

/**
 * Parse Instagram JSON export (official format from Instagram data download)
 * The format varies between following and followers files
 */
export function parseInstagramJSON(jsonText, type = "following") {
  try {
    const data = JSON.parse(jsonText);

    // Handle official Instagram data export format
    // Following: { "relationships_following": [...] }
    // Followers: { "relationships_followers": [...] } or just array

    let users = [];

    if (type === "following") {
      // Check various possible structures for following
      if (data.relationships_following) {
        users = data.relationships_following;
      } else if (Array.isArray(data)) {
        users = data;
      } else if (data.following) {
        users = data.following;
      }
    } else {
      // Check various possible structures for followers
      if (data.relationships_followers) {
        users = data.relationships_followers;
      } else if (Array.isArray(data)) {
        users = data;
      } else if (data.followers) {
        users = data.followers;
      }
    }

    // Parse the nested structure
    return users
      .map((item) => {
        // Official Instagram format has nested structure
        if (item.string_list_data && item.string_list_data[0]) {
          const userData = item.string_list_data[0];
          return {
            username: userData.value,
            timestamp: userData.timestamp,
            profilePicUrl: null, // Not available in export
          };
        }

        // Simpler format
        if (item.username) {
          return {
            username: item.username,
            timestamp: item.timestamp || null,
            profilePicUrl: item.profile_pic_url || null,
          };
        }

        // Direct value
        if (typeof item === "string") {
          return {
            username: item,
            timestamp: null,
            profilePicUrl: null,
          };
        }

        return null;
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error(
      "Format JSON invalide. Vérifiez que le fichier est bien un export Instagram.",
    );
  }
}

/**
 * Find users that you follow but who don't follow you back
 */
export function findNonFollowers(following, followers) {
  const followerUsernames = new Set(
    followers.map((f) => f.username.toLowerCase()),
  );

  const nonFollowers = following.filter(
    (user) => !followerUsernames.has(user.username.toLowerCase()),
  );

  // Sort by username
  return nonFollowers.sort((a, b) =>
    a.username.toLowerCase().localeCompare(b.username.toLowerCase()),
  );
}

/**
 * Utility to create sample data for testing
 */
export function generateSampleData() {
  const sampleFollowing = [
    { username: "nike", timestamp: 1609459200, profilePicUrl: null },
    { username: "adidas", timestamp: 1609459200, profilePicUrl: null },
    { username: "apple", timestamp: 1609459200, profilePicUrl: null },
    { username: "google", timestamp: 1609459200, profilePicUrl: null },
    { username: "friend1", timestamp: 1609459200, profilePicUrl: null },
    { username: "friend2", timestamp: 1609459200, profilePicUrl: null },
  ];

  const sampleFollowers = [
    { username: "friend1", timestamp: 1609459200, profilePicUrl: null },
    { username: "friend2", timestamp: 1609459200, profilePicUrl: null },
    { username: "random_follower", timestamp: 1609459200, profilePicUrl: null },
  ];

  return { following: sampleFollowing, followers: sampleFollowers };
}
