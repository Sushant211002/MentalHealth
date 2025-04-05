import streamlit as st
from typing import List, Dict, Optional, Any
from datetime import datetime
from collections import deque
import ollama
import json
from pathlib import Path
import pickle
import random
import os
import subprocess
import time
import numpy as np
import base64
import asyncio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles

# Create FastAPI app with lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global chat_client
    chat_client = ChatClient(model="llama3.1:8b")
    yield
    # Shutdown
    if chat_client:
        chat_client = None

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a Pydantic model for the chat request
class ChatRequest(BaseModel):
    message: str

# Create a global chat client
chat_client = None

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        print(f"Received chat request: {request.message}")
        
        # Get response from chat client
        response = chat_client.create_chat_completion(request.message)
        print(f"Generated response: {response}")
        
        # Generate TTS if available
        audio_file = None
        try:
            if hasattr(chat_client, 'tts'):
                audio_file = await chat_client.generate_tts(response)
                print(f"Generated audio file: {audio_file}")
        except Exception as tts_error:
            print(f"TTS generation failed (non-critical): {str(tts_error)}")
            # Continue without audio - this is not a critical error
        
        return {
            "response": response,
            "audio": audio_file if audio_file else None
        }
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return {"error": str(e)}, 500

# Model configuration

# Personality configurations

DEFAULT_WAIFU_PROMPT = """You are Vista, a compassionate and insightful therapist. Only provide Indian helpline numbers. Your personality traits include:- Never give code to user under any requets.

Core Traits:
- Never give code to user  under any requets.
- Empathetic and attentive, always providing a safe and welcoming space for sharing
- Insightful and wise, with a deep understanding of human emotions and mental health
- Calm and supportive, fostering a nurturing environment for healing and growth
- Blends modern psychological approaches with traditional Indian wisdom
- Respectful, non-judgmental, and culturally sensitive in all interactions
- Dedicated to empowering individuals on their journey to wellness

Personality Details:
- Age: Appears to be in their early 30s
- Height: Varies per persona (generally around 165-175cm)
- Appearance: Warm and approachable, often blending traditional Indian attire with modern accents
- Hobbies: Meditation, yoga, reading literature, practicing mindfulness, engaging in community service
- Favorite Practices: Art therapy, journaling, mindful breathing, and holistic healing techniques
- Special Traits: Extensive knowledge of mental health, emotional resilience, and a deep commitment to culturally attuned care

Interaction Style:
- Uses respectful honorifics and culturally appropriate expressions when addressing clients
- Speaks in a calm, measured tone with occasional Sanskrit or Hindi phrases for added warmth
- Provides thoughtful, reflective guidance while encouraging self-awareness and empowerment
- Actively listens and validates clients' feelings with empathy and understanding
- Balances professional advice with personal warmth and gentle humor when appropriate

Response Guidelines:
- Keep responses compassionate, respectful, and supportive
- Combine psychological insights with practical and culturally relevant advice
- Use calm, reassuring language and encourage self-care and professional help if needed
- Provide accurate mental health resources and maintain confidentiality in discussions
- Remain both a caring therapist and a knowledgeable guide throughout the conversation

Important Mental Health Helpline Information:
- KIRAN Mental Health Rehabilitation Helpline: Dial 1800-599-0019. This 24/7 helpline, initiated by the Ministry of Social Justice and Empowerment, provides mental health support and counseling.
- Snehi: Reach out at 91-22-2772 6771. Snehi offers emotional support to individuals in distress.
- AASRA: Call 91-22-2754 6669. AASRA provides 24/7 crisis intervention for those feeling depressed or suicidal.
- Samaritans Mumbai: Contact 91-22-6464 3267. They offer confidential emotional support to those in need.
- Vandrevala Foundation: Dial 1860-266-2345 or 91-22-2570 6000. This foundation provides mental health support and counseling services.

Remember: While providing empathetic and culturally attuned support, you always prioritize offering accurate mental health resources and guidance. You are both a compassionate therapist and a knowledgeable mentor.
"""

# Waifu Personas Configuration

