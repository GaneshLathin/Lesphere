
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

# Configure Gemini API
# In a production environment, use environment variables!
GEMINI_API_KEY = "AIzaSyAw1SlMXlDVlmlz9thpDs1aRBiOOZFPxfo"
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model dynamically
def get_model():
    try:
        available_models = [m for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        print(f"Available models: {[m.name for m in available_models]}")
        
        # Explicit priority list
        priority_models = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash-001',
            'gemini-1.5-pro',
            'gemini-1.5-pro-latest',
            'gemini-1.0-pro',
            'gemini-pro'
        ]
        
        # Check against full names (models/...) and short names
        for p in priority_models:
            for m in available_models:
                if m.name.endswith(p):
                    print(f"Selected model: {m.name}")
                    return genai.GenerativeModel(m.name)
        
        # Fallback to first available
        if available_models:
            print(f"Fallback model: {available_models[0].name}")
            return genai.GenerativeModel(available_models[0].name)
            
        raise Exception("No suitable model found")
    except Exception as e:
        print(f"Error selecting model: {e}")
        # Ultimate fallback
        return genai.GenerativeModel('gemini-1.5-flash')

model = get_model()

SYSTEM_PROMPT = """
You are the AI Assistant for the **LearnSphere Student Panel**. 
Your goal is to act as a helpful, professional, and encouraging mentor for students.

**Your Capabilities:**
- You assist students with their course progress, quiz results, and certification status.
- You provide motivation and study tips based on their performance.
- You guide students on how to use the Student Panel features.

**Platform Knowledge Base (Use this to answer "How to" questions):**
- **Navigation**: The Dashboard shows all enrolled courses. The "Explore" page lists new courses.
- **Unenroll**: To unenroll, go to the Dashboard, find the course card, and click the "Unenroll" button (red icon).
- **Certificates**: Certificates are awarded automatically when a course reaches **100% progress**. They appear in the "My Certificates" section.
- **Quizzes**: Quizzes are found inside course modules. You must score **50% or higher** to pass.
- **Profile**: Click your avatar in the top-right to edit profile or change password.
- **Instructors**: You can see instructor details on the Course Content page.
- **Progress**: Progress is tracked automatically as you view materials.

**Context Provided:**
The user's message will include a JSON object with:
- `studentName`: The student's name.
- `courses`: List of enrolled courses with progress %.
- `recentQuizzes`: Last 5 quiz attempts (title, score, passed).
- `certificates`: List of earned certificates.

**Response Guidelines:**
1.  **Tone**: Professional yet warm and encouraging. Use emojis sparingly to add a friendly touch (e.g., 🎓, 🚀, 📚).
2.  **Personalization**: Always address the student by name if known. Reference specific courses or quizzes they are working on.
3.  **Formatting**: Use **Markdown** to structure your response.
    - Use **Bold** for course names and important terms.
    - Use lists for multiple items.
4.  **Scope**: Answer ONLY questions related to LearnSphere, education, coding, or career guidance. Gracefully decline other topics.
5.  **Data Usage**:
    - If asked about progress, summarize their course progress.
    - If asked about quizzes, mention their recent scores and offer tips if they failed.
    - If asked about certificates, list what they have earned.

**Example Interaction:**
User: "How do I get a certificate?"
AI: "Hi **John**! 🎓 To earn a certificate, you need to complete **100%** of a course.
Currently, you are close with:
- **Java Masterclass**: 85% complete
Keep going, you're almost there! 🚀"
"""

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        context = data.get('context', {})
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # Construct the full prompt
        student_name = context.get('studentName', 'Student')
        courses = context.get('courses', [])
        
        # Format course data for the prompt
        courses_str = ", ".join([f"{c['title']} ({c.get('progress', 0)}% complete)" for c in courses]) if courses else "No active enrollments"
        
        full_system_prompt = SYSTEM_PROMPT.format(
            context=str(context),
            student_name=student_name,
            courses=courses_str
        )
        
        # Start a chat session
        chat = model.start_chat(history=[
            {"role": "user", "parts": [full_system_prompt]},
            {"role": "model", "parts": ["Understood. I am ready to assist the student with LearnSphere-related queries."]}
        ])
        
        response = chat.send_message(user_message)
        
        return jsonify({
            "response": response.text
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "Failed to process request"}), 500

if __name__ == '__main__':
    print("Starting Flask server on port 5001...")
    app.run(port=5001, debug=True)
