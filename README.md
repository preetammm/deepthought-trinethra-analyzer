# 👁️ Trinethra AI — Transcript Analyzer

![Trinethra AI Hero](imgResourse/Screenshot%202026-05-14%20184426.png)

Trinethra AI is a powerful, full-stack web application designed to analyze conversation transcripts, meetings, and calls using advanced AI. Built with React, Express, and powered by local Llama 3 (via Ollama), it extracts key insights, generates score cards, and provides actionable recommendations in a sleek, glassmorphic UI.

---

## ✨ Features

- **AI-Powered Analysis**: Upload your transcript and let Llama 3 break it down into structured insights.
- **Dynamic Score Cards**: Visual ratings for Communication, Professionalism, and Engagement with animated progress bars.
- **Detailed Insights Breakdown**:
  - ✅ Strengths
  - ⚠️ Weaknesses
  - 💡 Recommendations
  - ❓ Follow-up Questions
  - 📝 Extracted Evidence
  - 🎯 Gap Analysis
- **Transcript History**: Saves past analyses locally. Access them anytime from the slide-out sidebar.
- **Export Capabilities**: 
  - Copy formatted text to clipboard
  - Download raw JSON
  - Download structured TXT report
- **Beautiful UI/UX**: Dark mode glassmorphism theme, smooth micro-animations, and a responsive layout.
- **Robust Backend**: Strict JSON formatting constraints, hallucination prevention prompts, and comprehensive error handling.

---

## 📸 Gallery

<details>
<summary>Click to expand screenshots</summary>

| Empty State | Loading State |
|:---:|:---:|
| ![Empty State](imgResourse/Screenshot%202026-05-14%20184450.png) | ![Loading](imgResourse/Screenshot%202026-05-14%20184502.png) |

| Analysis Results | AI Scores |
|:---:|:---:|
| ![Results](imgResourse/Screenshot%202026-05-14%20184621.png) | ![Scores](imgResourse/Screenshot%202026-05-14%20184630.png) |

| History Sidebar | Detailed Breakdown |
|:---:|:---:|
| ![History](imgResourse/Screenshot%202026-05-14%20184647.png) | ![Breakdown](imgResourse/Screenshot%202026-05-14%20184657.png) |

| Export & Bottom View |
|:---:|
| ![Export](imgResourse/Screenshot%202026-05-14%20184722.png) |

</details>

---

## 🚀 Tech Stack

**Frontend:**
- React 19 + Vite 8
- TailwindCSS 4 + Custom CSS
- Lucide React (Icons)
- Framer Motion

**Backend:**
- Node.js + Express
- Ollama API (Llama 3 Model)
- CORS & Dotenv

---

## 🛠️ Installation & Setup

### Prerequisites
1. **Node.js** (v18+ recommended)
2. **Ollama** installed on your system.
3. Download the Llama 3 model by running:
   ```bash
   ollama pull llama3
   ```

### 1. Clone the repository
```bash
git clone https://github.com/preetammm/deepthought-trinethra-analyzer.git
cd deepthought-trinethra-analyzer
```

### 2. Setup the Backend
```bash
cd backend
npm install
npm run dev
# The backend runs on http://localhost:5000
```

### 3. Setup the Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
# The frontend runs on http://localhost:5173
```

---

## 🧠 How it works (Prompt Engineering)

The backend utilizes strict system prompts to guide Llama 3 into returning a consistent, structured JSON object. It forces the AI to base every point on **extracted evidence** directly from the transcript, severely limiting hallucinations and ensuring high-quality, professional summaries.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/preetammm/deepthought-trinethra-analyzer/issues).

## 📄 License

This project is licensed under the MIT License.
