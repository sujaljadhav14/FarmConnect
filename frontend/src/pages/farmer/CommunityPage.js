import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import Layout from "../../components/layout/Layout";
import FarmerMenu from "../../Dashboards/FamerMenu";
import { io } from "socket.io-client";
import {
    HandThumbsUp,
    HandThumbsUpFill,
    ChatLeftText,
    Send,
    PlusCircle,
    PersonCircle,
} from "react-bootstrap-icons";

const CommunityPage = () => {
    const { auth } = useAuth();
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [commentText, setCommentText] = useState({});
    const socket = useRef();

    // Load posts
    const getPosts = async () => {
        try {
            const { data } = await axios.get("/api/community/posts", {
                headers: { Authorization: `Bearer ${auth?.token}` },
            });
            if (data?.success) {
                setPosts(data.posts);
            }
        } catch (error) {
            console.log(error);
            toast.error("Error fetching posts");
        }
    };

    useEffect(() => {
        getPosts();

        // Socket implementation
        socket.current = io(process.env.REACT_APP_API);

        socket.current.on("newPost", (newPost) => {
            setPosts((prev) => [newPost, ...prev]);
        });

        socket.current.on("postUpdate", (updatedPost) => {
            setPosts((prev) =>
                prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
            );
        });

        return () => {
            socket.current.disconnect();
        };
        // eslint-disable-next-line
    }, [auth?.token]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            setLoading(true);
            const { data } = await axios.post(
                "/api/community/posts",
                { content },
                { headers: { Authorization: `Bearer ${auth?.token}` } }
            );
            if (data?.success) {
                setContent("");
                toast.success("Post created");
            }
        } catch (error) {
            console.log(error);
            toast.error("Error creating post");
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            await axios.put(
                `/api/community/posts/${postId}/like`,
                {},
                { headers: { Authorization: `Bearer ${auth?.token}` } }
            );
        } catch (error) {
            console.log(error);
        }
    };

    const handleComment = async (e, postId) => {
        e.preventDefault();
        const text = commentText[postId];
        if (!text || !text.trim()) return;

        try {
            const { data } = await axios.post(
                `/api/community/posts/${postId}/comment`,
                { text },
                { headers: { Authorization: `Bearer ${auth?.token}` } }
            );
            if (data?.success) {
                setCommentText((prev) => ({ ...prev, [postId]: "" }));
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Layout title="Farmer Community">
            <div className="container-fluid mt-4">
                <div className="row">
                    <div className="col-md-3">
                        <FarmerMenu />
                    </div>
                    <div className="col-md-9">
                        <h2 className="text-success mb-4">🚜 Farmer Community</h2>

                        {/* Create Post Form */}
                        <div className="card shadow-sm rounded-4 border-0 mb-4">
                            <div className="card-body">
                                <form onSubmit={handleCreatePost}>
                                    <div className="d-flex align-items-start mb-3">
                                        <PersonCircle size={40} className="text-muted me-3" />
                                        <textarea
                                            className="form-control border-0 bg-light rounded-4"
                                            placeholder="Share your agricultural tips, news, or ask for advice..."
                                            rows="3"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            style={{ resize: "none" }}
                                        ></textarea>
                                    </div>
                                    <div className="text-end">
                                        <button
                                            type="submit"
                                            disabled={loading || !content.trim()}
                                            className="btn btn-success rounded-pill px-4"
                                        >
                                            {loading ? "Posting..." : "Post Now"} <PlusCircle className="ms-1" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Posts List */}
                        <div className="community-feed">
                            {posts.map((post) => (
                                <div key={post._id} className="card shadow-sm rounded-4 border-0 mb-4 animate-fadeIn">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                                {post?.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ms-3">
                                                <h6 className="mb-0 fw-bold">{post?.user?.name}</h6>
                                                <small className="text-muted">
                                                    {new Date(post.createdAt).toLocaleString()}
                                                </small>
                                            </div>
                                        </div>
                                        <p className="card-text mb-4" style={{ whiteSpace: "pre-wrap" }}>
                                            {post.content}
                                        </p>

                                        <div className="d-flex border-top border-bottom py-2 mb-3">
                                            <button
                                                className="btn btn-link text-decoration-none text-muted d-flex align-items-center me-4"
                                                onClick={() => handleLike(post._id)}
                                            >
                                                {post.likes.includes(auth?.user?.id || auth?.user?._id) ? (
                                                    <HandThumbsUpFill className="text-primary me-2" size={20} />
                                                ) : (
                                                    <HandThumbsUp className="me-2" size={20} />
                                                )}
                                                <span>{post.likes.length} Likes</span>
                                            </button>
                                            <div className="btn btn-link text-decoration-none text-muted d-flex align-items-center">
                                                <ChatLeftText className="me-2" size={20} />
                                                <span>{post.comments.length} Comments</span>
                                            </div>
                                        </div>

                                        {/* Comments List */}
                                        <div className="comments-section mb-3">
                                            {post.comments.map((comment, idx) => (
                                                <div key={idx} className="bg-light rounded-4 p-2 mb-2">
                                                    <div className="d-flex">
                                                        <small className="fw-bold text-success me-2">{comment?.user?.name}</small>
                                                        <small className="text-muted">{new Date(comment.createdAt).toLocaleTimeString()}</small>
                                                    </div>
                                                    <p className="mb-0 small">{comment.text}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Comment Form */}
                                        <form onSubmit={(e) => handleComment(e, post._id)} className="d-flex">
                                            <input
                                                type="text"
                                                className="form-control rounded-pill bg-light border-0 small"
                                                placeholder="Write a comment..."
                                                value={commentText[post._id] || ""}
                                                onChange={(e) =>
                                                    setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))
                                                }
                                            />
                                            <button type="submit" className="btn btn-link text-success p-0 ms-2">
                                                <Send size={20} />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <style>
                {`
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
            </style>
        </Layout>
    );
};

export default CommunityPage;
