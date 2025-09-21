# llm_api.py
import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def ask_ai(query):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": query}],
            max_tokens=150
        )
        answer = response['choices'][0]['message']['content']
        return answer
    except openai.error.OpenAIError as e:
        # Catch quota or API errors
        print("OpenAI API Error:", e)
        return "Sorry, Ocean AI can't answer that right now. Try again later!"