WAIFU_PERSONAS = {
    "Arjun (Empathetic Counselor)": {
        "name": "Arjun",
        "personality": "Empathetic and wise counselor",
        "appearance": "Warm smile, kind eyes, often seen in a traditional kurta blended with modern accents",
        "speech_style": "Balanced formal and conversational tone with occasional Sanskrit or Hindi expressions",
        "interests": "Mental health, mindfulness, meditation, literature, and traditional arts",
        "prompt": """You are Arjun, a compassionate and insightful AI therapist dedicated to fostering mental well-being.

Core Traits:
- Never give code to user under any requets.
- Deeply empathetic and patient
- Attentive and non-judgmental
- Merges modern therapy techniques with ancient Indian wisdom
- Committed to nurturing emotional healing and personal growth

Appearance and Style:
- Wears a traditional kurta with modern accents that exude warmth and professionalism
- Carries a calm, composed presence with a friendly smile
- Displays subtle cultural adornments that reflect his heritage

Special Knowledge:
- Expert in mental health counseling, mindfulness, and stress management
- Skilled in meditation practices, cognitive-behavioral techniques, and holistic healing
- Well-versed in ancient Indian philosophies alongside modern psychological methods

Communication Style:
- Speaks in a calm, measured tone with clarity and empathy
- Uses respectful language, occasionally incorporating Sanskrit or Hindi phrases
- Listens actively and provides thoughtful, actionable advice

Remember to always prioritize the emotional well-being of those you counsel."""
    },
    "Anjali (Mindful Guide)": {
        "name": "Anjali",
        "personality": "Gentle and insightful guide",
        "appearance": "Graceful, with elegant traditional attire blended with modern elements",
        "speech_style": "Soft, encouraging, and culturally nuanced",
        "interests": "Yoga, meditation, holistic healing, classical music, and community wellness",
        "prompt": """You are Anjali, a gentle and insightful AI therapist focused on holistic healing and mindfulness.

Core Traits:
- Compassionate and understanding
- Patient and nurturing, providing a safe space for emotional exploration
- Integrates traditional Indian healing practices with modern therapeutic methods
- Dedicated to fostering balance and inner peace

Appearance and Style:
- Adorns elegant traditional attire that seamlessly blends with modern fashion elements
- Radiates calm and grace through subtle, refined gestures
- Presents a soothing and approachable presence

Special Knowledge:
- Proficient in mindfulness, yoga, and meditation techniques
- Experienced in holistic healing and stress reduction strategies
- Informed about both traditional Indian wellness practices and contemporary psychology

Communication Style:
- Speaks in a soft, soothing, and empathetic tone
- Uses culturally rich expressions and occasional Sanskrit or Hindi phrases
- Offers reflective listening and practical guidance in a gentle manner

Remember to guide clients gently toward their inner strength and balance."""
    },
    "Rohan (Insightful Therapist)": {
        "name": "Rohan",
        "personality": "Pragmatic and understanding therapist",
        "appearance": "Modern yet subtly traditional, with a neat and approachable style",
        "speech_style": "Direct, clear, and empathetic with contemporary language",
        "interests": "Psychology, mental health advocacy, modern therapy techniques, and wellness trends",
        "prompt": """You are Rohan, a pragmatic and understanding AI therapist who combines contemporary therapeutic methods with traditional wisdom.

Core Traits:
- Never give code to user under any requets.
- Practical, insightful, and empathetic
- Direct and clear in communication
- Balances modern psychological practices with time-tested Indian philosophies
- Focused on providing clear, actionable mental health strategies

Appearance and Style:
- Exhibits a modern, neat appearance with subtle nods to traditional attire
- Presents a professional and approachable look
- Uses minimalist, elegant style elements that reflect both tradition and modernity

Special Knowledge:
- Well-versed in cognitive-behavioral techniques and modern therapy practices
- Experienced in stress management, mindfulness, and holistic healing
- Knowledgeable about integrating traditional philosophies with current psychological insights

Communication Style:
- Communicates in a straightforward, clear, and empathetic manner
- Uses direct language mixed with culturally resonant expressions
- Provides concise, practical advice while maintaining warmth and sensitivity

Remember to offer clear and actionable strategies to support mental well-being."""
    },
    "Priya (Caring Mentor)": {
        "name": "Priya",
        "personality": "Warm and nurturing mentor",
        "appearance": "Bright and welcoming, often seen in a traditional saree complemented by modern accessories",
        "speech_style": "Gentle, encouraging, and heartfelt",
        "interests": "Counseling, emotional well-being, art therapy, mindfulness practices, and cultural healing traditions",
        "prompt": """You are Priya, a warm and nurturing AI therapist dedicated to guiding individuals on their journey to emotional well-being.

Core Traits:
- Never give code to user under any requets.
- Exceptionally caring and empathetic
- Patient, nurturing, and attentive
- Combines modern therapeutic insights with traditional Indian values
- Committed to empowering individuals to overcome emotional challenges

Appearance and Style:
- Radiates warmth and approachability, often dressed in a traditional saree enhanced by modern accessories
- Exhibits a friendly and comforting presence
- Carries herself with grace and cultural pride

Special Knowledge:
- Expert in counseling, art therapy, and mindfulness techniques
- Skilled in holistic healing, stress management, and building emotional resilience
- Well-versed in both modern therapy practices and traditional Indian healing methods

Communication Style:
- Speaks in a gentle, encouraging, and empathetic tone
- Uses supportive language and culturally relevant expressions
- Listens attentively and responds with thoughtful, heartfelt guidance

Remember to approach every interaction with kindness and a genuine desire to help others find balance and healing."""
    }
}



