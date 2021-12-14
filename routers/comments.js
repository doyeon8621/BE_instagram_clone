const express = require('express');
const router = express.Router();
const Comments = require('../models/comments');
const authMiddleware = require('../middlewares/auth-middleware');

// 댓글 목록 조회
router.get('/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    try {
        const comments = await Comments.findAll({
            order: [['postId', 'DESC']], // 내림차순으로 정렬
            where: { postId },
        });

        // let { commentId, content, userId, createdAt } = comments;

        // let tempTime =
        //     createdAt.getFullYear() +
        //     '-' +
        //     ('0' + (createdAt.getMonth() + 1)).slice(-2) +
        //     '-' +
        //     ('0' + createdAt.getDate()).slice(-2) +
        //     ' ' +
        //     ('0' + createdAt.getHours()).slice(-2) +
        //     ':' +
        //     ('0' + createdAt.getMinutes()).slice(-2) +
        //     ':' +
        //     ('0' + createdAt.getSeconds()).slice(-2);

        res.send({ comments });
    } catch (err) {
        res.status(400).send({
            errorMessage: 'Error : ' + err,
        });
    }
});

// 댓글 작성
router.post('/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const { userId } = res.locals.user;
    try {
        await Comments.create({ postId, userId, content });
        res.status(201).send({});
    } catch (err) {
        res.status(400).send({
            errorMessage: 'Error : ' + err,
        });
    }
});

// 댓글 삭제
router.delete('/:commentId', authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { commentId } = req.params;
    try {
        const existsComment = await Comments.findOne({
            where: {
                userId,
                commentId,
            },
        });

        if (existsComment) {
            // 있든 말든 삭제.
            await existsComment.destroy();
        }

        res.send({});
    } catch (err) {
        res.status(400).send({
            errorMessage: 'Error : ' + err,
        });
    }
});

module.exports = router;
