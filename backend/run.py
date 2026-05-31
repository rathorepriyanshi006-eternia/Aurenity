import os
import sys
import subprocess

def main():
    print("==================================================================")
    print("      AURENITY X — AUTOMATED MACHINE LEARNING BACKEND ENGINE      ")
    print("==================================================================")
    
    # Locate directory of this script to run correctly from any CWD
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Simple dependency verification check
    modules = ["fastapi", "uvicorn", "sklearn", "pandas", "numpy", "openai", "pydantic", "dotenv"]
    missing = []
    
    for m in modules:
        try:
            if m == "sklearn":
                import sklearn
            elif m == "dotenv":
                import dotenv
            else:
                __import__(m)
        except ImportError:
            missing.append(m)
            
    if missing:
        print(f"Missing libraries: {', '.join(missing)}")
        print("Installing dependencies from requirements.txt...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print("\nInstallation successful! Reloading dependencies...")
        except Exception as e:
            print(f"\nFailed to auto-install dependencies: {e}")
            print("Please run: pip install -r requirements.txt manually.")
            sys.exit(1)
            
    print("\nStarting Cyber Intelligence Server on http://127.0.0.1:8000 ...")
    
    import uvicorn
    # Execute uvicorn with hot-reload disabled
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    main()
