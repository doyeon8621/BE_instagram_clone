const Sequelize = require('sequelize');
const User = require('./users');
const Comment = require('./comments');
const Post = require('./posts');
const Like = require('./likes');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = User;
db.Comment = Comment;
db.Post = Post;
db.Like = Like;

User.init(sequelize); //연결 객체 (sequelize)를 이용해서 연결!!
Post.init(sequelize);
Comment.init(sequelize);
Like.init(sequelize);

User.associate(db);
Comment.associate(db);
Post.associate(db);
Like.associate(db);

module.exports = db;
