const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true }, // 简化处理，只存一张图片URL
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // 留言功能
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    nickname: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  // 收藏功能
  favoritedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);