const express = require('express');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const Posts = require('../models/posts');
const Users = require('../models/users');
const Likes = require('../models/likes');
const Comment = require('../models/comments');
const verify = require('../middlewares/auth-middleware');
const router = express.Router();

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
//전체 게시글 조회

router.get('/', verify, async (req, res, next) => {
    let posts = [];
    let postsInfos = {};
    try {
        //로그인이 되지 않았을 경우 (거의 미들웨어에서 거름)
        const { userId } = res.locals.user;
        if (!userId) {
            res.status(401).send();
            return;
        }
        //최신글 순으로 정렬되었다.
        const posts_temp = await Posts.findAll({
            include: [
                {model:Users,
                attributes: ['nickname','imageUrl_profile']}
            ],
            order:[['postId','DESC']]});

    for(let i =0;i<posts_temp.length; i++){
        const {postId, content, User, imageUrl, createdAt, userID} = posts_temp[i];
        //console.log(`이것이 ${postId} 글의 기본 구조다: `+postId, content, User['nickname'], imageUrl, createdAt)
        const likes = await Likes.findAll({ where:{ postID: postId}});
        //로그인한 유저가 좋아요한 글인지 표시
        const isMyLike = await Likes.findOne({where:{postID: postId, userID:userId}});
        let myLike = false;
        if(isMyLike){
            myLike = true;
        }
        //게시물 댓글갯수
        const comment = await Comment.findAll({where:{postID:postId}});
        
        let createdAt_temp = date_formmatter(new Date(createdAt));
        postsInfos['postId'] = postId;
        postsInfos['userId'] = userID;
        postsInfos['content'] = content;
        postsInfos['commentCount']= comment.length;
        postsInfos['likeCount'] = likes.length;
        postsInfos['nickname'] = User['nickname'];
        postsInfos['imageUrl'] = imageUrl;
        postsInfos['createdAt'] = createdAt_temp;
        postsInfos['imageUrl_profile'] = User['imageUrl_profile'];
        postsInfos['myLike'] = myLike;

        posts.push(postsInfos);
        //배열에 마지막 값만 들어가지 않도록 초기화 
        postsInfos = {};
    }
    
    res.json({posts:posts});
    } catch (err) {
        res.status(400).send(err);
        next(err);
    }
});

//게시글 상세페이지 조회
router.get('/:postId', verify, async (req, res) => {
    try {
        const { postId } = req.params;
        let posts = {};

        //로그인이 되지 않았을 경우 (거의 미들웨어에서 거름)
        const { userId } = res.locals.user;
        if (!userId) {
            res.status(401).send({});
            return;
        }
        const post_temp = await Posts.findOne({ 
            include: [
            {model:Users,
            attributes: ['nickname','imageUrl_profile']}
            ],
        where:{ postId: postId}
        });

        //요청한 리소스를 찾을 수 없다
        if (!post_temp) {
            res.status(404).send({});
            return;
        }
        const {content, User, imageUrl, createdAt, userID} = post_temp;
        const likes = await Likes.findAll({ where:{ postID: postId}});
        //로그인한 유저가 좋아요한 글인지 표시
        const isMyLike = await Likes.findOne({where:{postID: postId, userID:userId}});
        let myLike = false;
        if(isMyLike){
            myLike = true;
        }
        //게시물 댓글갯수
        const comment = await Comment.findAll({where:{postID:postId}});

        let createdAt_temp = date_formmatter(new Date(createdAt));
            posts['postId'] = postId * 1;
            posts['userId'] = userID;
            posts['content'] = content;
            posts['commentCount']= comment.length;
            posts['likeCount'] = likes.length;
            posts['nickname'] = User['nickname'];
            posts['imageUrl'] =imageUrl;
            posts['createdAt'] = createdAt_temp;
            posts['imageUrl_profile'] = User['imageUrl_profile'];
            posts['myLike'] = myLike;
            res.send(posts);
        
    }catch(err){
        res.status(400).send(err);
    }
});

//게시글 삭제
router.delete('/:postId', verify, async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = res.locals.user;
        //로그인이 되지 않았을 경우 (거의 미들웨어에서 거름)
        if (!userId) {
            res.status(401).send();
            return;
        }
        const postOne = await Posts.findByPk(postId);
        //글이 없으면 없는대로 지운다.
        if (postOne) {
            const { userID } = postOne;
            //로그인했지만 권한 없음 (작성자 본인 아님)
            if (userId !== userID) {
                res.status(403).send();
                return;
            }
            await postOne.destroy();
        }
        res.status(204).send({});
    } catch (err) {
        res.status(400).send(err);
        console.log(err);
    }
});

//좋아요/취소
router.post('/:postId/like', verify, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const { postId } = req.params;
        //로그인이 되지 않았을 경우 (거의 미들웨어에서 거름)
        if (!userId) {
            res.status(401).send();
            return;
        }
        const postOne = await Posts.findOne({
            where: { postId: postId },
        });
        //해당 게시글 없음
        if (!postOne) {
            res.status(404).send();
            return;
        }
        const likeOne = await Likes.findOne({
            where: { userID: userId, postID: postId },
        });

        if (likeOne) {
            //좋아요 취소
            await likeOne.destroy();
            res.status(204).send({});
        } else {
            //좋아요
            await Likes.create({
                userID: userId,
                postID: postId,
            });
            res.status(201).send({});
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

//게시글 작성
router.post('/', verify, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        //로그인이 되지 않았을 경우 (거의 미들웨어에서 거름)
        if (!userId) {
            res.status(401).send({});
            return;
        } else {
            const { imageUrl, content } = req.body;
            const today = date_formmatter(new Date());
            //이미지 없음
            if (!imageUrl) {
                res.status(400).send();
                return;
            }
            await Posts.create({
                imageUrl: imageUrl,
                content: content,
                userID: userId,
                createdAt: today,
            });
            res.status(201).send({});
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

//게시글 이미지업로드
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/posts');
        },
        filename: function (req, file, cb) {
            cb(null, new Date().valueOf() + '_' + file.originalname);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/images', upload.single('img'), (req, res) => {
    try {
        const { filename, path, originalname } = req.file;
        //업로드 파일 확장자 허용 범위
        let ext = originalname.slice(-4);
        if (
            ext !== '.gif' &&
            ext !== '.png' &&
            ext !== '.jpg' &&
            ext !== 'jpeg'
        ) {
            res.status(400).send({ error: '파일 형식을 확인하세요.' });
            return;
        }
        res.status(201).send({ url: path, fileName: filename });
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
