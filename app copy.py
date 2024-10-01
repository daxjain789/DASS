import logging
import datetime
from flask import Flask, render_template, Response, request,stream_with_context,jsonify
import json
from flask_cors import CORS
# from src import  AiSearch,Config,LawDrafting
# from src import  AiSearch,Config,LawDrafting
from src import  Config, AiSearch
import os
# from dotenv import load_dotenv
# load_dotenv()

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

@app.route("/")
def index():
    """
    Renders the main page.

    Returns:
        str: The rendered HTML of the main page.
    """
    return render_template("qanoun.html")

@app.route("/", methods=['POST'])
def stream_query():
    """
    Streams the response to the user's query.

    Returns:
        Response: The AI's response streamed back to the client.
    """
    data = request.json
    user_input = data.get('user_input')
    user_country = data.get('user_country')
    subscription_type = data.get('subscription_type')
    conversation_history = data.get('conversation_history')
    internet = data.get('internet')

    quanoun_ai = AiSearch(sub_type = subscription_type)
    return Response(
        quanoun_ai.answer_query(user_input, user_type=subscription_type, country=user_country, history=conversation_history, internet=internet),
        mimetype="text/event-stream"
    )

if __name__ == '__main__':
    app.run(port=CONF.PRODUCTION_APP_PORT, host=CONF.PRODUCTION_APP_HOST, debug=CONF.PRODUCTION_APP_DEBUG, threaded=CONF.PRODUCTION_APP_THREADED)
