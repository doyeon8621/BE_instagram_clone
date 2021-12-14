const express = require('express');
//const jwt = require('jsonwebtoken');
const router = express.Router();
// const authMiddleware = require('../middlewares/auth-middleware');
const {User} = require('../models/users');
const {Post} = require('../models/posts');

//마이페이지 정보조회 & 마이페이지 수정페이지 최초 조회 같이사용
// router.get('/:userId', async(req, res)=>{
//     const {userId} = req.params;
//     try{
//         const user =await User.find({
//             attribute:['userEmail', 'userName' , 'nickname', 'imageUrl_profile', 'introduce', 'phoneNumber'],
//             where :{userId :userId}
//         });
//         res.send({user})
//     }catch(error){
//         res.statusCode(400)
//     }
// });
//내가 작성한 게시물 
router.get('/:userId/posts', async(req, res)=>{
    const {userId} = req.params;
    try{
        const posts = await Post.findAll({
            where:{userId :userId}
        });
        if(posts.length == 0){
            res.statusCode(204)
        }else{
            res.statusCode(200).send({posts})
        }
    }catch(error){
        res.statusCode(400).send(error)
    }
});
//프로필 이미지 업로드
router.post('/images', async(req, res)=>{
    try{

    }catch(error){
        
    }
})

module.exports = router;