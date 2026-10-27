/**
 * Gemini AI Service — StudyFlow AI Coach
 *
 * Uses Google's Gemini API (REST, no SDK needed) to provide
 * study-related AI chat, plan generation, and study tips.
 *
 * Includes retry logic with exponential backoff for rate limits.
 */
import { GEMINI_API_KEY } from '../../config';

const MODEL = 'gemini-2.0-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are StudyFlow AI Coach — a friendly, motivating study assistant built into the StudyFlow mobile app.

## About StudyFlow App
StudyFlow is an AI-powered study companion app for university and high-school students. Here are its features:

### 📱 Home Dashboard
- Shows upcoming tasks, exams, and today's schedule
- Quick stats: study hours, tasks completed, current streak
- Quick-add button for new tasks/exams

### 📅 Smart Planner
- Visual timetable showing classes by day
- Task list with filters (Today, This Week, Upcoming)
- Drag-and-drop study block planner
- Add/edit classes, tasks, and exams

### ⏱️ Focus Timer
- Pomodoro timer (25/50 min sessions)
- Virtual garden — plant a tree that grows while you study
- If you leave the app during focus, the tree dies!
- Garden collection to view all grown plants
- Focus session analytics

### 📊 Grades & Analytics
- Grade overview by subject with GPA calculation
- Grade predictor — predicts future GPA based on trends
- Add grades for assignments, quizzes, midterms, finals
- Subject-level gradebook with weighted categories

### 🤖 AI Coach (You!)
- Chat-based study assistant (this conversation)
- Study plan review and suggestions
- Difficulty prediction for upcoming exams
- Personalized study tips

### ⚙️ Settings
- Profile with user email
- Dark/Light mode toggle
- Export data as JSON
- Clear cache

## Your Role
- Help students plan study sessions, break down topics, and stay motivated
- Give concise, actionable study tips
- Explain subjects clearly with examples when asked
- Suggest how to use StudyFlow features effectively
- Use emojis sparingly (✨, 📚, 💪, 🎯) to keep responses friendly
- Keep answers SHORT (2-4 paragraphs max) unless asked for detail
- Always encourage the student and celebrate their effort
- When asked about the app, explain its features helpfully

## You do NOT:
- Give medical, legal, or financial advice
- Write full essays or do homework for students
- Discuss topics completely unrelated to education

When generating a study plan, structure it with clear time blocks and priorities.`;

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

/** Sleep helper for retry backoff */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Fetch with retry for 429 rate limits */
async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        const response = await fetch(url, options);

        if (response.status === 429 && attempt < retries) {
            // Parse retry delay from response if available, otherwise use defaults
            let delay = (attempt + 1) * 15000; // 15s, 30s
            try {
                const errBody = await response.clone().json();
                const retryInfo = errBody?.error?.details?.find((d: any) => d.retryDelay);
                if (retryInfo?.retryDelay) {
                    const seconds = parseInt(retryInfo.retryDelay);
                    if (!isNaN(seconds)) delay = (seconds + 2) * 1000; // add 2s buffer
                }
            } catch { }
            console.log(`[Gemini] Rate limited, retrying in ${delay / 1000}s...`);
            await sleep(delay);
            continue;
        }

        return response;
    }

    throw new Error('Gemini API: max retries exceeded');
}

export const geminiService = {

    /**
     * Send a message and get a response, maintaining conversation history.
     */
    chat: async (messages: ChatMessage[], userMessage: string): Promise<string> => {
        // Build conversation history for Gemini
        const contents = [
            // System instruction
            {
                role: 'user',
                parts: [{ text: SYSTEM_PROMPT + '\n\nPlease acknowledge briefly.' }],
            },
            {
                role: 'model',
                parts: [{ text: 'Ready to help! I\'m your StudyFlow AI Coach. Ask me anything about studying or the app! ✨' }],
            },
            // Previous messages
            ...messages.map((m) => ({
                role: m.role,
                parts: [{ text: m.text }],
            })),
            // New user message
            {
                role: 'user',
                parts: [{ text: userMessage }],
            },
        ];

        const body = JSON.stringify({
            contents,
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 1024,
            },
        });

        const response = await fetchWithRetry(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('The AI is taking a short break due to high usage. The free Gemini API has daily limits — please try again in a few minutes! 🕐');
            }
            throw new Error(`AI temporarily unavailable. Please try again shortly.`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('No response from AI. Please try again.');
        return text;
    },

    /**
     * Generate a quick study tip (no conversation history needed).
     */
    quickTip: async (subject: string): Promise<string> => {
        const prompt = `Give me one quick, actionable study tip for ${subject}. Keep it to 2-3 sentences.`;
        return geminiService.chat([], prompt);
    },
};
