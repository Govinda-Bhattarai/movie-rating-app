const API_URL = "http://192.168.1.27:3000";
const OMDB_API_URL = "https://www.omdbapi.com";

// ✅ Correctly get the API key from environment variable
const apiKey = process.env.VUE_APP_API_KEY;
console.log("OMDB API KEY:", apiKey); // Should print '21785ab2' if .env is correct

export async function fetchMovies(query) {
  try {
    const res = await fetch(
      `${OMDB_API_URL}/?apikey=${apiKey}&s=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    return data.Search || [];
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
}

export async function fetchMovieDetails(id) {
  try {
    const res = await fetch(
      `${OMDB_API_URL}/?apikey=${apiKey}&i=${id}&plot=full`
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

export async function fetchCommentsByMovieId(movieId) {
  try {
    const response = await fetch(`${API_URL}/reviews?movieId=${movieId}`);
    if (!response.ok) throw new Error("Failed to fetch comments");
    const reviews = await response.json();

    const reviewsWithUserDetails = await Promise.all(
      reviews.map(async (review) => {
        try {
          const userResponse = await fetch(`${API_URL}/users/${review.userId}`);
          if (userResponse.ok) {
            const user = await userResponse.json();
            return {
              ...review,
              user: user.name || review.user,
              userAvatar: user.avatar,
            };
          }
          return review;
        } catch (error) {
          console.error("Error fetching user details:", error);
          return review;
        }
      })
    );

    return reviewsWithUserDetails;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

export async function submitMovieRating({
  movieId,
  rating,
  comment,
  userId,
  userName,
}) {
  try {
    const movieDetails = await fetchMovieDetails(movieId);
    if (!movieDetails) throw new Error("Movie not found");

    const ratingResponse = await fetch(`${API_URL}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: Date.now(),
        userId,
        movieId,
        rating,
        date: new Date().toISOString(),
        movie: {
          imdbID: movieDetails.imdbID,
          Title: movieDetails.Title,
          Year: movieDetails.Year,
          Poster: movieDetails.Poster,
        },
      }),
    });

    if (!ratingResponse.ok) {
      const errorData = await ratingResponse.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to submit rating");
    }

    const ratingData = await ratingResponse.json();

    if (comment && comment.trim()) {
      const reviewResponse = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Date.now(),
          movieId,
          userId,
          user: userName,
          rating,
          text: comment,
          date: new Date().toISOString(),
        }),
      });

      if (!reviewResponse.ok) {
        const errorData = await reviewResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit review");
      }

      await reviewResponse.json();
    }

    return ratingData;
  } catch (err) {
    console.error("Error submitting rating/review:", err);
    throw err;
  }
}

export async function getRatedMoviesByUser(userId) {
  try {
    const response = await fetch(`${API_URL}/ratings?userId=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch rated movies");
    const ratings = await response.json();
    return ratings.map((rating) => rating.movie);
  } catch (error) {
    console.error("Error fetching rated movies:", error);
    return [];
  }
}

export async function getPopularMovies() {
  try {
    const response = await fetch(`${API_URL}/ratings`);
    if (!response.ok) throw new Error("Failed to fetch ratings");
    const ratings = await response.json();

    const movieRatings = ratings.reduce((acc, rating) => {
      if (!rating.movie) return acc;
      const movieId = rating.movie.imdbID;
      if (!acc[movieId]) {
        acc[movieId] = {
          ...rating.movie,
          totalRating: 0,
          count: 0,
        };
      }
      acc[movieId].totalRating += rating.rating;
      acc[movieId].count++;
      return acc;
    }, {});

    return Object.values(movieRatings)
      .map((movie) => ({
        ...movie,
        averageRating: movie.totalRating / movie.count,
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 6);
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    return [];
  }
}