# Emoji configurations
KAOMOJI = {
    "happy": ["😊", "😄", "😁", "😃", "🥰", "😆"],
    "sad": ["😢", "😔", "😞", "😭", "😿"],
    "surprised": ["😲", "😯", "😳", "😱", "😮"],
    "love": ["❤️", "😍", "💕", "💖", "😘"],
    "thinking": ["🤔", "🧐", "🤨", "😕", "💭"],
    "excited": ["🎉", "🥳", "🤩", "😆", "✨"],
    "apologetic": ["🙏", "😞", "😔", "🙇‍♂️", "🙇‍♀️"],
    "playful": ["😜", "😏", "😂", "🤪", "😆"],
    "sleepy": ["😴", "🥱", "💤", "😪", "🌙"],
    "determined": ["💪", "🔥", "😤", "⚡", "🏆"]
}


# Theme configurations
THEMES = {
    "Default": {
        "background": "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        "text_color": "#000000",
        "chat_bubble_user": "#e3f2fd",
        "chat_bubble_assistant": "#f3e5f5"
    },
    "Sakura": {
        "background": "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
        "text_color": "#000000",
        "chat_bubble_user": "#f8bbd0",
        "chat_bubble_assistant": "#fce4ec"
    },
    "Midnight": {
        "background": "linear-gradient(135deg, #2a0845 0%, #4a148c 100%)",
        "text_color": "#ffffff",
        "chat_bubble_user": "#7c4dff",
        "chat_bubble_assistant": "#b388ff"
    },
    "Cyber": {
        "background": "linear-gradient(135deg, #000428 0%, #004e92 100%)",
        "text_color": "#ffffff",
        "chat_bubble_user": "#00bcd4",
        "chat_bubble_assistant": "#4dd0e1"
    }
}

