import os
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_cors import CORS
from api.models import db
from api.routes import api
from api.utils import APIException, generate_sitemap
from api.commands import setup_commands

ENV = os.getenv("FLASK_DEBUG", "0") == "1"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')

app = Flask(__name__)
app.url_map.strict_slashes = False

# Database configuration
db_url = os.getenv("DATABASE_URL")
if db_url is not None and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv(
    'FLASK_APP_KEY', 'your-secret-key-change-in-production')
app.config['DEBUG'] = ENV

# Initialize extensions
CORS(app, origins=[
    "http://localhost:3000",
    "https://*.gitpod.io",
    "https://*.github.dev",
    # Add your specific Codespaces URL
    "https://fuzzy-enigma-q7xp59vrqwggcwx6-3000.app.github.dev"
])
db.init_app(app)
Migrate(app, db)

# Setup CLI commands
setup_commands(app)

# Register blueprints
app.register_blueprint(api, url_prefix='/api')

# Error handlers


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# Routes


@app.route('/')
def sitemap():
    if ENV:
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')


@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "database": "connected" if db_url else "not configured",
        "environment": "development" if ENV else "production"
    }), 200


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


# This only runs if `$ python src/app.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=ENV)
