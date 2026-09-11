import logging
import os


class Config:
    LOGGING_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ATTACHMENT_DIR = 'statics/attachments'
    IMAGE_DIR = 'statics/images'
    DOWNLOAD = 'statics/downloads'
    CAROUSEL = 'statics/carousels'
    LOGGING_LEVEL = logging.DEBUG
    PORT = 5004
    MAX_CONTENT_LENGTH = 500 * 1024 * 1024

    SECRET_KEY = os.environ.get('FLASK_SECRET_KEY', '')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', '')
    JWT_TOKEN_LOCATION = ['cookies', 'headers']
    JWT_COOKIE_SECURE = True
    JWT_COOKIE_SAMESITE = 'Strict'
    JWT_COOKIE_CSRF_PROTECT = True

    # Secrets must be provided by the deployment environment, never Git.
    BASIC_AUTH = os.environ.get('PORTAL_BASIC_AUTH', '')
    PORTAL_CLIENT_ID = os.environ.get('PORTAL_CLIENT_ID', '')
    REDIRECT_URL = os.environ.get(
        'PORTAL_REDIRECT_URL',
        'https://health.ncu.edu.tw/api/auth/return-to',
    )
    HOME_PAGE_URL = os.environ.get('HOME_PAGE_URL', 'https://health.ncu.edu.tw/')
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.environ.get(
            'CORS_ORIGINS',
            'https://health.ncu.edu.tw,http://localhost,http://localhost:3000',
        ).split(',')
        if origin.strip()
    ]



class DevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///development-database.db'
    LOGGING_HANDLERS = {
        'console': {
            'level': Config.LOGGING_LEVEL,
            'class': 'logging.StreamHandler',
            'formatter': 'default',
        },
    }
