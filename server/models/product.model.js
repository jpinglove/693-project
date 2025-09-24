const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  
  // imageUrl 不再是必须的，但要有 trim: true 来去除前后空格
  imageUrl: { type: String, trim: true },
  // 新增 imageBase64 字段，用于存储图片的 Base64 编码
  imageBase64: { type: String },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    nickname: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  favoritedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);