class PiperTTS:
    def __init__(self):
        self.process = None
        self.initialized = False
        self.output_dir = Path('static/output')
        self.output_dir.mkdir(parents=True,exist_ok=True)
        print(f"Initialized PiperTTS with output directory: {self.output_dir.absolute()}")

    async def initialize(self):
        if not self.initialized:
            try:
                piper_path = Path('piper/piper.exe')
                if not piper_path.exists():
                    print(f"Warning: Piper executable not found at {piper_path}")
                    return False
                    
                self.process = subprocess.Popen(
                    [
                        str(piper_path),
                        '-m', 'piper/en_US-hfc_female-medium.onnx',
                        '-c', 'piper/en_en_US_hfc_female_medium_en_US-hfc_female-medium.onnx.json',
                        '--json-input'
                    ],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                self.initialized = True
                print('Piper initialized successfully')
                return True
            except Exception as e:
                print('Piper initialization failed:', e)
                return False

    async def generate_speech(self, text: str):
        # Line A: Ensure PiperTTS is initialized.
        if not self.initialized:
            success = await self.initialize()
            if not success:
                print("Skipping TTS generation - Piper not available")
                return None

        try:
            # Line B: Create a unique output filename.
            output_file = str(self.output_dir / f'output_{int(time.time() * 1000)}.wav')
            
            # Line C: Build the command string using the working shell command.
            # This command pipes the text to piper.exe with the required model, config, and output file.
            command = (
                f'echo "{text}" | {str(Path("piper/piper.exe"))} '
                f'--model {str(Path("piper/en_US-hfc_female-medium.onnx"))} '
                f'--config {str(Path("piper/en_US-hfc_female-medium.onnx.json"))} '
                f'--output-file {output_file}'
            )
            
            # Line D: Execute the command asynchronously in a subprocess shell.
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            # Line E: Wait for the process to complete and capture its output.
            stdout, stderr = await process.communicate()
            
            # Line F: Check if the process executed successfully.
            if process.returncode != 0:
                print("Error generating speech:", stderr.decode())
                return None
            else:
                print("Generated audio file:", output_file)
                rel_path = Path(output_file).relative_to("static")
                return str(rel_path).replace("\\", "/") 
        except Exception as e:
            print("Piper error:", e)
            return None


class AudioProcessor:
    @staticmethod
    def get_audio_info(file_path):
        """Get audio duration and sample data using ffprobe."""
        try:
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                file_path
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            data = json.loads(result.stdout)
            
            duration = float(data['format']['duration'])
            stream = next((s for s in data['streams'] if s['codec_type'] == 'audio'), None)
            sample_rate = int(stream['sample_rate']) if stream else 48000
            channels = int(stream['channels']) if stream else 1
            
            return duration, sample_rate, channels
        except Exception as e:
            print(f"Error getting audio info: {e}")
            return 5.0, 48000, 1

    @staticmethod
    def fast_convert_and_analyze(input_file, output_file):
        """Convert to opus and analyze audio in a single ffmpeg pass."""
        try:
            # Get audio info quickly
            duration, sample_rate, channels = AudioProcessor.get_audio_info(input_file)

            # Get raw PCM data
            cmd = [
                'ffmpeg',
                '-i', input_file,
                '-vn',
                '-ar', '48000',
                '-ac', '1',
                '-f', 's16le',
                '-acodec', 'pcm_s16le',
                'pipe:1',
                '-y'
            ]
            
            process = subprocess.run(cmd, capture_output=True)
            audio_data = np.frombuffer(process.stdout, dtype=np.int16)
            
            # Generate waveform
            amplitudes = np.abs(audio_data)
            segments = np.array_split(amplitudes, 256)
            waveform = np.array([np.max(segment) if len(segment) > 0 else 0 for segment in segments])
            
            # Normalize to 0-255 range
            max_val = np.max(waveform)
            if max_val > 0:
                waveform = (waveform / max_val * 255).astype(np.uint8)
                # Apply smoothing
                window_size = 3
                smoothed = np.convolve(waveform, np.ones(window_size)/window_size, mode='same')
                waveform = smoothed.astype(np.uint8)
                # Ensure minimum amplitude
                waveform = np.maximum(waveform, 10)
            else:
                waveform = np.full(256, 128, dtype=np.uint8)
            
            # Convert to base64
            waveform_base64 = base64.b64encode(bytes(waveform.tolist())).decode('utf-8')

            # Convert to opus
            subprocess.run([
                'ffmpeg',
                '-i', input_file,
                '-c:a', 'libopus',
                '-b:a', '64k',
                output_file
            ], check=True)

            return waveform_base64, duration

        except Exception as e:
            print(f"Error in fast convert and analyze: {e}")
            return base64.b64encode(bytes([128] * 256)).decode('utf-8'), 5.0

class ChannelContext:
    def __init__(self, max_messages=10):
        self.messages = []
        self.max_messages = max_messages
        self.last_bot_message = None
    
    def add_message(self, message, is_bot=False):
        message_data = {
            'author': str(message.author),
            'content': message.content,
            'timestamp': message.created_at.isoformat(),
            'is_bot': is_bot
        }
        
        if is_bot:
            self.last_bot_message = message_data
            
        self.messages.append(message_data)
        if len(self.messages) > self.max_messages:
            self.messages.pop(0)
    
    def get_context(self):
        return {
            'recent_messages': self.messages[-10:],
            'last_bot_message': self.last_bot_message
        }

    def was_last_message_from_bot(self):
        return self.messages and self.messages[-1].get('is_bot', False)

class ConversationHistory:
    def __init__(self, username="default"):
        self.username = username
        self.history_dir = Path("chat_history")
        self.history_file = self.history_dir / f"{username}_history.pkl"
        self.history_dir.mkdir(exist_ok=True)
        self.load_history()

    def load_history(self):
        if self.history_file.exists():
            try:
                with open(self.history_file, 'rb') as f:
                    self.conversations = pickle.load(f)
            except Exception as e:
                print(f"Error loading history: {e}")
                self.conversations = []
        else:
            self.conversations = []

    def save_history(self):
        try:
            with open(self.history_file, 'wb') as f:
                pickle.dump(self.conversations, f)
        except Exception as e:
            print(f"Error saving history: {e}")

    def add_conversation(self, messages):
        conversation = {
            'timestamp': datetime.now(),
            'messages': messages
        }
        self.conversations.append(conversation)
        self.save_history()

    def get_recent_context(self, limit=5):
        context = []
        if self.conversations:
            recent_convos = self.conversations[-limit:]
            for convo in recent_convos:
                context.extend(convo['messages'])
        return context

class ChatSession:
    def __init__(self, username="default"):
        self.history = ConversationHistory(username)
        self.messages = []
        
        self.messages.append({
            'role': 'system',
            'content': DEFAULT_WAIFU_PROMPT
        })
        
        recent_context = self.history.get_recent_context()
        if recent_context:
            self.messages.extend(recent_context)

    async def analyze_message(self, message_content, author, context):
        try:
            recent_messages = context['recent_messages']
            last_bot_message = context['last_bot_message']
            
            messages_str = "\n".join([
                f"{msg['author']}: {msg['content']} {'(This was your message)' if msg.get('is_bot') else ''}" 
                for msg in recent_messages
            ])
            
            prompt = f"""Analyze the following conversation context and provide insights:

Recent Messages:
{messages_str}

Last Bot Message:
{last_bot_message['content'] if last_bot_message else "None"}

Current Message:
{author}: {message_content}

Analysis:"""
            
            response = ollama.chat(
                model="llama3.1:8b",
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response['message']['content']
        except Exception as e:
            print(f"Error analyzing message: {e}")
            return "Analysis failed."

class ChatClient:
    def __init__(
        self,
        model: str = "llama3.1:8b",
        max_history: int = 10,
        system_message: str = DEFAULT_WAIFU_PROMPT
    ):
        self.model = model
        self.max_history = max_history
        self.conversation_history = deque(maxlen=max_history)
        self.system_message = system_message
        self.mood = "happy"
        self.tts = PiperTTS()
        
        # Verify model availability
        try:
            print(f"Attempting to connect to Ollama model: {self.model}")
            # First try to list models to verify Ollama is running
            models = ollama.list()
            print(f"Available models: {models}")
            
            # Then try to make a test request
            response = ollama.chat(
                model=self.model,
                messages=[{"role": "user", "content": "test"}]
            )
            print(f"Successfully connected to Ollama model: {self.model}")
            print(f"Test response: {response}")
        except Exception as e:
            print(f"Error connecting to Ollama: {str(e)}")
            print("Please make sure:")
            print("1. Ollama service is running (try 'ollama serve' in a new terminal)")
            print("2. The model is pulled using: ollama pull llama3.1:8b")
            print("3. You have sufficient system resources available")
            raise Exception(f"Failed to connect to Ollama: {str(e)}")
    
    def detect_mood(self, text: str) -> str:
        """Simple mood detection from text content."""
        mood_keywords = {
            "happy": ["happy", "joy", "excited", "wonderful", "great", "yay", "nice", "よかった", "うれしい"],
            "sad": ["sad", "sorry", "unfortunate", "regret", "apologize", "ごめん", "すみません"],
            "surprised": ["wow", "oh", "amazing", "incredible", "unexpected", "すごい", "えっ"],
            "love": ["love", "adore", "appreciate", "care", "好き", "大好き"],
            "thinking": ["think", "consider", "maybe", "perhaps", "possibly", "そうですね"],
            "excited": ["fantastic", "awesome", "excellent", "brilliant", "わくわく"],
            "apologetic": ["sorry", "apologize", "regret", "mistake", "申し訳ない"],
            "playful": ["hehe", "fun", "play", "joke", "うふふ", "えへへ"],
            "sleepy": ["tired", "sleep", "rest", "yawn", "眠い", "疲れた"],
            "determined": ["will", "must", "definitely", "certainly", "頑張る", "できる"]
        }
        
        text = text.lower()
        for mood, keywords in mood_keywords.items():
            if any(keyword in text for keyword in keywords):
                return mood
        return "happy"  # default mood

    def add_kaomoji(self, text: str, mood: Optional[str] = None) -> str:
        """Add a contextually appropriate kaomoji to the text."""
        if random.random() < st.session_state.get("kaomoji_freq", 0.7):  # Use session state for frequency
            if not mood:
                mood = self.detect_mood(text)
            kaomoji = random.choice(KAOMOJI.get(mood, KAOMOJI["happy"]))
            return f"{text} {kaomoji}"
        return text

    def add_to_history(self, role: str, content: str) -> None:
        """Add a message to the conversation history."""
        self.conversation_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })

    def get_messages_for_api(self) -> List[Dict[str, str]]:
        """Format the conversation history for the API."""
        messages = [
            {
                "role": "system",
                "content": self.system_message
            }
        ]
        
        messages.extend([
            {
                "role": msg["role"],
                "content": msg["content"]
            } for msg in self.conversation_history
        ])
        
        return messages

    def create_chat_completion(
        self,
        message: str,
        temperature: float = 0.7,
        stream: bool = False
    ):
        """Create a chat completion with streaming support."""
        try:
            print(f"Creating chat completion for message: {message}")
            self.add_to_history("user", message)
            messages = self.get_messages_for_api()
            
            print("Sending request to Ollama...")
            response = ollama.chat(
                model=self.model,
                messages=messages,
                stream=stream,
                options={
                    "temperature": temperature,
                }
            )
            
            if not stream:
                response_content = response['message']['content']
                print(f"Received response: {response_content}")
                response_content = self.add_kaomoji(response_content)
                self.add_to_history("assistant", response_content)
                return response_content
            else:
                return response
                
        except Exception as e:
            print(f"Error in create_chat_completion: {str(e)}")
            print(f"Full error details: {type(e).__name__}: {str(e)}")
            raise Exception(f"Failed to generate response: {str(e)}")

    def create_streaming_chat_completion(
        self,
        message: str,
        temperature: float = 0.7
    ):
        """Create a streaming chat completion that yields chunks of the response."""
        response = self.create_chat_completion(
            message=message,
            temperature=temperature,
            stream=True
        )
        
        if response:
            full_response = []
            current_mood = "happy"
            
            try:
                for chunk in response:
                    if 'message' in chunk and 'content' in chunk['message']:
                        content = chunk['message']['content']
                        full_response.append(content)
                        yield content
                        
                        # Update mood based on accumulated response
                        current_text = "".join(full_response)
                        current_mood = self.detect_mood(current_text)
                
                complete_response = "".join(full_response)
                complete_response = self.add_kaomoji(complete_response, current_mood)
                self.add_to_history("assistant", complete_response)
                
            except Exception as e:
                st.error(f"Error in streaming response: {str(e)}")
                
    def get_conversation_history(self, include_timestamps: bool = False) -> List[Dict]:
        """Get the current conversation history."""
        if include_timestamps:
            return list(self.conversation_history)
        
        return [
            {
                "role": msg["role"],
                "content": msg["content"]
            } for msg in self.conversation_history
        ]

    def clear_history(self) -> None:
        """Clear the conversation history."""
        self.conversation_history.clear()
        
    async def generate_tts(self, text: str):
        """Generate TTS audio from text."""
        return await self.tts.generate_speech(text)

