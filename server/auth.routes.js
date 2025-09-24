const bcrypt = require('bcryptjs');
const jwt = 'jsonwebtoken');
const User = require('../models/user.model');

module.exports = function(app) {
  // 用户注册
  app.post('/api/auth/register', async (req, res) => {
    try {
      const user = new User({
        studentId: req.body.studentId,
        nickname: req.body.nickname,
        password: bcrypt.hashSync(req.body.password, 8)
      });
      await user.save();
      res.send({ message: 'User was registered successfully!' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  // 用户登录
  app.post('/api/auth/login', async (req, res) => {
    try {
      const user = await User.findOne({ studentId: req.body.studentId });
      if (!user) return res.status(404).send({ message: 'User Not found.' });

      const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) {
        return res.status(401).send({ accessToken: null, message: 'Invalid Password!' });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 86400 }); // 24 hours

      res.status(200).send({
        id: user._id,
        studentId: user.studentId,
        nickname: user.nickname,
        accessToken: token
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
};
```---
**`server/routes/product.routes.js`**
```javascript
const { verifyToken } = require('../middleware/authJwt');
const Product = require('../models/product.model');
const User = require('../models/user.model');

module.exports = function(app) {
  // 获取所有商品 (可带分类和搜索)
  app.get('/api/products', async (req, res) => {
    const { category, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' }; // 模糊搜索

    try {
      const products = await Product.find(query).populate('owner', 'nickname').sort({ createdAt: -1 });
      res.status(200).send(products);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  // 获取单个商品详情
  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).populate('owner', 'nickname reputation');
      res.status(200).send(product);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  // 发布新商品 (需要登录)
  app.post('/api/products', [verifyToken], async (req, res) => {
    try {
      const product = new Product({ ...req.body, owner: req.userId });
      await product.save();
      res.status(201).send(product);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  // 添加留言 (需要登录)
  app.post('/api/products/:id/comments', [verifyToken], async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      const product = await Product.findById(req.params.id);
      product.comments.push({
        user: req.userId,
        nickname: user.nickname,
        content: req.body.content
      });
      await product.save();
      res.status(201).send(product.comments);
    } catch (error) {
       res.status(500).send({ message: error.message });
    }
  });
  
  // 收藏/取消收藏商品 (需要登录)
  app.post('/api/products/:id/favorite', [verifyToken], async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      const index = product.favoritedBy.indexOf(req.userId);
      if (index > -1) {
        product.favoritedBy.splice(index, 1); // 取消收藏
      } else {
        product.favoritedBy.push(req.userId); // 添加收藏
      }
      await product.save();
      res.status(200).send({ favoritedCount: product.favoritedBy.length });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  // 评价用户 (需要登录)
  app.post('/api/users/:id/evaluate', [verifyToken], async (req, res) => {
      try {
          const { type } = req.body; // 'good', 'neutral', 'bad'
          const userToEvaluate = await User.findById(req.params.id);
          if (type in userToEvaluate.reputation) {
              userToEvaluate.reputation[type]++;
          }
          await userToEvaluate.save();
          res.status(200).send({ message: 'Evaluation submitted successfully.'});
      } catch (error) {
          res.status(500).send({ message: error.message });
      }
  });
};