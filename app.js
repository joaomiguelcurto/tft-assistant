import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const APP = express();
const PORT = 8080;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to /src/public
const publicPath = path.join(__dirname, "src", "public");
console.log("Public folder:", publicPath);

// Serve /src/public as static
APP.use(express.static(publicPath));

// Root
APP.get("/", (req, res) => {
  res.send("Hello World from Express!");
});

// /champions
APP.get("/champions", (req, res) => {
  const filePath = path.join(publicPath, "APITestChampions.html");
  console.log("Serving:", filePath);
  res.sendFile(filePath);
});

// /augments
APP.get("/augments", (req, res) => {
  const filePath = path.join(publicPath, "APITestAugments.html");
  console.log("Serving:", filePath);
  res.sendFile(filePath);
});

APP.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
