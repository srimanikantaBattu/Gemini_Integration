import GeminiChat from "./components/Gemini"

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-lg shadow-2xl w-full max-w-6xl flex flex-col h-[92vh] overflow-hidden border border-zinc-800">
        <GeminiChat />
      </div>
    </div>
  )
}

export default App