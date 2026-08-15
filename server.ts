import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in process.env");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Single Image Analysis Endpoint
app.post("/api/analyze-image", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const ai = getGenAI();

    const imagePart = {
      inlineData: {
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        mimeType: mimeType || "image/jpeg",
      },
    };

    const promptText = `
You are an expert AI prompt engineer and computer vision specialist for top AI image generators (Midjourney v6, DALL-E 3, Stable Diffusion XL, Flux.1).
Analyze the uploaded image in extreme detail and return a JSON object with comprehensive prompt metadata and stylistic descriptions.

Ensure the response strictly follows this JSON structure:
{
  "primaryPrompt": "A highly detailed, comprehensive master prompt describing the subject, environment, artistic style, medium, composition, lighting, camera specs, color palette, and mood.",
  "subjectAndAction": "Specific description of main subjects, poses, actions, objects, and key elements.",
  "artStyle": "Artistic medium and movement (e.g., Octane Render 3D, Photorealistic, Oil Painting, Cyberpunk Concept Art, Vector Illustration, 35mm Vintage Photo).",
  "lightingAndAtmosphere": "Lighting source, direction, intensity, and mood (e.g., Volumetric rim lighting, soft natural window light, chiaroscuro contrast, golden hour warmth, cinematic fog).",
  "cameraAndSettings": "Camera body, lens focal length, aperture, shutter speed, angle (e.g., Hasselblad H6D-100c, 85mm f/1.4 lens, shallow depth of field, bokeh, eye-level perspective).",
  "compositionAndFraming": "Framing rules and layout (e.g., Centered composition, golden ratio, rule of thirds, low angle shot, macro close-up).",
  "colorPalette": [
    {"hex": "#HEX", "name": "Color Name", "role": "Primary/Accent/Background"}
  ],
  "suggestedTags": [
    {"category": "Style", "tag": "3D Render"},
    {"category": "Lighting", "tag": "Raytracing"},
    {"category": "Camera", "tag": "85mm Lens"},
    {"category": "Mood", "tag": "Ethereal"},
    {"category": "Engine", "tag": "Unreal Engine 5"}
  ],
  "negativePrompt": "blurry, low quality, distorted, oversaturated, watermark, signature, extra limbs, bad anatomy, out of frame, pixelated",
  "modelPrompts": {
    "midjourney": "/imagine prompt: [detailed prompt] --ar 16:9 --v 6.0 --style raw --stylize 250",
    "stableDiffusion": "Masterpiece, best quality, [detailed prompt] | Negative prompt: blurry, low quality, bad anatomy | Steps: 30, CFG: 7.0, Sampler: DPM++ 2M Karras",
    "dalle3": "[Natural descriptive narrative prompt optimized for DALL-E 3 focusing on precise detail and context]",
    "flux": "[Photorealistic or artistic prompt formatted for Flux.1 with hyper-specific texture and lighting descriptors]"
  },
  "confidenceScore": 98
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [imagePart, { text: promptText }],
      },
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini model");
    }

    const data = JSON.parse(text);
    res.json({ success: true, result: data });
  } catch (error: any) {
    console.error("Error analyzing image:", error);
    res.status(500).json({
      error: error.message || "Failed to analyze image",
      details: String(error),
    });
  }
});

// Prompt Enhancement Endpoint
app.post("/api/enhance-prompt", async (req, res) => {
  try {
    const { prompt, style, targetModel } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();

    const systemInstruction = `You are a world-class prompt engineer. Expand and optimize the input prompt for ${
      targetModel || "General AI Image Generator"
    } in the style of ${style || "High Fidelity Photorealism"}.
Add vivid sensory details, lighting nuances, camera angles, color grading, and artistic keywords without changing the core subject. Keep it under 150 words. Return JSON with 'enhancedPrompt' and 'addedKeywords'.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Error enhancing prompt:", error);
    res.status(500).json({ error: error.message || "Failed to enhance prompt" });
  }
});

// Real-Time Test Preview Generation Endpoint
app.post("/api/generate-preview-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();

    // Generate preview using gemini-3.1-flash-lite-image
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let generatedImageUrl: string | null = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error("Image generation completed but no inline image data was returned.");
    }

    res.json({ success: true, imageUrl: generatedImageUrl });
  } catch (error: any) {
    console.error("Error generating preview image:", error);
    res.status(500).json({
      error: error.message || "Failed to generate preview image",
    });
  }
});

// Start Express + Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PromptVision Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
