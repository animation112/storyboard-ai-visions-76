
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
    env_content = """# Gemini API Configuration
GEMINI_API_KEY=AIzaSyDMwNHMeZVWmf0Wtc9BQSsY4mks2yd0aAg
"""
    
    with open(".env.example", "w") as f:
        f.write(env_content)
    
    if not os.path.exists(".env"):
        print("Creating .env file...")
        with open(".env", "w") as f:
            f.write(env_content)
        print(".env file created with API key")
    else:
        print(".env file already exists")

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
    print("1. Run: python main.py")
    print("2. The API will be available at http://localhost:8000")

if __name__ == "__main__":
    main()
