// src/services/aiService.ts
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// Helper to convert image URL to a base64 string for the Gemini API
async function urlToGenerativePart(url: string, mimeType: string) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return {
        inlineData: {
            data: Buffer.from(buffer).toString("base64"),
            mimeType,
        },
    };
}

const getApiKey = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key not found in .env file.');
    }
    return apiKey;
};

/**
 * Analyzes an image URL AND caption to generate tags, vibe, and quality assessment.
 */
export const analyzeImage = async (imageUrl: string, caption: string = '') => { // Added caption parameter
    if (!imageUrl) return null; // Don't analyze if there's no image

    const apiKey = getApiKey();
    // Using a multimodal model capable of understanding images
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
        console.log(`[Gemini Image]: Analyzing image ${imageUrl.slice(0, 50)}...`);
        const imagePart = await urlToGenerativePart(imageUrl, "image/jpeg");

        const prompt = `Analyze this Instagram image and its caption. Respond ONLY with a single JSON object. Do not add markdown.
        The JSON must have this structure: { "tags": ["tag1", "tag2"], "vibe": "...", "quality": { "lighting": "..." } }
        - "tags": 1-5 relevant keywords extracted from both the image content and the caption. Use lowercase. Examples: 'fitness', 'travel', 'food', 'lifestyle', 'cricket', 'birthday', 'celebration'.
        - "vibe": A single string from: ['casual', 'aesthetic', 'luxury', 'energetic', 'calm', 'professional', 'happy', 'moody', 'minimalist'].
        - "quality": An object with a "lighting" key describing light (e.g., "Good", "Harsh", "Dim", "Natural").`;

        // Include caption in the text part of the prompt
        const textPromptWithCaption = `Caption: "${caption}"\n${prompt}`;

        const payload = { contents: [{ parts: [{ text: textPromptWithCaption }, imagePart] }] };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody: any = await response.json();
            throw new Error(`API request failed: ${errorBody.error.message}`);
        }

        const result: any = await response.json();
        const textResponse = result.candidates[0].content.parts[0].text;
        return JSON.parse(textResponse.replace(/```json/g, '').replace(/```/g, '').trim());

    } catch (error) {
        console.error(`[Gemini Image]: Analysis failed for ${imageUrl}:`, error);
        return null; // Return null on failure
    }
};

/**
 * Analyzes influencer data to infer audience demographics.
 */
export const analyzeAudienceDemographics = async (influencerData: any) => {
    const apiKey = getApiKey();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
        console.log(`[Gemini Demographics]: Analyzing audience for ${influencerData.username}...`);
        const postCaptions = influencerData.recentPosts.map((p: any) => p.caption).join('\n');

        const prompt = `Analyze this influencer's data to infer their audience demographics. Respond ONLY with a single JSON object. Do not add markdown.
        Influencer:
        - Username: ${influencerData.username}
        - Full Name: ${influencerData.fullName}
        - Followers: ${influencerData.followers}
        - Recent Captions Summary: ${postCaptions.substring(0, 500)}...

        The JSON object must have this structure:
        {
          "genderSplit": [{ "name": "Male", "value": number }, { "name": "Female", "value": number }],
          "ageGroups": [{ "name": "18-24", "value": number }, { "name": "25-34", "value": number }, ...],
          "topGeographies": [{ "name": "USA", "value": number }, { "name": "Brazil", "value": number }, ...]
        }
        - Sum of values for genderSplit and ageGroups must be 100.`;

        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody: any = await response.json();
            throw new Error(`API request failed: ${errorBody.error.message}`);
        }

        const result: any = await response.json();
        const textResponse = result.candidates[0].content.parts[0].text;
        return JSON.parse(textResponse.replace(/```json/g, '').replace(/```/g, '').trim());

    } catch (error) {
        console.error(`[Gemini Demographics]: Analysis failed for ${influencerData.username}:`, error);
        return null; // Return null on failure
    }
};