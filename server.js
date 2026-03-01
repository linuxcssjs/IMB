const express = require("express");
const app = express();
app.use(express.json());

// Sample DB
const books = {
  "9780001": { title: "Clean Code", author: "Robert C. Martin", reviews: {} },
  "9780002": { title: "Eloquent JavaScript", author: "Marijn Haverbeke", reviews: {} }
};

let users = []; // {username,password}
let sessions = new Map(); // token -> username
const tokenOf = (u) => `token_${u}_${Date.now()}`;

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  const u = sessions.get(token);
  if (!u) return res.status(401).json({ message: "Unauthorized" });
  req.user = u;
  next();
}

// 2) getallbooks
app.get("/getallbooks", (req, res) => res.json(books));

// 3) getbooksbyISBN
app.get("/getbooksbyISBN/:isbn", (req, res) => {
  const b = books[req.params.isbn];
  if (!b) return res.status(404).json({ message: "Book not found" });
  res.json(b);
});

// 4) getbooksbyauthor
app.get("/getbooksbyauthor/:author", (req, res) => {
  const a = req.params.author.toLowerCase();
  const result = Object.entries(books)
    .filter(([_, b]) => b.author.toLowerCase().includes(a))
    .map(([isbn, b]) => ({ isbn, ...b }));
  res.json(result);
});

// 5) getbooksbytitle
app.get("/getbooksbytitle/:title", (req, res) => {
  const t = req.params.title.toLowerCase();
  const result = Object.entries(books)
    .filter(([_, b]) => b.title.toLowerCase().includes(t))
    .map(([isbn, b]) => ({ isbn, ...b }));
  res.json(result);
});

// 6) getbookreview
app.get("/getbookreview/:isbn", (req, res) => {
  const b = books[req.params.isbn];
  if (!b) return res.status(404).json({ message: "Book not found" });
  res.json(b.reviews);
});

// 7) register
app.post("/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: "username/password required" });
  if (users.some(u => u.username === username)) return res.status(409).json({ message: "User exists" });
  users.push({ username, password });
  res.json({ message: "User registered successfully" });
});

// 8) login
app.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const ok = users.some(u => u.username === username && u.password === password);
  if (!ok) return res.status(401).json({ message: "Invalid login" });
  const token = tokenOf(username);
  sessions.set(token, username);
  res.json({ message: "Login successful", token });
});

// 9) reviewadded
app.put("/reviewadded/:isbn", auth, (req, res) => {
  const b = books[req.params.isbn];
  if (!b) return res.status(404).json({ message: "Book not found" });
  const { review } = req.body || {};
  if (!review) return res.status(400).json({ message: "review required" });
  b.reviews[req.user] = review;
  res.json({ message: "Review added/updated", reviews: b.reviews });
});

// 10) deletereview
app.delete("/deletereview/:isbn", auth, (req, res) => {
  const b = books[req.params.isbn];
  if (!b) return res.status(404).json({ message: "Book not found" });
  delete b.reviews[req.user];
  res.json({ message: "Review deleted", reviews: b.reviews });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on", PORT));
