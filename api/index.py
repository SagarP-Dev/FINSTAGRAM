import sqlite3
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 

# --- Serverless Configuration ---
# On Vercel, we must use /tmp for any file writing (DB and Uploads)
# NOTE: These files are temporary and will be deleted when the function sleeps.
UPLOAD_FOLDER = '/tmp/uploads'
DB_PATH = '/tmp/user.db'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def get_db_connection():
    # Helper to ensure the DB exists and connect to it
    if not os.path.exists(DB_PATH):
        init_db()
    conn = sqlite3.connect(DB_PATH)
    return conn

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        username TEXT UNIQUE, 
        password TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS profiles (
        username TEXT PRIMARY KEY, 
        full_name TEXT, 
        bio TEXT, 
        location TEXT,
        profile_pic TEXT, 
        FOREIGN KEY(username) REFERENCES users(username))''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        filename TEXT,
        caption TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        message TEXT,
        type TEXT,
        is_read INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    conn.commit()
    conn.close()

# --- Routes ---

@app.route('/api/get_file/<filename>')
def get_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (data['username'], data['password']))
        conn.commit()
        return jsonify({"message": "Signup successful!"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"message": "Username already exists"}), 400
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username=? AND password=?", (data['username'], data['password']))
    user = cursor.fetchone()
    
    if user:
        cursor.execute("SELECT * FROM profiles WHERE username=?", (data['username'],))
        profile = cursor.fetchone()
        conn.close()
        return jsonify({
            "message": "Login Successful!", 
            "username": data['username'],
            "hasProfile": True if profile else False
        }), 200
    
    conn.close()
    return jsonify({"message": "Invalid Credentials"}), 401

@app.route('/api/create-profile', methods=['POST'])
def create_profile():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO profiles (username, full_name, bio, location) VALUES (?, ?, ?, ?)", 
                   (data['username'], data['full_name'], data['bio'], data['location']))
    conn.commit()
    conn.close()
    return jsonify({"message": "Profile saved!"}), 200

@app.route('/api/profile/<username>', methods=['GET'])
def get_user_profile(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT full_name, bio, location, profile_pic FROM profiles WHERE username=?", (username,))
    row = cursor.fetchone()
    
    cursor.execute("SELECT filename FROM posts WHERE username=? ORDER BY id DESC", (username,))
    # Dynamically generate the URL based on the current request host
    host = request.host_url.rstrip('/')
    user_posts = [{"url": f"{host}/api/get_file/{r[0]}"} for r in cursor.fetchall()]
    
    conn.close()
    if row:
        return jsonify({
            "full_name": row[0],
            "bio": row[1],
            "location": row[2],
            "profile_pic": f"{host}/api/get_file/{row[3]}" if row[3] else None,
            "posts": user_posts
        }), 200
    return jsonify({"message": "Profile not found"}), 404

@app.route('/api/upload-profile-pic', methods=['POST'])
def upload_profile_pic():
    file = request.files.get('file')
    username = request.form.get('username')
    if file:
        filename = secure_filename(f"avatar_{username}_{file.filename}")
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE profiles SET profile_pic=? WHERE username=?", (filename, username))
        conn.commit()
        conn.close()
        return jsonify({"message": "Profile picture updated!"}), 200
    return jsonify({"message": "Error"}), 400

@app.route('/api/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    username = request.form.get('username')
    caption = request.form.get('caption')
    if file:
        filename = secure_filename(file.filename)
        unique_name = f"{username}_{filename}"
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_name))
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO posts (username, filename, caption) VALUES (?, ?, ?)", (username, unique_name, caption))
        conn.commit()
        conn.close()
        return jsonify({"message": "Posted!"}), 201
    return jsonify({"message": "Error"}), 400

@app.route('/api/posts', methods=['GET'])
def get_posts():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT username, filename, caption FROM posts ORDER BY id DESC")
    host = request.host_url.rstrip('/')
    posts = [{"username": r[0], "url": f"{host}/api/get_file/{r[1]}", "caption": r[2]} for r in cursor.fetchall()]
    conn.close()
    return jsonify(posts), 200

@app.route('/api/notifications/<username>', methods=['GET'])
def get_notifications(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT message, timestamp FROM notifications WHERE username=? ORDER BY id DESC", (username,))
    notifs = [{"message": r[0], "time": r[1]} for r in cursor.fetchall()]
    conn.close()
    return jsonify(notifs), 200

# Required for Vercel
init_db()

if __name__ == '__main__':
    app.run(port=5000, debug=True)