"use client"

import { useState, useRef } from "react"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import Markdown from "react-markdown"
import { Paperclip, Send, X, Loader2 } from "lucide-react"

const API_KEY = PASTE_YOUR_API_KEY_HERE ; //"API_KEY" or create .env and use accordingly

function GeminiChat() {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const genAI = new GoogleGenerativeAI(API_KEY)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ]

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles((prevFiles) => [...prevFiles, ...files])
  }

  const removeFile = (indexToRemove) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove))
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() && selectedFiles.length === 0) return

    setIsLoading(true)
    const userMessage = { text: inputText, files: selectedFiles, sender: "user" }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInputText("")
    setSelectedFiles([])
    fileInputRef.current.value = ""

    try {
      const parts = []

      if (inputText.trim()) {
        parts.push({ text: inputText.trim() })
      }

      for (const file of userMessage.files) {
        const base64 = await fileToBase64(file)
        parts.push({
          inlineData: {
            data: base64,
            mimeType: file.type,
          },
        })
      }

      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        safetySettings,
      })

      const response = await result.response
      const text = response.text()
      console.log("Generated content:", text)
      setMessages((prevMessages) => [...prevMessages, { text, sender: "bot" }])
    } catch (error) {
      console.error("Error generating content:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `Error: ${error.message}`, sender: "bot", isError: true },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64String = reader.result.split(",")[1]
        resolve(base64String)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-center px-6 py-4 border-b border-zinc-800 bg-zinc-900">
        <h1 className="text-xl font-medium text-zinc-100">Gemini Multi-Modal Chat</h1>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 text-zinc-400">🤖</div>
              <p className="text-xl text-zinc-300 mb-2">Start a conversation with Gemini</p>
              <p className="text-sm text-zinc-500">Upload files or ask questions to get started</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className="flex items-start space-x-4">
              {msg.sender === "user" ? (
                <>
                  <div className="flex-1"></div>
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="bg-zinc-100 text-zinc-900 rounded-2xl px-4 py-3 shadow-sm border border-zinc-200">
                      {msg.text && (
                        <div className="prose prose-sm max-w-none prose-zinc">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      )}
                      {msg.files && msg.files.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {msg.files.map((file, fileIndex) => (
                            <div key={fileIndex} className="relative">
                              {file.type.startsWith("image/") && (
                                <img
                                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                                  alt={`Uploaded ${file.name}`}
                                  className="w-full h-32 object-cover rounded-lg border border-zinc-300"
                                />
                              )}
                              {file.type.startsWith("audio/") && (
                                <audio controls src={URL.createObjectURL(file)} className="w-full"></audio>
                              )}
                              {!file.type.startsWith("image/") && !file.type.startsWith("audio/") && (
                                <div className="bg-zinc-200 p-3 rounded-lg text-sm text-zinc-700">
                                  <div className="flex items-center">
                                    <Paperclip size={16} className="mr-2" />
                                    <span className="truncate">
                                      {file.name} ({Math.round(file.size / 1024)} KB)
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900 font-medium text-sm border border-zinc-200">
                      U
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start space-x-3 max-w-3xl">
                  <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 font-medium text-sm border border-zinc-700">
                    AI
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      msg.isError ? "bg-red-950 border border-red-800" : "bg-zinc-900 border border-zinc-800"
                    }`}
                  >
                    {msg.text && (
                      <div
                        className={`prose prose-sm max-w-none ${
                          msg.isError ? "text-red-200" : "text-zinc-100 prose-invert"
                        }`}
                      >
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 font-medium text-sm border border-zinc-700">
                AI
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center text-zinc-400">
                  <Loader2 size={16} className="animate-spin mr-2 text-zinc-500" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-800 bg-zinc-900 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {selectedFiles.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 flex items-center space-x-2 text-sm text-zinc-300"
                >
                  <Paperclip size={14} className="text-zinc-500" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end space-x-3">
            {/* File Input */}
            <label htmlFor="file-input" className="cursor-pointer mb-2">
              <div className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors text-zinc-400 hover:text-zinc-300 border border-zinc-700">
                <Paperclip size={20} />
              </div>
              <input
                id="file-input"
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,audio/*,application/pdf,text/plain"
              />
            </label>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent resize-none min-h-[52px] max-h-32 transition-all"
                placeholder="Type your message or ask about the files..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={isLoading || (!inputText.trim() && selectedFiles.length === 0)}
              className={`p-3 rounded-xl transition-all border mb-2 ${
                isLoading || (!inputText.trim() && selectedFiles.length === 0)
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed border-zinc-700"
                  : "bg-zinc-100 hover:bg-white text-zinc-900 shadow-sm border-zinc-200 hover:shadow-md"
              }`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeminiChat