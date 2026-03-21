const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve('c:/Users/HP/Downloads/pasiveco-main/pasiveco-main/.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const apiKey = envConfig.GEMINI_API_KEY;

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There isn't a simple "listModels" in the Node SDK for Gemini yet, 
    // it's usually done via the Google AI Studio / GCP console.
    // But we can try to hit the REST API directly.
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("Available models:", JSON.stringify(data.models?.map(m => m.name), null, 2));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