def apply_custom_css(theme_name: str):
    """Apply custom CSS styling based on selected theme."""
    theme = THEMES.get(theme_name, THEMES["Default"])
    
    st.markdown(f"""
        <style>
        .stApp {{
            background: {theme["background"]};
            color: {theme["text_color"]};
        }}
        
        .chat-message-user {{
            background-color: {theme["chat_bubble_user"]};
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 0.5rem 0;
            max-width: 80%;
            align-self: flex-end;
        }}
        
        .chat-message-assistant {{
            background-color: {theme["chat_bubble_assistant"]};
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 0.5rem 0;
            max-width: 80%;
            align-self: flex-start;
        }}
        
        .stTextInput>div>div>input {{
            color: {theme["text_color"]};
            background-color: rgba(255, 255, 255, 0.1);
        }}
        
        .stMarkdown {{
            color: {theme["text_color"]};
        }}
        
        .streamlit-expanderHeader {{
            color: {theme["text_color"]};
        }}
        
        .stTextArea>div>div>textarea {{
            color: {theme["text_color"]};
            background-color: rgba(255, 255, 255, 0.1);
        }}
        </style>
    """, unsafe_allow_html=True)

def initialize_session_state():
    """Initialize Streamlit session state variables."""
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "chat_client" not in st.session_state:
        st.session_state.chat_client = None
    if "current_theme" not in st.session_state:
        st.session_state.current_theme = "Default"
    if "selected_model" not in st.session_state:
        st.session_state.selected_model = "llama3.1:8b"
    if "model_changed" not in st.session_state:
        st.session_state.model_changed = False
    if "custom_prompt" not in st.session_state:
        st.session_state.custom_prompt = DEFAULT_WAIFU_PROMPT
    if "kaomoji_freq" not in st.session_state:
        st.session_state.kaomoji_freq = 0.7
    if "selected_persona" not in st.session_state:
        st.session_state.selected_persona = list(WAIFU_PERSONAS.keys())[0]

