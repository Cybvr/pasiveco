import { useState, useRef, useEffect } from "react"
import { Send, MessageCircle, User, Bot } from "lucide-react"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface AskInBioProps {
  creatorName?: string
  creatorInfo?: string
}

const AskInBio: React.FC<AskInBioProps> = ({
  creatorName = "Creator",
  creatorInfo = "A passionate content creator sharing insights and experiences."
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hi! I'm ${creatorName}. Ask me anything about my content, experiences, or what I'm working on!`,
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock AI response function - replace with actual AI integration
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    const responses = [
      `Great question! Based on my experience, I'd say that ${userMessage.toLowerCase().includes('content') ? 'creating authentic content is all about staying true to your voice and providing real value to your audience' : 'it really depends on your specific situation, but I always recommend starting with the basics and building from there'}.`,
      `That's something I get asked a lot! In my journey, I've learned that ${userMessage.toLowerCase().includes('growth') ? 'consistent posting and engaging genuinely with your community are the key drivers of sustainable growth' : 'the most important thing is to focus on quality over quantity and really understand your audience'}.`,
      `Thanks for asking! From my perspective, ${userMessage.toLowerCase().includes('monetize') ? 'monetization should come naturally after you\'ve built trust and provided value - never put profit before your audience' : 'staying consistent and authentic has been the foundation of everything I do'}.`,
      `I love this question! What I've discovered is that ${userMessage.toLowerCase().includes('start') ? 'starting is often the hardest part, but just taking that first step and being willing to learn and adapt is what makes all the difference' : 'success comes from combining passion with strategy and never stopping to learn and improve'}.`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    try {
      const aiResponse = await generateAIResponse(inputMessage)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error("Error generating AI response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble responding right now. Please try again!",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <section className="bg-background px-6 py-16 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-foreground" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Introducing Ask in Bio
          </h2>
          <p className="text-xl text-muted-foreground">
            Let your audience connect with you on a deeper level through AI-powered conversations
          </p>
          <div className="mt-8 bg-card rounded-2xl p-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">How Ask in Bio Works</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-3">
                  <span className="text-foreground font-bold">1</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Train Your AI</h4>
                <p className="text-sm text-muted-foreground">Upload your content, FAQs, and personality to create your AI persona</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-3">
                  <span className="text-foreground font-bold">2</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Fans Ask Questions</h4>
                <p className="text-sm text-muted-foreground">Visitors chat with your AI to learn about you, your content, and your journey</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-3">
                  <span className="text-foreground font-bold">3</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Build Deeper Connections</h4>
                <p className="text-sm text-muted-foreground">Turn casual visitors into engaged fans through personalized interactions</p>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-primary mb-2">✨ Try the demo below!</p>
            <p className="text-muted-foreground">This AI is trained on {creatorName}'s information and responds in their style</p>
          </div>
        </div>
        <div className="bg-card rounded-3xl shadow-xl overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                    message.isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isUser
                        ? 'bg-primary text-foreground'
                        : 'bg-card text-foreground'
                    }`}
                  >
                    {message.isUser ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.isUser
                        ? 'bg-primary text-foreground'
                        : 'bg-card text-foreground'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
                  <div className="w-8 h-8 rounded-full bg-card text-foreground flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-card text-foreground rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-card rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-card rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-card rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input Area */}
          <div className="border-t border-border p-6">
            <div className="flex space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 bg-card text-foreground px-4 py-3 rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-primary text-foreground px-6 py-3 rounded-2xl font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-foreground mt-2 text-center">
              🤖 This is a live demo of Ask in Bio - an AI trained on {creatorName}'s content and personality
            </p>
          </div>
        </div>
        {/* Benefits Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-foreground mb-4">For Creators</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Scale your personal interactions 24/7
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Answer common questions automatically
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Build deeper audience relationships
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Increase engagement and time on page
              </li>
            </ul>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-foreground mb-4">For Your Audience</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Get instant answers to their questions
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Learn about your journey and expertise
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Feel more connected to you as a creator
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Discover your content and offerings
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AskInBio