import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
from bson import ObjectId

# Load variables from .env file
load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes and origins to fix "Server Offline" issues
CORS(app, resources={r"/*": {"origins": "*"}})

# --- MongoDB Configuration ---
MONGO_URI = os.getenv("MONGO_URI")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client['finstagram_db']
    # Trigger a connection check
    client.server_info() 
    print("✅ Connected to MongoDB successfully!")
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")

# --- File Storage Configuration ---
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# List of common video extensions for the Reels section
VIDEO_EXTENSIONS = {'.mp4', '.mov', '.avi', '.webm', '.mkv'}

# --- Authentication Routes ---

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"message": "Username and password required"}), 400
        
    if db.users.find_one({"username": data['username']}):
        return jsonify({"message": "Username already exists"}), 400
    
    db.users.insert_one({
        "username": data['username'],
        "password": data['password'],
        "created_at": datetime.utcnow()
    })
    return jsonify({"message": "Signup successful!"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = db.users.find_one({"username": data['username'], "password": data['password']})
    
    if user:
        profile = db.profiles.find_one({"username": data['username']})
        return jsonify({
            "message": "Login Successful!", 
            "username": data['username'],
            "hasProfile": True if profile else False
        }), 200
    
    return jsonify({"message": "Invalid Credentials"}), 401

# --- Profile Routes ---

@app.route('/api/profile/<username>', methods=['GET'])
def get_profile(username):
    profile = db.profiles.find_one({"username": username})
    if not profile:
        return jsonify({"message": "Profile not found"}), 404
    
    # Get user's posts
    host = request.host_url.rstrip('/')
    posts_cursor = db.posts.find({"username": username}).sort("timestamp", -1)
    posts = [{
        "url": f"{host}/api/get_file/{p['filename']}", 
        "caption": p.get('caption', ''),
        "time": p.get('timestamp'),
        "is_video": any(p['filename'].lower().endswith(ext) for ext in VIDEO_EXTENSIONS)
    } for p in posts_cursor]

    return jsonify({
        "full_name": profile.get('full_name'),
        "bio": profile.get('bio'),
        "location": profile.get('location'),
        "profile_pic": profile.get('profile_pic'),
        "posts": posts
    }), 200

@app.route('/api/create-profile', methods=['POST'])
def create_profile():
    data = request.json
    db.profiles.update_one(
        {"username": data['username']},
        {"$set": {
            "full_name": data.get('full_name'),
            "bio": data.get('bio'),
            "location": data.get('location')
        }},
        upsert=True
    )
    return jsonify({"message": "Profile saved!"}), 200

@app.route('/api/upload-profile-pic', methods=['POST'])
def upload_profile_pic():
    file = request.files.get('file')
    username = request.form.get('username')
    if file and username:
        filename = secure_filename(f"profile_{username}_{file.filename}")
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        host = request.host_url.rstrip('/')
        url = f"{host}/api/get_file/{filename}"
        
        db.profiles.update_one(
            {"username": username},
            {"$set": {"profile_pic": url}},
            upsert=True
        )
        return jsonify({"message": "Profile picture updated!"}), 200
    return jsonify({"message": "Upload failed"}), 400

# --- Messaging Routes ---

@app.route('/api/messages/<current_user>/<other_user>', methods=['GET'])
def get_messages(current_user, other_user):
    # Fetch all messages between the two users (sent or received)
    messages_cursor = db.messages.find({
        "$or": [
            {"sender": current_user, "receiver": other_user},
            {"sender": other_user, "receiver": current_user}
        ]
    }).sort("timestamp", 1)
    
    messages = []
    for m in messages_cursor:
        messages.append({
            "sender": m['sender'],
            "receiver": m['receiver'],
            "text": m['text'],
            "timestamp": m['timestamp']
        })
    return jsonify(messages), 200

@app.route('/api/send-message', methods=['POST'])
def send_message():
    data = request.json
    if not data or 'sender' not in data or 'receiver' not in data or 'text' not in data:
        return jsonify({"message": "Incomplete message data"}), 400
        
    db.messages.insert_one({
        "sender": data['sender'],
        "receiver": data['receiver'],
        "text": data['text'],
        "timestamp": datetime.utcnow()
    })
    return jsonify({"message": "Message sent!"}), 201

@app.route('/api/chat-list/<username>', methods=['GET'])
def get_chat_list(username):
    # This fetches all other users so you can start a chat with them
    users_cursor = db.users.find({"username": {"$ne": username}}, {"username": 1})
    chat_list = []
    for u in users_cursor:
        profile = db.profiles.find_one({"username": u['username']})
        chat_list.append({
            "username": u['username'],
            "avatar": profile.get('profile_pic') if profile else None
        })
    return jsonify(chat_list), 200

# --- Feed, Post & Reels Routes ---

@app.route('/api/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    username = request.form.get('username')
    caption = request.form.get('caption')
    if file:
        filename = secure_filename(f"{username}_{datetime.now().timestamp()}_{file.filename}")
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        db.posts.insert_one({
            "username": username,
            "filename": filename,
            "caption": caption,
            "timestamp": datetime.utcnow()
        })
        return jsonify({"message": "Posted!"}), 201
    return jsonify({"message": "Error"}), 400

@app.route('/api/posts', methods=['GET'])
def get_posts():
    host = request.host_url.rstrip('/')
    posts_cursor = db.posts.find().sort("timestamp", -1)
    posts = []
    for p in posts_cursor:
        profile = db.profiles.find_one({"username": p['username']})
        posts.append({
            "username": p['username'],
            "url": f"{host}/api/get_file/{p['filename']}", 
            "caption": p.get('caption', ''),
            "avatar": profile.get('profile_pic') if profile else None,
            "time": p.get('timestamp'),
            "is_video": any(p['filename'].lower().endswith(ext) for ext in VIDEO_EXTENSIONS)
        })
    return jsonify(posts), 200

@app.route('/api/reels', methods=['GET'])
def get_reels():
    host = request.host_url.rstrip('/')
    posts_cursor = db.posts.find().sort("timestamp", -1)
    reels = []
    for p in posts_cursor:
        if any(p['filename'].lower().endswith(ext) for ext in VIDEO_EXTENSIONS):
            profile = db.profiles.find_one({"username": p['username']})
            reels.append({
                "username": p['username'],
                "url": f"{host}/api/get_file/{p['filename']}", 
                "caption": p.get('caption', ''),
                "avatar": profile.get('profile_pic') if profile else None,
                "time": p.get('timestamp')
            })
    return jsonify(reels), 200

@app.route('/api/get_file/<filename>')
def get_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- Notifications ---

@app.route('/api/notifications/<username>', methods=['GET'])
def get_notifications(username):
    notifications = [
        {"message": "Welcome to Finstagram!", "time": datetime.utcnow()},
        {"message": "Try uploading your first Reel!", "time": datetime.utcnow()},
        {"message": "Check your messages to chat with friends!", "time": datetime.utcnow()}
    ]
    return jsonify(notifications), 200

# --- System ---

@app.route('/')
def health_check():
    return "Backend is Running", 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)