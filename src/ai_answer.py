import os
import time
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

class GeminiFileProcessor:
    """
    A class to handle file uploads and interaction with the Gemini API.
    """
    
    def __init__(self):
        """Initializes the GeminiFileProcessor with the provided API key."""
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        self.model = None
        self.files = []
        self.configure_model()

    def configure_model(self):
        """
        Configures the generative model with necessary parameters.
        """
        generation_config = {
            "temperature": 0.1,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 100000,
            # "response_mime_type": "application/json",
            "response_mime_type": "text/plain",
        }

        system_instruction = (
            "You’re a highly skilled cybersecurity analyst with a deep understanding of unstructured data analysis and natural language processing. "
            "Your expertise lies in synthesizing complex cybersecurity audit reports into actionable insights. Your goal is to interpret the reports "
            "and provide chat-based responses to questions regarding these audits. You will highlight key metrics and insights for decision-makers."
        )

        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-pro-exp-0827",
            generation_config=generation_config,
            system_instruction=system_instruction,
            tools='code_execution'
        )

    def upload_file(self, file_path: str, mime_type: str = None):
        """
        Uploads the specified file to the Gemini API.
        """
        uploaded_file = genai.upload_file(file_path, mime_type=mime_type)
        self.files.append(uploaded_file)
        print(f"Uploaded file '{uploaded_file.display_name}' as: {uploaded_file.uri}")
        return uploaded_file

    def wait_for_files_to_be_ready(self):
        """
        Waits for the uploaded files to be processed and active in the Gemini API.
        """
        print("Waiting for file processing...")
        for uploaded_file in self.files:
            file = genai.get_file(uploaded_file.name)
            while file.state.name == "PROCESSING":
                print(".", end="", flush=True)
                time.sleep(10)
                file = genai.get_file(uploaded_file.name)

            if file.state.name != "ACTIVE":
                raise Exception(f"File {file.name} failed to process")

        print("files are ready.")

    def start_chat_session(self, prompt: str, chat_history = []):
        """
        Starts a chat session with the uploaded files and given prompt.
        """
        if not self.model:
            raise Exception("Model is not configured. Call `configure_model` first.")

        if not self.files:
            raise Exception("No files uploaded. Upload a file first.")

        if prompt == "local":
            print("local")
            chat_session = self.model.start_chat()
            return chat_session

        file_hist = [
                {
                    "role": "user",
                    "parts": [self.files[0], prompt]
                },
                {
                    "role": "model",
                    "parts": ["Analyzing and generating a summary from the uploaded file..."]
                },
            ]
        history = file_hist + chat_history

        chat_session = self.model.start_chat(history=history)
        return chat_session

    def send_message(self,file ,chat_session, message: str):
        """
        Sends a message to the active chat session and returns the response.
        """

        answer = chat_session.send_message([file,message], stream=True)
        # print("\n\n\nAnswer:",answer)
        for chunk in answer:
            # response += chunk
            chunk = chunk.text.replace("\n", "<br>").replace("**", "<b>").replace("**:", "</b>:")
            # try:
            #     print(chunk.text)
            # except:
            #     print("error in text")
            yield str(chunk)

        # return chat_session.send_message_async([file,message], stream=True)
        # return response.text


if __name__ == "__main__":
    # Instantiate the processor class and configure the model
    gemini_processor = GeminiFileProcessor()

    # Upload the file (update the path to your local file)
    file_path = "A:/Projects/invarido/AI/reports/report.pdf"
    gemini_processor.upload_file(file_path, mime_type="application/pdf")

    # Wait until the files are processed and ready
    gemini_processor.wait_for_files_to_be_ready()

    # Start the chat session and provide the prompt
    prompt = "Summarize the priority 2 issues and grade them by severity and order by which should be fixed first."
    chat_session = gemini_processor.start_chat_session(prompt)

    # Send additional messages
    follow_up_question = "Summarize the issues in the Audit Report of Fort Worth and grade them by severity and order by which should be fixed first."
    response = gemini_processor.send_message(chat_session, follow_up_question)

    print(response)