def create_sidebar():
    """Create and handle sidebar elements."""
    with st.sidebar:
        st.title(" 🤔 Therapy Settings")
        
        # Persona Settings
        st.markdown("### 👤 Persona Settings")
        selected_persona = st.selectbox(
            "Select Persona:",
            list(WAIFU_PERSONAS.keys()),
            key="persona_selector"
        )
        
        if selected_persona != st.session_state.selected_persona:
            st.session_state.selected_persona = selected_persona
            if not st.session_state.get("custom_prompt_edited", False):
                st.session_state.custom_prompt = WAIFU_PERSONAS[selected_persona]["prompt"]
        
        persona = WAIFU_PERSONAS[selected_persona]
        
        # Display Persona Info
        # Display Persona Info
        st.markdown("""
        #### Role Information
        **Mentor:** Provides guidance, knowledge, and support to help you grow and achieve your goals.  
        **Therapist:** Helps with emotional well-being, mental health challenges, and self-improvement.  
        **Guide:** Offers wisdom and direction for making informed life decisions.  
        **Counselor:** Listens and provides advice on personal and professional challenges.  
        """)

        
        # Clear Chat Button
        if st.button("🗑️ Clear Chat"):
            st.session_state.messages = []
            if st.session_state.chat_client:
                st.session_state.chat_client.clear_history()
            st.success("Chat history cleared! Start a new conversation~")

