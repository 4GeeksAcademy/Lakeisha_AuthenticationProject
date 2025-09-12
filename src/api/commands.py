import click
from api.models import db, User
from flask.cli import with_appcontext


def setup_commands(app):

    @app.cli.command("insert-test-users")
    @click.argument("count", default=5)
    @with_appcontext
    def insert_test_users(count):
        """Insert test users into the database"""
        print("Creating test users...")

        try:
            count = int(count)
        except ValueError:
            print("Error: Count must be a number")
            return

        created_count = 0
        for i in range(1, count + 1):
            email = f"test_user{i}@test.com"

            # Check if user already exists
            existing_user = User.get_user_by_email(email)
            if existing_user:
                print(f"User {email} already exists, skipping...")
                continue

            try:
                # Default password for test users
                user = User.create_user(email, "123456")
                db.session.add(user)
                print(f"{email} created.")
                created_count += 1
            except Exception as e:
                print(f"Error creating user {email}: {e}")

        try:
            db.session.commit()
            print(f"{created_count} users created successfully!")
        except Exception as e:
            db.session.rollback()
            print(f"Error saving users to database: {e}")

    @app.cli.command("insert-test-data")
    @with_appcontext
    def insert_test_data():
        """Insert test data for development"""
        print("Creating test data...")

        users_to_create = [
            {"email": "admin@test.com", "password": "admin123"},
            {"email": "user@test.com", "password": "user123"},
            {"email": "demo@test.com", "password": "demo123"}
        ]

        created_count = 0
        for user_data in users_to_create:
            email = user_data["email"]
            password = user_data["password"]

            # Check if user already exists
            if User.get_user_by_email(email):
                print(f"User {email} already exists, skipping...")
                continue

            try:
                user = User.create_user(email, password)
                db.session.add(user)
                print(f"User {email} created.")
                created_count += 1
            except Exception as e:
                print(f"Error creating user {email}: {e}")

        try:
            db.session.commit()
            print(f"{created_count} test users created successfully!")
        except Exception as e:
            db.session.rollback()
            print(f"Error saving test data to database: {e}")

    @app.cli.command("reset-db")
    @with_appcontext
    def reset_db():
        """Reset the database"""
        print("Resetting database...")
        try:
            db.drop_all()
            db.create_all()
            print("Database reset successfully!")
        except Exception as e:
            print(f"Error resetting database: {e}")

    @app.cli.command("create-admin")
    @click.argument("email")
    @click.argument("password")
    @with_appcontext
    def create_admin(email, password):
        """Create an admin user"""
        print(f"Creating admin user: {email}")

        # Check if user already exists
        if User.get_user_by_email(email):
            print(f"User {email} already exists!")
            return

        try:
            user = User.create_user(email, password)
            db.session.add(user)
            db.session.commit()
            print(f"Admin user {email} created successfully!")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating admin user: {e}")

    @app.cli.command("list-users")
    @with_appcontext
    def list_users():
        """List all users in the database"""
        try:
            users = User.query.all()
            if not users:
                print("No users found in database.")
                return

            print(f"Found {len(users)} users:")
            print("-" * 50)
            for user in users:
                status = "Active" if user.is_active else "Inactive"
                created = user.created_at.strftime(
                    "%Y-%m-%d %H:%M:%S") if user.created_at else "Unknown"
                print(
                    f"ID: {user.id} | Email: {user.email} | Status: {status} | Created: {created}")
        except Exception as e:
            print(f"Error listing users: {e}")

    @app.cli.command("delete-user")
    @click.argument("email")
    @with_appcontext
    def delete_user(email):
        """Delete a user by email"""
        user = User.get_user_by_email(email)
        if not user:
            print(f"User {email} not found!")
            return

        try:
            db.session.delete(user)
            db.session.commit()
            print(f"User {email} deleted successfully!")
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting user: {e}")
