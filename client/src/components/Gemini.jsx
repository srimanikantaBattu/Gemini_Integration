"use client"

import { useState, useRef } from "react"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import Markdown from "react-markdown"
import { Paperclip, Send, X } from "lucide-react"

const API_KEY = PASTE_YOUR_API_KEY ; //"API_KEY" or create .env and use accordingly

function GeminiChat() {
  const [inputText, setInputText] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [output, setOutput] = useState("")
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

  const handleSubmit = async () => {
    if (!inputText.trim() && selectedFiles.length === 0) return

    setIsLoading(true)
    setOutput("Processing...")

    try {
      const parts = []

      if (inputText.trim()) {
        parts.push({ text: inputText.trim() })
      }

      for (const file of selectedFiles) {
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
      setOutput(text)
    } catch (error) {
      console.error("Error generating content:", error)
      setOutput(`Error: ${error.message}`)
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
      handleSubmit()
    }
  }

  const clearAll = () => {
    setInputText("")
    setSelectedFiles([])
    setOutput("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div>
      <h1>Gemini AI</h1>
      
      {/* Input Section */}
      <div>
        <textarea
          placeholder="Enter your text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={4}
        />
        
        <div>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,audio/*,application/pdf,text/plain"
          />
          
          <button onClick={handleSubmit} disabled={isLoading || (!inputText.trim() && selectedFiles.length === 0)}>
            <Send size={16} />
            {isLoading ? "Processing..." : "Submit"}
          </button>
          
          <button onClick={clearAll}>
            Clear All
          </button>
        </div>

        {/* Selected Files Display */}
        {selectedFiles.length > 0 && (
          <div>
            <h3>Selected Files:</h3>
            {selectedFiles.map((file, index) => (
              <div key={index}>
                <Paperclip size={14} />
                <span>{file.name} ({Math.round(file.size / 1024)} KB)</span>
                <button onClick={() => removeFile(index)}>
                  <X size={14} />
                  Remove
                </button>
                
                {/* Preview for images */}
                {file.type.startsWith("image/") && (
                  <div>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      width="200"
                    />
                  </div>
                )}
                
                {/* Preview for audio */}
                {file.type.startsWith("audio/") && (
                  <div>
                    <audio controls src={URL.createObjectURL(file)}></audio>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <hr />

      {/* Output Section */}
      <div>
        <h2>Output:</h2>
        {output ? (
          <div>
            <Markdown>{output}</Markdown>
          </div>
        ) : (
          <p>No output yet. Enter text or upload files and click Submit.</p>
        )}
      </div>
    </div>
  )
}

export default GeminiChat