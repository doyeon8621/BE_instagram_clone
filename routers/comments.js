const express = require('express');
const router = express.Router();
const Comments = require('../models/comments');
const authMiddleware = require('../middlewares/auth-middleware');

//날짜 가공용
function date_formmatter(format) {
    let year = format.getFullYear();
    let month = format.getMonth() + 1;
    let date = format.getDate();
    let hour = format.getHours();
    let min = format.getMinutes();
    let sec = format.getSeconds();

    if (month < 10) month = '0' + month;
    if (date < 10) date = '0' + date;
    if (hour < 10) hour = '0' + hour;
    if (min < 10) min = '0' + min;
    if (sec < 10) sec = '0' + sec;

    return `${year}-${month}-${date} ${hour}:${min}:${sec}`;
}

// 댓글 목록 조회
router.get('/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    let comments =[];
    let commentsInfos = {};
    try {
        const tempComments = await Comments.findAll({
            order: [['commentId', 'DESC']], // 내림차순으로 정렬
            where: { postId },
        });
        for(let i =0;i<tempComments.length; i++){
            const {postID, commentId, content, userID, createdAt} = tempComments[i];
            
            let createdAt_temp = date_formmatter(new Date(createdAt));
            commentsInfos['postID'] = postID;
            commentsInfos['commentId'] = commentId;
            commentsInfos['content'] = content;
            commentsInfos['userID'] = userID;
            commentsInfos['createdAt'] = createdAt_temp;
            
            comments.push(commentsInfos);
            commentsInfos = {};
        }
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
        await Comments.create({ postID:postId, userID:userId, content:content });
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
                userID:userId,
                commentId:commentId,
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
