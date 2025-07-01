import express from "express";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMIN_API_KEY);
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));
app.use(express.json());

// Add quotes proxy endpoint
app.get("/api/quote", async (req, res) => {
  try {
    const response = await fetch("https://type.fit/api/quotes");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching quote:", error);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});

app.get("/api/chat", async (req, res) => {
  const { prompt } = req.query;
  if (!prompt) return res.status(400).send("No prompt");

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Credentials': 'true'
  });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Stream the response letter by letter
    for (let i = 0; i < text.length; i++) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: text[i] } }] })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 10)); // Delay between letters
    }
    
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (e) {
    console.error("Gemini error:", e);
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
});

app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).send("No prompt");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
      stream: true
    });

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (e) {
    console.error("OpenAI error:", e);
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
});

app.listen(3001, () => console.log("Server listening on :3001"));
