const express = require('express');
//const jwt = require('jsonwebtoken');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const {User} = require('../models/users');
const {Post} = require('../models/posts');
const multer = require('multer');
const storage = require('../middlewares/uploade');

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
    const {userId} = res.locals.user; 
    try{
        const posts = await Post.findAll({
            where:{userId :userId}
        });
        if(posts.length == 0){
            res.status(204)
        }else{
            res.status(200).send({posts})
        }
    }catch(error){
        res.status(400).send(error)
    }
});
//프로필 이미지 업로드
const upload = multer({storage:storage}).single("img");
router.post('/:userId', async(req, res)=>{
    try{
        upload(req, res, err =>{
            if(err){
                return res.status(400)
            }else{
                return res.status(201).send({     //성공하면 파일경로, 파일 이름 클라이언트로
                    url:res.req.file.path,  //path랑 
                    fileName: res.req.file.filename //filename
                })
            }
        })
    }catch(error){
        res.status(400).send(error);
    }
});
//마이페이지/내 정보 수정
router.put('/:userId', async(req, res)=>{
    const { nickname, userName, imageUrl_profile, introduce, phoneNumber } =req.body;
    const {userId} = res.locals.user; 
    try{
        const existNickname = await User.find({where:{nickname :nickname}});
        if(existNickname.length){
            res.status(400).send({
                message:'사용중인 닉네임 입니다'
            })
        }else if(nickname==""){
            res.status(400)
        }
        await User.update({
            nickname:nickname, 
            userName:userName,
            imageUrl_profile:imageUrl_profile,
            introduce:introduce,
            phoneNumber:phoneNumber
        },{
            where:{userId:userId}
        })
        res.status(204);
    }catch(error){
        res.status(400).send(error)
    }
})

module.exports = router;