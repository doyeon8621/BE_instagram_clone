const express = require("express");
const {Op} = require("sequelize");
const Posts = require("../models/posts");
const Users = require("../models/users");
const Likes = require("../models/likes");
const verify = require('../middlewares/auth-middleware');
const router = express.Router();

//전체 게시글 조회
router.get("/", verify, async(req, res, next) => {
    let posts =[];
    let postsInfos = {};
    try{
        //로그인이 되지 않았을 경우 (거의 미들웨어에서 거름)
        const { userId } = res.locals.user;
        if (!userId) {
            res.status(401).send({});
            return;
        }
        //최신글 순으로 정렬되었다.
        const posts_temp = await Posts.findAll({
            include: [
                {model:Users,
                attributes: ['nickname']}
            ],
            order:[['createdAt','DESC']]});

    for(let i =0;i<posts_temp.length; i++){
        const {postId, content, User, imageUrl, createdAt} = posts_temp[i];
        //console.log(`이것이 ${postId} 글의 기본 구조다: `+postId, content, User['nickname'], imageUrl, createdAt)
        const likes = await Likes.findAll({ where:{ postId: postId}});
        
        let createdAt_temp = new Date(createdAt).toISOString().replace("T"," ").slice(0,19);
        postsInfos['postId'] = postId;
        postsInfos['content'] = content;
        postsInfos['likeCount'] = likes.length;
        postsInfos['nickname'] = User['nickname'];
        postsInfos['imageUrl'] = imageUrl;
        postsInfos['createdAt'] = createdAt_temp;
        
        posts.push(postsInfos);
        //배열에 마지막 값만 들어가지 않도록 초기화 
        postsInfos = {};
    }
    res.json({posts:posts});

    }catch(err){
        res.status(400).send({});
        next(err);
    }
});

//게시글 상세페이지 조회
router.get("/:postId", verify, async(req,res) => {
    try{
        const {postId} = req.params;
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
            attributes: ['nickname']}
            ],
        where:{ postId: postId}
        });

        //요청한 리소스를 찾을 수 없다
        if(!post_temp){
            res.status(404).send({});
            return;
        }
        const {content, User, imageUrl, createdAt} = post_temp;

        let createdAt_temp = new Date(createdAt).toISOString().replace("T"," ").slice(0,19);

            posts['content'] = content;
            posts['nickname'] = User['nickname'];
            posts['imageUrl'] =imageUrl;
            posts['createdAt'] = createdAt_temp;

            res.send(posts);
        
    }catch(err){
        res.status(400).send({});
    }
});

//게시글 삭제
router.delete('/:postId', verify, async (req, res) =>{

    try{
    const {postId} = req.params;
    const {userId} = res.locals.user;
    //로그인이 되지 않았을 경우 (거의 미들웨어에서 거름)
    if (!userId) {
        res.status(401).send({});
        return;
    }
    const postOne = await Posts.findByPk(postId);
    //글이 없으면 없는대로 지운다. 
    if(postOne){
        const {userID} = postOne;
        //로그인했지만 권한 없음 (작성자 본인 아님)
        if(userId !== userID){
            res.status(403).send({});
            return;
        }
            await postOne.destroy();
    }
    res.status(204).send({});

    }catch(err){
        res.status(400).send({});
        console.log(err)
    }
});

//좋아요/취소
router.post("/:postId/like", verify, async(req, res) => {

    try{
        const { userId } = res.locals.user;
        const {postId} = req.params;
        //로그인이 되지 않았을 경우 (거의 미들웨어에서 거름)
        if (!userId) {
            res.status(401).send({});
            return;
        }
        const postOne = await Likes.findOne({
            where:{ userID: userId, postID: postId},
        });

        if(postOne){
            await postOne.destroy();
            res.status(204).send({});
        }else{
            await Likes.create({
                userID: userId, postID: postId
            })
            res.status(201).send({});
        }
    }catch(err){
        res.status(400).send({});
    }
});

module.exports = router;