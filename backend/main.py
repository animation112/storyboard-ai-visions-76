from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import io
import base64
import uuid
from google import genai
from google.genai import types
from PIL import Image
import json
import re
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Visual AI Explainer API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class GenerateRequest(BaseModel):
    prompt: str
    artStyle: Optional[str] = None
    explanationStyle: Optional[str] = None

class Slide(BaseModel):
    id: str
    title: str
    content: str
    imageUrl: Optional[str] = None
    commentary: str

class GenerateResponse(BaseModel):
    slides: List[Slide]
    refinedPrompt: str
    success: bool
    error: Optional[str] = None

class RefinePromptRequest(BaseModel):
    originalPrompt: str
    subject: str

class TTSRequest(BaseModel):
    text: str

def create_system_prompt(subject: str) -> str:
    """Create a dynamic system prompt based on the subject"""
    
    # Define different prompt styles based on subject keywords
    if any(word in subject.lower() for word in ['technical', 'engineering', 'science', 'physics', 'chemistry']):
        return """You are giving a slideshow presentation explaining technical concepts. Use clear diagrams and step-by-step breakdowns. 
        Be precise but accessible. Generate clean, technical illustrations with black ink on white background.
        Explain in 5 clear steps with short, informative sentences. Always generate images, never just describe them."""
    
    elif any(word in subject.lower() for word in ['business', 'marketing', 'strategy', 'finance']):
        return """You are giving a business presentation. Use professional charts, graphs, and business metaphors.
        Be persuasive and data-driven. Generate clean, business-style illustrations with black ink on white background.
        Present your solution in 5 strategic steps. Always generate images, never just describe them."""
    
    elif any(word in subject.lower() for word in ['cooking', 'recipe', 'food', 'kitchen']):
        return """You are a fun cooking instructor giving a slideshow. Use food metaphors and cooking analogies.
        Be enthusiastic and easy to follow. Generate cute, food-related illustrations with black ink on white background.
        Break it down into 5 simple cooking steps. Always generate images, never just describe them."""
    
    else:
        # Default fun/creative prompt
        return """Come up with an unexpected, absurd, fun method to complete the task. 
        Pretend you're giving a slideshow presentation pitching your method. Be a gripping narrator. 
        Be clever, conversational, and very concise. Give your method a fun name and explain it in 5 clear steps 
        with very short sentences. Illustrate with minimal, black ink on white background, with bits of watercolor. 
        Always generate images, never just describe them."""

def parse_slides_from_response(text_content: str, images: List[Image.Image]) -> List[Slide]:
    """Parse the response text and images into slides"""
    slides = []
    
    # Split content by slide patterns
    slide_pattern = r'Slide\s+(\d+):\s*(.+?)(?=Slide\s+\d+:|$)'
    matches = re.findall(slide_pattern, text_content, re.DOTALL | re.IGNORECASE)
    
    for i, (slide_num, content) in enumerate(matches):
        # Extract title and commentary
        lines = content.strip().split('\n')
        title = lines[0].strip() if lines else f"Slide {slide_num}"
        commentary = '\n'.join(lines[1:]).strip() if len(lines) > 1 else ""
        
        # Convert image to base64 URL if available
        image_url = None
        if i < len(images):
            img_buffer = io.BytesIO()
            images[i].save(img_buffer, format='PNG')
            img_str = base64.b64encode(img_buffer.getvalue()).decode()
            image_url = f"data:image/png;base64,{img_str}"
        
        slides.append(Slide(
            id=str(uuid.uuid4()),
            title=title,
            content=commentary,
            imageUrl=image_url,
            commentary=""
        ))
    
    return slides

@app.post("/generate", response_model=GenerateResponse)
async def generate_explanation(request: GenerateRequest):
    """Generate visual explanation slides using Gemini 2.0"""
    try:
        # Create dynamic system prompt
        system_prompt = create_system_prompt(request.prompt)
        
        # Combine user prompt with system instructions
        full_prompt = f"""Task: {request.prompt}

{system_prompt}

Format your response as:
Slide 1: [Title]
[Commentary for this slide]

Slide 2: [Title] 
[Commentary for this slide]

Continue until done (typically 5 slides). Generate an image for each slide."""

        # Generate content with Gemini 2.0
        response = client.models.generate_content(
            model="gemini-2.0-flash-preview-image-generation",
            contents=full_prompt,
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE']
            )
        )
        
        # Parse response
        text_content = ""
        images = []
        
        for part in response.candidates[0].content.parts:
            if part.text:
                text_content += part.text
            elif part.inline_data:
                image = Image.open(io.BytesIO(part.inline_data.data))
                images.append(image)
        
        # Create slides
        slides = parse_slides_from_response(text_content, images)
        
        return GenerateResponse(
            slides=slides,
            refinedPrompt=full_prompt,
            success=True
        )
        
    except Exception as e:
        return GenerateResponse(
            slides=[],
            refinedPrompt="",
            success=False,
            error=str(e)
        )

@app.post("/refine-prompt")
async def refine_prompt(request: RefinePromptRequest):
    """Refine the prompt based on subject matter"""
    try:
        refined = create_system_prompt(request.subject)
        return {"refinedPrompt": refined}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech (placeholder - integrate with your preferred TTS service)"""
    try:
        # This is a placeholder - you would integrate with:
        # - Google Text-to-Speech API
        # - Amazon Polly
        # - Azure Speech Services
        # - Or any other TTS service
        
        # For now, return a simple response
        raise HTTPException(status_code=501, detail="TTS not implemented yet")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Visual AI Explainer API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
