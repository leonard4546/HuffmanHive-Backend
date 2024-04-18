const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { fork } = require("child_process");
const fileUpload = require("express-fileupload");
const path = require("path"); // Add this line to import the path module

// Create a new express application instance
const PORT = 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  fileUpload({
    tempFileDir: "temp",
    useTempFiles: true,
  })
);

app.use(express.static(path.join(__dirname, "temp")));

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/compress-video", (req, res) => {
  const video = req.files.video;

  if (!video) {
    return res.status(400).send("No file uploaded");
  }

  const tempFilePath = video.tempFilePath;
  if (!tempFilePath) {
    return res.status(400).send("Error processing file");
  }

  const child = fork("video.js");
  child.send({ tempFilePath, name: video.name });

  child.on("message", (message) => {
    const { statusCode, text, filePath } = message;
    if (statusCode === 200) {
      res.send(filePath); // Send file path to the client
    } else {
      res.status(statusCode).send(text);
    }
  });
});

// Serve the compressed video file
app.get("/compressed_video.mp4", (req, res) => {
  const fileName = req.query.fileName; // Get the file name from query parameters

  if (!fileName) {
    return res.status(400).send("File name not provided");
  }

  const filePath = `./${fileName}`;

  res.download(filePath);
});

app.post("/compress-audio", (req, res) => {
  const audio = req.files.audio;

  if (!audio) {
    return res.status(400).send("No file uploaded");
  }

  const tempFilePath = audio.tempFilePath;
  if (!tempFilePath) {
    return res.status(400).send("Error processing file");
  }

  const child = fork("audio.js");
  child.send({ tempFilePath, name: audio.name });

  child.on("message", (message) => {
    const { statusCode, text, filePath } = message;
    if (statusCode === 200) {
      res.send(filePath); // Send file path to the client
    } else {
      res.status(statusCode).send(text);
    }
  });
});

app.get("/compressed_audio.mp3", (req, res) => {
  const fileName = req.query.fileName; // Get the file name from query parameters
  if (!fileName) {
    return res.status(400).send("File name not provided");
  }
  const filePath = `./temp/${fileName}`;
  res.download(filePath);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on  http://localhost:${PORT}`);
});
