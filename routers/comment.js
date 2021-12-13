const express = require('express');
const router = express.Router();
const url = require('url');
const Comments = require('../schemas/comments');
const authMiddleware = require('../middlewares/auth-middleware');

// 댓글 목록 조회
router.get('/comments/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    let comments = await Comments.find({ postId }).sort('commentId').lean();
    res.json({ comments });
  } catch (err) {
    console.error(err);
  }
});

// 댓글 작성
router.post('/comments/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const { userId, userName } = res.locals.user;
  const recentComment = await Comments.find().sort('-commentId').limit(1);
  let commentId = 1;
  if (recentComment.length != 0) {
    commentId = recentComment[0]['commentId'] + 1;
  }

  await Comments.create({ postId, userId, userName, commentId, content });
  res.send({ result: 'success' });
});

// 댓글 수정 시 해당 댓글 하나 가져오기
router.get('/comments/modify/:commentId', authMiddleware, async (req, res) => {
  const { commentId } = req.params;
  comment = await Comments.findOne({ commentId });
  res.json({ comment });
});

// 댓글 수정
router.put('/comments/:commentId', authMiddleware, async (req, res) => {
  const { userId, userName } = res.locals.user;
  const { commentId } = req.params;
  const { content } = req.body;
  const existsComment = await Comments.findOne({ userId, commentId });
  const { postId } = existsComment.postId;
  await Comments.updateOne(
    { commentId },
    { $set: { postId, userId, userName, commentId, content } }
  );
  res.send({ result: 'success' });
});

// 댓글 삭제
router.delete('/comments/:commentId', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { commentId } = req.params;
  await Comments.deleteOne({ userId, commentId });
  res.send({ result: 'success' });
});

module.exports = router;