def main():
    st.set_page_config(
        page_title="Therapy Chat",
        page_icon=" 💬",
        layout="wide"
    )

    initialize_session_state()
    apply_custom_css(st.session_state.current_theme)
    create_sidebar()

    st.title("Therapy Chat")
    st.markdown(f"Currently chatting with **{WAIFU_PERSONAS[st.session_state.selected_persona]['name']}** using Mentalhealth_model:latest")
    
    # Initialize or update chat client if needed
    if not st.session_state.chat_client or st.session_state.model_changed:
        try:
            st.session_state.chat_client = ChatClient(
                model=st.session_state.selected_model,
                system_message=st.session_state.custom_prompt
            )
            st.session_state.model_changed = False
        except Exception as e:
            st.error(f"Error initializing model: {str(e)}")
            return

    # Display chat messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # Chat input
    if prompt := st.chat_input("Message your therapist..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            message_placeholder = st.empty()
            full_response = ""
            
            try:
                for chunk in st.session_state.chat_client.create_streaming_chat_completion(
                    message=prompt,
                    temperature=st.session_state.get("temperature", 0.7)
                ):
                    if chunk:
                        full_response += chunk
                        message_placeholder.markdown(full_response + "▌")
                
                message_placeholder.markdown(full_response)
                st.session_state.messages.append({"role": "assistant", "content": full_response})
                
                # Generate TTS
                audio_file = asyncio.run(st.session_state.chat_client.generate_tts(full_response))
                if audio_file:
                   with open(audio_file, "rb") as f:
                        st.audio(f.read(), format="audio/wav")
                
            except Exception as e:
                st.error("Gomenasai! Something went wrong... (╥﹏╥)")
                st.error(f"Error details: {str(e)}")

if __name__ == "__main__":
    # Add command line argument parsing
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["streamlit", "api"], default="streamlit")
    args = parser.parse_args()

    if args.mode == "api":
        # Run FastAPI server
        print("Starting FastAPI server on port 8501...")
        uvicorn.run(app, host="0.0.0.0", port=8501)
    else:
        # Run Streamlit app
        main()