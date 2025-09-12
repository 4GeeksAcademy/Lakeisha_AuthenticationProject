"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
import re

api = Blueprint('api', __name__)

# Remove this line - CORS is already configured in app.py
# CORS(api)


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """Validate password strength"""
    return len(password) >= 6


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200


@api.route('/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    try:
        # Get data from request
        data = request.get_json()

        if not data:
            raise APIException("No data provided", status_code=400)

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        # Validate input
        if not email or not password:
            raise APIException(
                "Email and password are required", status_code=400)

        if not validate_email(email):
            raise APIException("Invalid email format", status_code=400)

        if not validate_password(password):
            raise APIException(
                "Password must be at least 6 characters long", status_code=400)

        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            raise APIException(
                "User with this email already exists", status_code=409)

        # Create new user
        new_user = User()
        new_user.email = email
        new_user.set_password(password)

        # Save to database
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "User created successfully",
            "user": new_user.serialize()
        }), 201

    except APIException as e:
        return jsonify({"error": str(e)}), e.status_code
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500


@api.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        # Get data from request
        data = request.get_json()

        if not data:
            raise APIException("No data provided", status_code=400)

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        # Validate input
        if not email or not password:
            raise APIException(
                "Email and password are required", status_code=400)

        # Find user
        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            raise APIException("Invalid email or password", status_code=401)

        if not user.is_active:
            raise APIException("Account is deactivated", status_code=401)

        # Generate token
        token = user.generate_token()

        if not token:
            raise APIException("Could not generate token", status_code=500)

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": user.serialize()
        }), 200

    except APIException as e:
        return jsonify({"error": str(e)}), e.status_code
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@api.route('/protected', methods=['GET'])
def protected():
    """Protected route that requires authentication"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            raise APIException(
                "Authorization header is required", status_code=401)

        # Extract token from "Bearer <token>"
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            raise APIException(
                "Invalid authorization header format", status_code=401)

        # Decode token
        payload = User.decode_token(token)

        if not payload:
            raise APIException("Invalid or expired token", status_code=401)

        # Get user from database
        user = User.query.get(payload['user_id'])

        if not user or not user.is_active:
            raise APIException("User not found or inactive", status_code=401)

        return jsonify({
            "message": "Access granted to protected route",
            "user": user.serialize()
        }), 200

    except APIException as e:
        return jsonify({"error": str(e)}), e.status_code
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@api.route('/user/profile', methods=['GET'])
def get_profile():
    """Get current user profile"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            raise APIException(
                "Authorization header is required", status_code=401)

        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            raise APIException(
                "Invalid authorization header format", status_code=401)

        # Decode token
        payload = User.decode_token(token)

        if not payload:
            raise APIException("Invalid or expired token", status_code=401)

        # Get user from database
        user = User.query.get(payload['user_id'])

        if not user:
            raise APIException("User not found", status_code=404)

        return jsonify({
            "user": user.serialize()
        }), 200

    except APIException as e:
        return jsonify({"error": str(e)}), e.status_code
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@api.route('/validate-token', methods=['POST'])
def validate_token():
    """Validate if token is still valid"""
    try:
        data = request.get_json()
        token = data.get('token') if data else None

        if not token:
            raise APIException("Token is required", status_code=400)

        # Decode token
        payload = User.decode_token(token)

        if not payload:
            raise APIException("Invalid or expired token", status_code=401)

        # Get user from database
        user = User.query.get(payload['user_id'])

        if not user or not user.is_active:
            raise APIException("User not found or inactive", status_code=401)

        return jsonify({
            "valid": True,
            "user": user.serialize()
        }), 200

    except APIException as e:
        return jsonify({
            "valid": False,
            "error": str(e)
        }), e.status_code
    except Exception as e:
        return jsonify({
            "valid": False,
            "error": "Internal server error"
        }), 500
