// services/auth.js
const API_URL = "http://192.168.1.27:3000";

export async function loginUser({ email, password }) {
  try {
    const res = await fetch(
      `${API_URL}/users?email=${email}&password=${password}`
    );
    if (!res.ok) throw new Error("Network error");

    const users = await res.json();
    if (users.length === 0) {
      throw new Error("Invalid credentials");
    }

    // Get the user with the most complete information
    const user = users.reduce((prev, current) => {
      return Object.keys(current).length > Object.keys(prev).length
        ? current
        : prev;
    });

    return user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

//function to register a user
export async function registerUser({ name, email, password }) {
  try {
    // Check if user already exists
    const existing = await fetch(`${API_URL}/users?email=${email}`);
    const users = await existing.json();

    if (users.length > 0) {
      throw new Error("Email already registered");
    }

    // Register new user
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: Date.now().toString(),
        name,
        email,
        password,
        joinDate: new Date().toISOString(),
        avatar: null,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to register user");
    }
    return await res.json();
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

// Get a specific user by ID
export async function getUserById(userId) {
  try {
    const res = await fetch(`${API_URL}/users/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch user");
    return await res.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

// Get rated movies for a specific user (assuming /ratings or /movies endpoint stores ratings)
export async function getRatedMoviesByUser(userId) {
  const res = await fetch(`${API_URL}/ratings?userId=${userId}&_expand=movie`);
  if (!res.ok) throw new Error("Failed to fetch rated movies");
  const ratings = await res.json();

  // Assuming rating has a movie object nested due to `_expand=movie`
  return ratings.map((r) => r.movie);
}

export async function getPopularMovies() {
  const res = await fetch(
    `${API_URL}/movies?_sort=rating&_order=desc&_limit=6`
  );
  if (!res.ok) throw new Error("Failed to fetch popular movies");
  return await res.json();
}

export async function updateUserProfile(userId, updates) {
  try {
    const res = await fetch(`${API_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error("Failed to update profile");
    return await res.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}
