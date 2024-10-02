import logging
import datetime
from flask import Flask, render_template, Response, request,stream_with_context,jsonify,flash
import json
from flask_cors import CORS
# from src import  AiSearch,Config,LawDrafting
# from src import  AiSearch,Config,LawDrafting
from src import  Config, GeminiFileProcessor,GeminiDashboardProcessor
import os
from werkzeug.utils import secure_filename
# from dotenv import load_dotenv
# load_dotenv()

UPLOAD_FOLDER = "D:/Other/Invarido/GITHUB/DASS/uploadFile"
ALLOWED_EXTENSIONS = {'txt', 'pdf'}

CONF = Config()
trash_day = CONF.PRODUCTION_APP_LOG_CLEAR
today = datetime.datetime.now().date()

def MyCustomHandler():
    global today
    if datetime.datetime.now().date() != today:
        os.rename(f"{CONF.PRODUCTION_APP_LOG_PATH}main.log", f"{CONF.PRODUCTION_APP_LOG_PATH}old_{today}.log")
        del_path = f'{CONF.PRODUCTION_APP_LOG_PATH}old_{today - datetime.timedelta(days=trash_day)}.log'
        if os.path.exists(del_path):
            os.remove(del_path)
        today = datetime.datetime.now().date()
        return 1
    return 0

# Initialize logging
logging.basicConfig(filename=f'{CONF.PRODUCTION_APP_LOG_PATH}main.log', level=logging.INFO, format='%(asctime)s - _APP_ - %(levelname)s - %(message)s')
logging.Handler(MyCustomHandler())

app = Flask(__name__)
CORS(app)

gemini_processor_ = GeminiFileProcessor()
gemini_processor = GeminiDashboardProcessor()

@app.route("/",methods=['GET'])
def index():
    return render_template('index.html')

@app.route("/dashboard",methods=['GET'])
def dashboardView():
    return render_template('dashboard.html')

@app.route("/analysis",methods=['GET'])
def analysis():
    return render_template('analyse.html')

# def genimiGenerator(file_path,prompt):
#     file = gemini_processor.upload_file(file_path, mime_type="application/pdf")
#     gemini_processor.wait_for_files_to_be_ready()
#     chat_session = gemini_processor.start_chat_session(prompt)
#     response = gemini_processor.send_message(file,chat_session, prompt)
#     return response

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploadPDF', methods=['POST'])
def upload_pdf():
    print("upload Method called")
    if request.method == 'POST':
        prompt = request.form.get("prompt")
        print("prompt:",prompt,request.files)
        if 'file' not in request.files:
            flash('No file part')
            return jsonify({"url":request.url})
        file = request.files['file']
        if file.filename == '':
            flash('No selected file')
            return jsonify({"url":request.url})
        if file and allowed_file(file.filename):
            print("file founded")
            filename = secure_filename(".".join(file.filename.split(".")[:-1])+"-Uploaded."+file.filename.split(".")[-1])
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            path = os.path.join(UPLOAD_FOLDER, filename)
            return jsonify({"path": path})

