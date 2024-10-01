import json
import os

class Config:
    def __init__(self) -> None:
        with open('config.json', 'r') as config_file:
            self.config_data = json.load(config_file)

        # production APP constants initialization
        self.PRODUCTION_APP_LOG_PATH = self.config_data[0]['app']['log_path']
        self.PRODUCTION_APP_LOG_CLEAR = self.config_data[0]['app']['log_clear_after_days']
        self.PRODUCTION_APP_PORT = self.config_data[0]['app']['port']
        self.PRODUCTION_APP_HOST = self.config_data[0]['app']['host']
        self.PRODUCTION_APP_THREADED = self.config_data[0]['app']['threaded']
        self.PRODUCTION_APP_DEBUG = self.config_data[0]['app']['debug']