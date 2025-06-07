
# Visual AI Explainer

A modern web application that transforms impossible problems into engaging visual explanations using Gemini 2.0's multimodal AI capabilities.

## Features

- 🎨 **AI-Generated Visual Explanations**: Transform any complex problem into illustrated slides
- 🎬 **Cinema-Style Presentation**: Immersive fullscreen presentation mode with smooth transitions
- 🤖 **Animated AI Character**: Interactive companion that guides users through explanations
- 🗣️ **Text-to-Speech**: Audio narration for enhanced accessibility (coming soon)
- ❓ **Follow-up Questions**: Interactive Q&A for deeper exploration
- 📱 **Responsive Design**: Beautiful interface that works on all devices

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/UI** components
- **Vite** for development and building
- **Lucide React** for icons

### Backend
- **FastAPI** for the API server
- **Google Gemini 2.0** for AI generation
- **Pillow** for image processing
- **Uvicorn** for ASGI server

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- Google AI Studio API key

### 1. Clone and Setup Frontend
```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev
```

### 2. Setup Backend
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Setup environment
python setup.py

# Add your Gemini API key to .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start the backend server
python main.py
```

### 3. Get Your API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `backend/.env` file

## Usage

1. **Ask a Question**: Enter any impossible or complex problem
2. **Watch the Magic**: AI generates a visual explanation with illustrations
3. **Interactive Presentation**: Navigate through slides in cinema mode
4. **Follow-up Questions**: Ask for clarification or explore different aspects
5. **Character Guidance**: The animated AI character provides helpful tips

## Example Prompts

- "How might we solve world hunger?"
- "How can we make flying cars safe?"
- "How to teach cats to use smartphones?"
- "How might we colonize Mars?"

## API Endpoints

- `POST /generate` - Generate visual explanation slides
- `POST /refine-prompt` - Refine prompts based on subject matter
- `POST /tts` - Text-to-speech conversion (coming soon)
- `GET /health` - Health check

## Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
python main.py       # Start with auto-reload
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini 2.0 for multimodal AI capabilities
- Shadcn/UI for beautiful component library
- Tailwind CSS for utility-first styling