@app.route('/dashboardData', methods=['POST'])
def dashboard():
    # data = request.json
    file_path = request.form.get('file_path')
    prompt = request.form.get('prompt')
    print("dashboard inn")
    
    # file_path = r"A:\Projects\invarido\DASS\reports\report.pdf"
    prompt123="""
        provide following details in json formate from pdf

        1. total incedents: output will be numbers of total security incendents show in report
        2. Active Threats: How many active threats are currently being monitored
        3. Systems Monitored: What is the total number of systems being monitored for security threats
        4. recommendation categorys: understand the recommendations from audit and assign from below options to each recommendation 
            i. Non-Technical (NT)
            ii. Technical (T)
            iii. Physical (P)
            iv. GDPR-related (G)
            provide total number for each category

        example output:
        {"incidents":10,"activeThreats":3,"monitired":6,"recommendation_category":{"T":2,"NT":4,"P":3,"G":0}}

        instruction:
        1. output should be strictly in json formet only as per example
        2. no additional explanation is required
        """
    prompt_recommendations_area = """
        Extract the following fields from the PDF document and return them in JSON format:

        {
        "Governance": "<Number of Recommendations>",
        "Asset Recommendations": "<Number of Recommendations>",
        "Risk Management Recommendations": "<Number of Recommendations>",
        "Training and Awareness Recommendations": "<Number of Recommendations>",
        "Policies and Procedure Recommendations": "<Number of Recommendations>",
        "Physical Security Recommendations": "<Number of Recommendations>",
        "Incident Response Management Recommendations": "<Number of Recommendations>",
        "Business Continuity Management Recommendations": "<Number of Recommendations>",
        "Third Party Recommendations": "<Number of Recommendations>",
        "Legal, Regulatory and Contractual Recommendations": "<Number of Recommendations>",
        "Secure Configuration": "<Number of Recommendations>",
        "Network Security": "<Number of Recommendations>",
        "Anti-Malware": "<Number of Recommendations>",
        "User Access and User Privileges": "<Number of Recommendations>",
        "Mobile Devices, Mobile Working and Removable Media": "<Number of Recommendations>",
        "Data Storage": "<Number of Recommendations>",
        "Development": "<Number of Recommendations>",
        "Security Monitoring": "<Number of Recommendations>"
        }

        Ensure the counts for each recommendation category are accurate and mapped correctly.
        output should be strickly in json formate, no other information should be given.
    """
    prompt_security = """
        provide the following types of security alerts:
        1. All frequent security alert types
        2. All severe security alert types (based on impact and likelihood)
        3. All security alert types by system type (e.g., server, workstation, network device)
    
        Extract the following details from the pdf and return them in JSON format:

        {
        "Recent Security Alerts": [
            {
            "Type": "<Type of alert>",
            "Description": "<Description of alert>",
            "Severity": "<Severity level>",
            "Time": "<Time since detected>",
            "Status": "<Current status>"
            },
        ]
        }

        Ensure all alerts are captured with their respective details accurately. don't provide any thoughts just json
    """

    # prompt_insight = """
    # provide actionable insights to streamline the decision-making process for security incident response, including:
    # 1. Recommendations for prioritizing incident response efforts based on threat severity and impact
    # 2. Suggestions for optimizing system monitoring to reduce false positives and improve detection rates
    # 3. Identification of potential security gaps or vulnerabilities that require attention
    # 4. Guidance on how to allocate resources effectively to resolve incidents quickly and efficiently"""

    file = gemini_processor.upload_file(file_path, mime_type="application/pdf")
    print("File:",file)
    gemini_processor.wait_for_files_to_be_ready()
    chat_session = gemini_processor.start_chat_session("local")
    response123 = gemini_processor.send_message(file, prompt123)
    response_area = gemini_processor.send_message(file, prompt_recommendations_area)
    response_security = gemini_processor.send_message(file, prompt_security)
    # response_insight = gemini_processor.send_message(file, prompt_insight)

    # return jsonify({"response_security": response_security})
    return jsonify({"summary123": response123,"response_area":response_area,"response_security": response_security})

@app.route("/summarize-issues")
def summarizeIssues():
    """
    Renders the main page.

    Returns:
        str: The rendered HTML of the main page.
    """
    return render_template("qanoun.html")

@app.route('/answer', methods=['POST'])
def summarize_issues():
    file_path = request.form.get("file")
    prompt = request.form.get("prompt")
    history = request.form.get("history")

    print("*"*30)
    print("path:",file_path,"prompt",prompt,"\n\nhistory:",history)

    file = gemini_processor_.upload_file(file_path, mime_type="application/pdf")
    gemini_processor_.wait_for_files_to_be_ready()
    chat_session = gemini_processor_.start_chat_session(history)
    # chat_session = gemini_processor_.start_chat_session("local")
    return Response(gemini_processor_.send_message(chat_session, prompt,), mimetype="text/event-stream")
    # return Response(gemini_processor_.send_message(file, chat_session, prompt), mimetype="text/event-stream")

@app.route('/reportAnalysis',methods=['POST'])
def reportAnalysis():
    print("function is called")
    path = request.form.get("path")
    prompt = "Analyse given report and provide the solution of this report"
    prompt = "Please thoroughly analyze the provided PDF of the cybersecurity audit report, focusing on identified vulnerabilities, security gaps, compliance issues, and risk areas. Summarize the key findings and assess the severity of the risks highlighted in the report. Based on your analysis, propose specific solutions or recommendations to mitigate these risks, enhance security measures, and ensure compliance with relevant cybersecurity standards and best practices."

    file = gemini_processor.upload_file(path, mime_type="application/pdf")
    print("File:",file)
    gemini_processor.wait_for_files_to_be_ready()
    response = gemini_processor.send_message(file, prompt)

    print(response)
    return jsonify({"data": response})

if __name__ == '__main__':
    print("Server Running on: "+str(CONF.PRODUCTION_APP_HOST)+":8000 or localhost:8000")
    app.run(port="8000", host=CONF.PRODUCTION_APP_HOST, debug=CONF.PRODUCTION_APP_DEBUG, threaded=CONF.PRODUCTION_APP_THREADED)
