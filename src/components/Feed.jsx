import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

function Feed({ username }) {
  const [posts, setPosts] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [likes, setLikes] = useState({});

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`);
      const data = await res.json();
      setPosts(data.reverse());
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", username);
    formData.append("caption", caption);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setFile(null);
        setPreview(null);
        setCaption("");
        fetchPosts();
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const toggleLike = (id) => {
    setLikes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="feed-wrapper">
      <style>{`
        .feed-wrapper {
          max-width: 480px;
          margin: auto;
          padding: 12px;
        }

        @media (min-width: 768px) {
          .feed-wrapper {
            max-width: 520px;
          }
        }

        .upload-card {
          background: #fff;
          padding: 16px;
          border-radius: 16px;
          margin-bottom: 20px;
          border: 1px solid #efefef;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);
          padding: 2px;
          margin-right: 10px;
        }

        .avatar-inner {
          background: white;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .post-card {
          background: #fff;
          border: 1px solid #efefef;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .post-image {
          width: 100%;
          max-height: 520px;
          object-fit: cover;
        }

        .actions span {
          cursor: pointer;
          font-size: 22px;
        }
      `}</style>

      {/* Upload Section */}
      <div className="upload-card">
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <div className="avatar">
            <div className="avatar-inner">👤</div>
          </div>
          <strong>{username}</strong>
        </div>

        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{
              width: "100%",
              maxHeight: "200px",
              objectFit: "cover",
              borderRadius: "12px",
              marginBottom: "10px",
            }}
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ marginBottom: 8 }}
        />

        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginBottom: "10px",
            background: "#fafafa",
          }}
        />

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: uploading ? "#b2dffc" : "#0095f6",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          {uploading ? "Posting..." : "Post"}
        </button>
      </div>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>
          No posts yet 👀
        </p>
      ) : (
        posts.map((post, index) => (
          <div className="post-card" key={index}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", padding: 12 }}>
              <div className="avatar">
                <div className="avatar-inner">👤</div>
              </div>
              <strong>{post.username}</strong>
            </div>

            {/* Image */}
            <img
              src={post.url}
              alt="post"
              className="post-image"
              onDoubleClick={() => toggleLike(index)}
            />

            {/* Actions */}
            <div
              className="actions"
              style={{ padding: "10px 12px", display: "flex", gap: 16 }}
            >
              <span onClick={() => toggleLike(index)}>
                {likes[index] ? "❤️" : "🤍"}
              </span>
              <span>💬</span>
              <span>✈️</span>
            </div>

            {/* Like text */}
            {likes[index] && (
              <div style={{ padding: "0 12px", fontSize: "13px", fontWeight: "600" }}>
                Liked by you
              </div>
            )}

            {/* Caption */}
            <div style={{ padding: "6px 12px 14px" }}>
              <strong>{post.username}</strong> {post.caption}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Feed;
