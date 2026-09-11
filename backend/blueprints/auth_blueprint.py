import hmac
import secrets
from urllib.parse import urlencode

import requests
from flask import Blueprint, current_app, request, make_response, redirect, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, create_refresh_token, \
    set_access_cookies, set_refresh_cookies, unset_access_cookies, unset_refresh_cookies, get_jwt, get_csrf_token

from helpers.CustomResponse import CustomResponse
from models.user_model import User, db
from sqlalchemy import desc, or_
import math

from datetime import datetime, timedelta, timezone
auth_blueprint = Blueprint('auth', __name__)

OAUTH_STATE_COOKIE = 'portal_oauth_state'


def require_admin_user():
    identity = get_jwt_identity()
    user = User.query.get(identity['id']) if identity else None
    if user is None or user.role != 0:
        return None, (jsonify({'message': 'administrator permission required'}), 403)
    return user, None


def get_oauth_access_token(code, state):
    if not current_app.config['BASIC_AUTH']:
        raise RuntimeError('PORTAL_BASIC_AUTH is not configured')

    url = 'https://portal.ncu.edu.tw/oauth2/token'
    headers = {
        'Accept': 'application/json',
        'Authorization': 'Basic ' + current_app.config['BASIC_AUTH']
    }
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'state': state,
        'redirect_uri': current_app.config['REDIRECT_URL'],
    }

    response = requests.post(url, headers=headers, data=data, timeout=10)
    response.raise_for_status()
    response = response.json()

    return response['access_token']


def get_user_info(access_token):
    url = 'https://portal.ncu.edu.tw/apis/oauth/v1/info'

    headers = {
        'Accept': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }

    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    response = response.json()
    response['chineseName'] = response['chineseName'] if 'chineseName' in response else '未設定中文姓名'
    return response


@auth_blueprint.route('/login', methods=['GET'])
def log_in():
    client_id = current_app.config['PORTAL_CLIENT_ID']
    if not client_id:
        return jsonify({'message': 'PORTAL_CLIENT_ID is not configured'}), 503

    state = secrets.token_urlsafe(32)
    query = urlencode({
        'response_type': 'code',
        'state': state,
        'client_id': client_id,
        'redirect_uri': current_app.config['REDIRECT_URL'],
        'scope': 'identifier chinese-name',
    })
    response = make_response(redirect(
        f'https://portal.ncu.edu.tw/oauth2/authorization?{query}', 302
    ))
    response.set_cookie(
        OAUTH_STATE_COOKIE,
        state,
        max_age=300,
        secure=True,
        httponly=True,
        samesite='Lax',
    )
    return response


@auth_blueprint.route('/sign-out', methods=['GET'])
@jwt_required(locations=['headers', 'cookies'])
def log_out():
    """
    log_out
    ---
    tags:
      - auth
    responses:
      200:
        description: Return a success message
      404:
        description: Return a client column not found message
    """
    response = make_response(redirect(current_app.config['HOME_PAGE_URL']), 302)
    unset_access_cookies(response)
    unset_refresh_cookies(response)
    return response, 302


@auth_blueprint.route('/return-to', methods=['GET'])
def return_to():
    """
    Return To
    ---
    tags:
      - auth
    parameters:
      - name: code
        in: query
        type: string
        required: true
        description: code
      - name: state
        in: query
        type: integer
        required: true
        description: state
    responses:
      200:
        description: Return a success message
      404:
        description: Return a client column not found message
    """

    code = request.args.get('code')
    state = request.args.get('state')
    expected_state = request.cookies.get(OAUTH_STATE_COOKIE)

    if not code or not state or not expected_state or not hmac.compare_digest(state, expected_state):
        return jsonify({'message': 'invalid OAuth state'}), 400

    try:
        access_token = get_oauth_access_token(code, state)
        user_info = get_user_info(access_token)
    except (requests.RequestException, KeyError, ValueError, RuntimeError):
        current_app.logger.exception('Portal OAuth callback failed')
        return jsonify({'message': 'Portal authentication failed'}), 502

    user = User.query.get(user_info['identifier'])
    if user is None:
        user = User(id=user_info['identifier'], chinese_name=user_info['chineseName'])
        db.session.add(user)
        db.session.commit()

    access_token = create_access_token(identity=user.to_dict())
    refresh_token = create_refresh_token(identity=user.to_dict())
    response = make_response(redirect(current_app.config['HOME_PAGE_URL']), 302)
    response.delete_cookie(OAUTH_STATE_COOKIE, secure=True, httponly=True, samesite='Lax')
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response, 302


