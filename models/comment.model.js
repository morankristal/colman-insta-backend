const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post: {
        type: Schema.Types.ObjectId,
        required: true
    },
    content:
        { type: String,
            required: true
        },
    sender:
        { type: String,
            required: true
        },
    createdAt:
        { type: Date,
            default: Date.now
        },
});

module.exports = mongoose.model('Comment', commentSchema);
