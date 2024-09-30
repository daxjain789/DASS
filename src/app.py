import logging
import datetime
from flask import Flask, render_template, Response, request,stream_with_context,url_for,jsonify,flash, redirect
import json
from flask_cors import CORS
from src import  Config, GeminiFileProcessor
import os
from werkzeug.utils import secure_filename
# from dotenv import load_dotenv
# load_dotenv()

CONF = Config()
trash_day = CONF.PRODUCTION_APP_LOG_CLEAR
today = datetime.datetime.now().date()

UPLOAD_FOLDER = "D:/Other/Invarido/AI/AI/uploadFile"
ALLOWED_EXTENSIONS = {'txt', 'pdf'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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

gemini_processor = GeminiFileProcessor()

@app.route('/uploadFile', methods=['POST'])
def upload_file():
    print("INN")
    data = request.json
    # file_path = data.get('file_path')
    file_path = request.form.get('file_path')
    file = gemini_processor.upload_file(file_path, mime_type="application/pdf")
    return jsonify({"status": "File uploaded", "uri": file.uri})

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/uploadPDF', methods=['POST'])
def upload_pdf():
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
            # return os.path.join(UPLOAD_FOLDER, filename)
            response = genimiGenerator(os.path.join(UPLOAD_FOLDER, filename),prompt)
            # response = "ok"
            print("response:",response)
            return jsonify({"summary": response,"path":os.path.join(UPLOAD_FOLDER, filename)})
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''

def genimiGenerator(file_path,prompt):
    file = gemini_processor.upload_file(file_path, mime_type="application/pdf")
    gemini_processor.wait_for_files_to_be_ready()
    chat_session = gemini_processor.start_chat_session(prompt)
    response = gemini_processor.send_message(chat_session, "Summarize the issues.")
    return response

@app.route('/summarize-issues', methods=['POST'])
def summarize_issues():
    print("IN")

    # data = request.json

    file_path = request.form.get("file_path","file not found")
    prompt = request.form.get('prompt', "blank")
    print(file_path,prompt)
    # file_path = data.get('file_path')
    # prompt = data.get('prompt')
    # prompt = request.form.get('prompt')
    response = genimiGenerator(file_path,prompt)
    return jsonify({"summary": response})

if __name__ == '__main__':
    # app.run(port=CONF.PRODUCTION_APP_PORT, host=CONF.PRODUCTION_APP_HOST, debug=CONF.PRODUCTION_APP_DEBUG, threaded=CONF.PRODUCTION_APP_THREADED)
    app.run(host='192.168.8.128', port=8000)

#Session Prompt