@auth_blueprint.route('/user', methods=['GET'])
@jwt_required(locations=['headers', 'cookies'])
def user_info():
    """
    User Info
    ---
    tags:
      - auth
    responses:
      200:
        description: Return a success message
        schema:
          id: User
      404:
        description: Return a client column not found message
    """
    return CustomResponse.success("get user info success", User.query.get(get_jwt_identity()['id']).to_dict())


@auth_blueprint.route('/user/<user_id>', methods=['PATCH'])
@jwt_required(locations=['headers', 'cookies'])
def patch_user_info(user_id):
    """
    User Info
    ---
    tags:
      - auth
    parameters:
      - name: user_id
        in: path
        type: string
      - name: json
        in: body
        schema:
            id: UserInput
    responses:
      200:
        description: Return a success message
      404:
        description: Return a client column not found message
    """
    _, error = require_admin_user()
    if error:
        return error

    user = User.query.get(user_id)

    if user is None:
        return CustomResponse.not_found("User not found", {})

    if 'chineseName' in request.json:
        user.chinese_name = request.json['chineseName']
    if 'role' in request.json:
        user.role = request.json['role']
    db.session.commit()
    return CustomResponse.no_content("patch user info success", user.to_dict())


@auth_blueprint.route('/user/<user_id>', methods=['DELETE'])
@jwt_required(locations=['headers', 'cookies'])
def delete_user_info(user_id):
    """
    delete User Info
    ---
    tags:
      - auth
    parameters:
      - name: user_id
        in: path
        type: string
    responses:
      200:
        description: Return a success message
      404:
        description: Return a client column not found message
    """

    _, error = require_admin_user()
    if error:
        return error

    user = User.query.get(user_id)

    if user is None:
        return CustomResponse.not_found("User not found", {})

    db.session.delete(user)
    db.session.commit()
    return CustomResponse.no_content("delete user info success", user.to_dict())

@auth_blueprint.route('/user/all', methods=['GET'])
@jwt_required(locations=['headers', 'cookies'])
def get_user_infos():
    """
    delete User Info
    ---
    tags:
      - auth
    parameters:
      - in: query
        name: page
        type: integer
        description: page
      - in: query
        name: search
        type: string
        description: search
    responses:
      200:
        description: Return a success message
        schema:
          id: UserQuery
      404:
        description: Return a client column not found message
    """
    _, error = require_admin_user()
    if error:
        return error

    users = db.session.query(User)

    page = int(request.args['page']) \
        if "page" in request.args and int(request.args['page']) > 1 \
        else 1

    if "search" in request.args:
        users = users.filter(or_(*[User.id.like(f'%{term}%') for term in request.args['search'].split('+')]))

    total_page = math.ceil(len(users.all()) // 10) + 1
    users = sorted([user.to_dict() for user in users], key=lambda user: user['role'])[(page - 1) * 10:page * 10]

    return {'message': "get users success", 'data': users, "total_page": total_page}, 200


@auth_blueprint.after_request
def refresh_expiring_jwts(response):
    if request.path == '/api/auth/sign-out':
        return response
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            set_access_cookies(response, access_token)
        return response
    except (RuntimeError, KeyError):
        return response
