from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import os


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean(), unique=False,
                          nullable=False, default=True)
    created_at = db.Column(
        db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def set_password(self, password):
        """Hash and set password"""
        self.password = generate_password_hash(
            password, method='pbkdf2:sha256')

    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password, password)

    def generate_token(self):
        """Generate JWT token for user"""
        try:
            payload = {
                'user_id': self.id,
                'email': self.email,
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(hours=24)
            }
            token = jwt.encode(
                payload,
                os.getenv('FLASK_APP_KEY', 'default-secret-key'),
                algorithm='HS256'
            )
            return token
        except Exception as e:
            print(f"Token generation error: {e}")
            return None

    @staticmethod
    def decode_token(token):
        """Decode JWT token and return user data"""
        try:
            payload = jwt.decode(
                token,
                os.getenv('FLASK_APP_KEY', 'default-secret-key'),
                algorithms=['HS256']
            )
            return payload
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {e}")
            return None
        except Exception as e:
            print(f"Token decode error: {e}")
            return None

    @staticmethod
    def get_user_by_email(email):
        """Get user by email address"""
        return User.query.filter_by(email=email.lower().strip()).first()

    @staticmethod
    def create_user(email, password):
        """Create a new user"""
        user = User()
        user.email = email.lower().strip()
        user.set_password(password)
        user.is_active = True
        return user

    def update_last_login(self):
        """Update the user's last login timestamp"""
        self.updated_at = datetime.utcnow()
        db.session.commit()
