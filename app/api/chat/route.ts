
import { NextRequest, NextResponse } from 'next/server';
import { saveChatMessage, getAvatarConfig, getRecentChatHistory } from '@/services/chatService';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { message, profileId, sessionId, userId } = await request.json();

    if (!message || !profileId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return NextResponse.json(
        { error: 'AI service not configured. Please add your Groq API key to environment variables.' },
        { status: 503 }
      );
    }

    // For preview mode, use default configuration
    if (userId === 'preview-user' || profileId === 'preview') {
      const defaultConfig = {
        name: 'Digital Twin',
        personality: 'I am a helpful and knowledgeable assistant.',
        instructions: 'Answer questions in a friendly and professional manner.',
        responseStyle: 'professional',
        enabled: true,
        knowledgeBase: ''
      };
      
      const response = await generateAIResponse(message, defaultConfig, []);
      return NextResponse.json({ response });
    }

    // Get avatar configuration for real users
    let avatarConfig;
    try {
      avatarConfig = await getAvatarConfig(userId);
    } catch (error) {
      console.error('Error fetching avatar config:', error);
      // Use default config if there's an error fetching user config
      avatarConfig = {
        name: 'Digital Twin',
        personality: 'I am a helpful and knowledgeable assistant.',
        instructions: 'Answer questions in a friendly and professional manner.',
        responseStyle: 'professional',
        enabled: true,
        knowledgeBase: ''
      };
    }
    
    if (!avatarConfig || !avatarConfig.enabled) {
      return NextResponse.json(
        { error: 'AI Avatar is not enabled' },
        { status: 403 }
      );
    }

    // Get recent chat history for context
    const chatHistory = await getRecentChatHistory(profileId, sessionId, 5);
    
    // Generate AI response using Groq
    const response = await generateAIResponse(message, avatarConfig, chatHistory);

    // Save the chat message
    await saveChatMessage({
      userId,
      profileId,
      message,
      response,
      sessionId
    });

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateAIResponse(message: string, config: any, chatHistory: any[] = []): Promise<string> {
  try {
    const systemPrompt = createSystemPrompt(config);
    
    // Build conversation history
    const messages: any[] = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Add recent chat history for context
    chatHistory.forEach(chat => {
      messages.push(
        { role: "user", content: chat.message },
        { role: "assistant", content: chat.response }
      );
    });

    // Add current message
    messages.push({
      role: "user",
      content: message
    });
    
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile", // Fast and cost-effective model
      temperature: 0.7,
      max_completion_tokens: 1024,
      top_p: 0.9,
      stream: false
    });

    return chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response at this time.";
    
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error('Failed to generate AI response');
  }
}

function createSystemPrompt(config: any): string {
  const basePrompt = `You are ${config.name}, an AI assistant representing a user's digital profile.

Personality: ${config.personality}

Instructions: ${config.instructions}

Response Style: ${config.responseStyle}

${config.knowledgeBase ? `Additional Context: ${config.knowledgeBase}` : ''}

Please respond in a ${config.responseStyle} manner while staying true to the personality and instructions provided. Keep responses concise and helpful.`;

  return basePrompt;
}
