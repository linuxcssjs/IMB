const axios = require("axios");

// Base URL (local default)
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

/**
 * Get all books
 */
async function getAllBooks() {
  const res = await axios.get(`${BASE_URL}/getallbooks`);
  return res.data;
}

/**
 * Get books by ISBN
 */
async function getBooksByISBN(isbn) {
  const res = await axios.get(`${BASE_URL}/getbooksbyISBN/${encodeURIComponent(isbn)}`);
  return res.data;
}

/**
 * Get books by Author
 */
async function getBooksByAuthor(author) {
  const res = await axios.get(`${BASE_URL}/getbooksbyauthor/${encodeURIComponent(author)}`);
  return res.data;
}

/**
 * Get books by Title
 */
async function getBooksByTitle(title) {
  const res = await axios.get(`${BASE_URL}/getbooksbytitle/${encodeURIComponent(title)}`);
  return res.data;
}

/**
 * Aggregate: get all + filter details from author/title/isbn
 * (This matches “get all books and their details based on author, title, ISBN” requirement)
 */
async function aggregate_context({ author, title, isbn } = {}) {
  const results = {};

  // Run requests in parallel (fast)
  const tasks = [];
  tasks.push(
    getAllBooks().then((data) => (results.all = data)).catch((e) => (results.allError = e.message))
  );

  if (author) {
    tasks.push(
      getBooksByAuthor(author)
        .then((data) => (results.byAuthor = data))
        .catch((e) => (results.byAuthorError = e.message))
    );
  }
  if (title) {
    tasks.push(
      getBooksByTitle(title)
        .then((data) => (results.byTitle = data))
        .catch((e) => (results.byTitleError = e.message))
    );
  }
  if (isbn) {
    tasks.push(
      getBooksByISBN(isbn)
        .then((data) => (results.byISBN = data))
        .catch((e) => (results.byISBNError = e.message))
    );
  }

  await Promise.all(tasks);
  return results;
}

module.exports = {
  getAllBooks,
  getBooksByISBN,
  getBooksByAuthor,
  getBooksByTitle,
  aggregate_context
};
