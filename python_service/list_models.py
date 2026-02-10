
import google.generativeai as genai
import os

GEMINI_API_KEY = "AIzaSyBFVVDHbaaIuwp-Njd05fRZ7sjymeZZwV4"
genai.configure(api_key=GEMINI_API_KEY)

print("Listing models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error: {e}")
