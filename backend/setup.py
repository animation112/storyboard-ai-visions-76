
#!/usr/bin/env python3
"""
Setup script for the Visual AI Explainer backend
"""

import subprocess
import sys
import os

def install_requirements():
    """Install Python requirements"""
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def setup_environment():
    """Setup environment variables"""
    env_example = """
# Copy this to .env and fill in your actual API key
GEMINI_API_KEY=your_gemini_api_key_here
"""
    
    with open(".env.example", "w") as f:
        f.write(env_example)
    
    if not os.path.exists(".env"):
        print("Creating .env file...")
        with open(".env", "w") as f:
            f.write(env_example)
        print("Please edit .env file and add your Gemini API key")

def main():
    print("Setting up Visual AI Explainer backend...")
    
    # Install requirements
    print("Installing Python requirements...")
    install_requirements()
    
    # Setup environment
    print("Setting up environment...")
    setup_environment()
    
    print("\nSetup complete!")
    print("Next steps:")
    print("1. Edit .env file and add your Gemini API key")
    print("2. Run: python main.py")
    print("3. The API will be available at http://localhost:8000")

if __name__ == "__main__":
    main()
