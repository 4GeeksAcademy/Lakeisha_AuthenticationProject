"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import request, jsonify, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
import re

api = Blueprint('api', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    return len(password) >= 6

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    """Test endpoint"""
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
            return jsonify({"message": "No data provided"}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        # Validate input
        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        if not validate_email(email):
            return jsonify({"message": "Invalid email format"}), 400

        if not validate_password(password):
            return jsonify({"message": "Password must be at least 6 characters long"}), 400

        # Check if user already exists
        existing_user = User.get_user_by_email(email)
        if existing_user:
            return jsonify({"message": "User with this email already exists"}), 409

        # Create new user using your static method
        new_user = User.create_user(email, password)

        # Save to database
        db.session.add(new_user)
        db.session.commit()

        # Generate token for immediate login after signup
        token = new_user.generate_token()

        return jsonify({
            "message": "User created successfully",
            "token": token,
            "user": new_user.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Signup error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@api.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        # Get data from request
        data = request.get_json()

        if not data:
            return jsonify({"message": "No data provided"}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        # Validate input
        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        # Find user using your static method
        user = User.get_user_by_email(email)

        if not user or not user.check_password(password):
            return jsonify({"message": "Invalid email or password"}), 401

        if not user.is_active:
            return jsonify({"message": "Account is deactivated"}), 401

        # Update last login
        user.update_last_login()

        # Generate token
        token = user.generate_token()

        if not token:
            return jsonify({"message": "Could not generate token"}), 500

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": user.serialize()
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@api.route('/validate-token', methods=['POST'])
def validate_token():
    """Validate if token is still valid"""
    try:
        data = request.get_json()
        token = data.get('token') if data else None

        if not token:
            return jsonify({"valid": False, "message": "Token is required"}), 400

        # Decode token using your static method
        payload = User.decode_token(token)

        if not payload:
            return jsonify({"valid": False, "message": "Invalid or expired token"}), 401

        # Get user from database
        user = User.query.get(payload['user_id'])

        if not user or not user.is_active:
            return jsonify({"valid": False, "message": "User not found or inactive"}), 401

        return jsonify({
            "valid": True,
            "user": user.serialize()
        }), 200

    except Exception as e:
        print(f"Token validation error: {str(e)}")
        return jsonify({"valid": False, "message": "Internal server error"}), 500

@api.route('/protected', methods=['GET'])
def protected():
    """Protected route that requires authentication"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({"message": "Authorization header is required"}), 401

        # Extract token from "Bearer <token>"
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return jsonify({"message": "Invalid authorization header format"}), 401

        # Decode token
        payload = User.decode_token(token)

        if not payload:
            return jsonify({"message": "Invalid or expired token"}), 401

        # Get user from database
        user = User.query.get(payload['user_id'])

        if not user or not user.is_active:
            return jsonify({"message": "User not found or inactive"}), 401

        return jsonify({
            "message": "Access granted to protected route",
            "user": user.serialize()
        }), 200

    except Exception as e:
        print(f"Protected route error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@api.route('/user/profile', methods=['GET'])
def get_profile():
    """Get current user profile"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({"message": "Authorization header is required"}), 401

        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return jsonify({"message": "Invalid authorization header format"}), 401

        # Decode token
        payload = User.decode_token(token)

        if not payload:
            return jsonify({"message": "Invalid or expired token"}), 401

        # Get user from database
        user = User.query.get(payload['user_id'])

        if not user:
            return jsonify({"message": "User not found"}), 404

        return jsonify({
            "user": user.serialize()
        }), 200

    except Exception as e:
        print(f"Profile error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@api.route('/logout', methods=['POST'])
def logout():
    """Logout endpoint (client-side token removal)"""
    return jsonify({
        "message": "Logout successful. Please remove token from client storage."
    }), 200