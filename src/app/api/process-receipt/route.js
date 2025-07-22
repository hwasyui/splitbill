// src/app/api/process-receipt/route.js

import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

export async function POST(req) {
  const formData = await req.formData();
  const imageFile = formData.get("receipt");

  if (!imageFile) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await imageFile.arrayBuffer());
  const base64Image = buffer.toString("base64");

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `You are a receipt parser. Extract structured data in this format:\n\n{
  "restaurant": string,
  "date": string,
  "items": [{ "name": string, "qty": number, "price": number }],
  "tax": number
}\n\nOnly return raw JSON (no markdown backticks, no explanation).`
          },
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Image
            }
          }
        ]
      }
    ]
  };

  try {
    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const geminiJson = await geminiRes.json();

    console.log("Gemini response JSON:", geminiJson);

    const rawText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("No content returned from Gemini.");

    // Clean markdown artifacts (like ```json)
    const cleaned = rawText
      .trim()
      .replace(/^```json/, "")
      .replace(/^```/, "")
      .replace(/```$/, "");

    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Gemini processing error:", err);
    return NextResponse.json({ error: "Failed to process image", details: err.message }, { status: 500 });
  }
}
