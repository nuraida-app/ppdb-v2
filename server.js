import "dotenv/config";
import app from "./app.js";
import { connect } from "./config/config.js";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "./client/dist")));

app.get("/", (req, res) => {
  res.redirect(process.env.DOMAIN_3);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/dist/index.html"));
});

app.listen(process.env.PORT, async () => {
  try {
    await connect();
    console.log(`Server running on port: ${process.env.PORT}`);
  } catch (error) {
    console.error(`Error connecting to database: ${error}`);
  }
});
