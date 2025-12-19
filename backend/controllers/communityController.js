import CommunityPost from "../models/CommunityPost.js";

// Create Post
export const createPost = async (req, res) => {
    try {
        const { content, image } = req.body;
        if (!content) {
            return res.status(400).send({ message: "Content is required" });
        }

        const post = new CommunityPost({
            user: req.user.id || req.user._id,
            content,
            image,
        });

        await post.save();

        const populatedPost = await CommunityPost.findById(post._id).populate(
            "user",
            "name"
        );

        // Emit socket event
        const io = req.app.get("socketio");
        io.emit("newPost", populatedPost);

        res.status(201).send({
            success: true,
            message: "Post created successfully",
            post: populatedPost,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error creating post",
            error,
        });
    }
};

// Get All Posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await CommunityPost.find({})
            .populate("user", "name")
            .populate("comments.user", "name")
            .sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            countTotal: posts.length,
            posts,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error getting posts",
            error,
        });
    }
};

// Like/Unlike Post
export const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await CommunityPost.findById(postId);

        const userId = req.user.id || req.user._id;

        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(
                (id) => id.toString() !== userId.toString()
            );
        } else {
            post.likes.push(userId);
        }

        await post.save();

        const io = req.app.get("socketio");
        io.emit("postUpdate", post);

        res.status(200).send({
            success: true,
            post,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error liking post",
            error,
        });
    }
};

// Add Comment
export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;

        const post = await CommunityPost.findById(postId);
        const comment = {
            user: req.user.id || req.user._id,
            text,
        };

        post.comments.push(comment);
        await post.save();

        const populatedPost = await CommunityPost.findById(postId)
            .populate("user", "name")
            .populate("comments.user", "name");

        const io = req.app.get("socketio");
        io.emit("postUpdate", populatedPost);

        res.status(201).send({
            success: true,
            post: populatedPost,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error adding comment",
            error,
        });
    }
};
