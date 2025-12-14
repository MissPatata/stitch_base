import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"

console.log("🚀 Starting app...")

const rootElement = document.getElementById("root")

if (!rootElement) {
  console.error("❌ Root element not found!")
  throw new Error("Root element not found. Make sure index.html has a div with id='root'")
}

console.log("✅ Root element found, rendering app...")

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log("✅ App rendered successfully")
} catch (error) {
  console.error("❌ Error rendering app:", error)
  throw error
}
