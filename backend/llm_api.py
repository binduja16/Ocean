import os
import openai

from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Now use OPENAI_API_KEY in your code safely


def ask_ai(query: str):
    """Return AI answer to any free-text question."""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # or "gpt-4" if you have access
            messages=[
                {"role": "system", "content": "You are an expert oceanic fishing assistant."},
                {"role": "user", "content": query}
            ],
            max_tokens=200
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"
