import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from 'http-proxy-middleware';

const APP = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to /src/public
const publicPath = path.join(__dirname, "src", "public");
console.log("Public folder:", publicPath);

// Live Client Proxy Setup
const LIVECLIENT_API_TARGET = 'https://127.0.0.1:2999';

const apiProxy = createProxyMiddleware({
    target: LIVECLIENT_API_TARGET,
    // Makes sure that the target server belives that the request is coming from its own intended domain
    changeOrigin: true,
    // Bypasses the SSL/TLS certificate verification.
    secure: false,
    
    pathRewrite: {
        // Transforms the default '/' into '/liveclientdata/ to ensure it fits the 'https://127.0.0.1:2999/liveclientdata/ENDPOINT_EXAMPLE'
        // Which only requires to use the URL '/api/allgamedata' to get the information from 'https://127.0.0.1:2999/liveclientdata/allgamedata'
        '^/': '/liveclientdata/',
    },
    
    // Logs proxy activity (forwarding) to the console.
    logLevel: 'debug',
});

// Make sure this line appears before 'APP.use(express.static(publicPath));' 
// The proxy will catch any URL starting with /api/ before this line is reached.
// /api
APP.use('/api', apiProxy);

// /src/public as static
APP.use(express.static(publicPath));

// root
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

// /liveclient
APP.get("/liveclient", (req, res) => {
  const filePath = path.join(publicPath, "APITestLiveClient.html");
  console.log("Serving:", filePath);
  res.sendFile(filePath);
});

APP.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Live Client API proxied at http://localhost:${PORT}/api/`);
});