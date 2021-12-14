const express = require('express');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/users');
// const {User} = require('../models/users');
const {Post} = require('../models/posts');
const authMiddleware = require('../middlewares/auth-middleware');

// 회원가입
router.post('/', async (req, res) => {
    const { userEmail, userName, nickname, password } = req.body;

    try {
        const existUsers = await User.findAll({
            where: {
                [Op.or]: [{ userEmail }, { nickname }], // 둘중 하나라도 맞으면 가져오기
            },
        });
        if (existUsers.length) {
            res.status(400).send({
                errorMessage: '이미 가입된 이메일 또는 닉네임이 있습니다.',
            });
            return;
        }
        await User.create({ userEmail, userName, nickname, password });
        res.status(201).send({});
    } catch (err) {
        res.status(401).send({
            errorMessage: 'Error : ' + err,
        });
    }
});

//로그인
router.post('/login', async (req, res) => {
    const { userEmail, password } = req.body;
    const user = await User.findOne({ where: { userEmail, password } });

    try {
        if (!user) {
            res.status(400).send({
                errorMessage: '이메일 또는 패스워드가 잘못됐습니다.',
            });
            return;
        }
        const token = jwt.sign({ userId: user.userId }, 'my-secret-key');
        res.send({ token });
    } catch (err) {
        res.status(401).send({
            errorMessage: 'Error : ' + err,
        });
    }
});

// 사용자정보
router.get('/me', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const userId = user.userId;
    let userInfo = await User.findOne({ 
        attributes: [ 'userId', 'userEmail', 'userName', 'nickname', 'imageUrl_profile', 'introduce', 'phoneNumber', 'createdAt'],
        where: { userId } 
    });

    // 유저 가입일
    let temp = String(userInfo.createdAt);
    // let dateComponents = temp.split('T');
    // let datePieces = dateComponents[0].split("-");
    // let timePieces = dateComponents[1].split(":");
    // userInfo.createdAt = new Date(datePieces[2], (datePieces[1] - 1), datePieces[0],
    //                      timePieces[0], timePieces[1], timePieces[2])
    console.log(userInfo.createdAt);
    res.send({
        // default 200
        userInfo,
    });
});

module.exports = router;
// const authMiddleware = require('../middlewares/auth-middleware');


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
