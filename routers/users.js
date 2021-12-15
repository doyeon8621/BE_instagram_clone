const express = require('express');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { Post, User } = require('../models');
const multer = require('multer');
const storage = require('../middlewares/uploade');
const authMiddleware = require('../middlewares/auth-middleware');
const Joi = require('joi');

const postUsersSchema = Joi.object({
    userEmail: Joi.string().email().required(),
    userName: Joi.string().min(2).max(10).required(),
    nickname: Joi.string().min(2).max(10).required(),
    password: Joi.string().min(4).max(12).required(),
});

// 회원가입
router.post('/', async (req, res) => {
    try {
        const {
            userEmail,
            userName,
            nickname,
            password 
        } = await postUsersSchema.validateAsync(req.body);

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
        attributes: [
            'userId',
            'userEmail',
            'userName',
            'nickname',
            'imageUrl_profile',
            'introduce',
            'phoneNumber',
            'createdAt',
        ],
        where: { userId },
    });

    let {
        userEmail,
        userName,
        nickname,
        imageUrl_profile,
        introduce,
        phoneNumber,
        createdAt,
    } = userInfo;

    let tempTime =
        createdAt.getFullYear() +
        '-' +
        ('0' + (createdAt.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + createdAt.getDate()).slice(-2) +
        ' ' +
        ('0' + createdAt.getHours()).slice(-2) +
        ':' +
        ('0' + createdAt.getMinutes()).slice(-2) +
        ':' +
        ('0' + createdAt.getSeconds()).slice(-2);

    res.send({
        // default 200
        userId,
        userEmail,
        userName,
        nickname,
        imageUrl_profile,
        introduce,
        phoneNumber,
        tempTime,
    });
});

//내가 작성한 게시물
router.get('/:userId/posts', authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    try {
        const posts = await Post.findAll({
            where: { userId: userId },
        });
        if (posts.length == 0) {
            res.status(204).send({});
        } else {
            res.status(200).send({ posts });
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

//프로필 이미지 업로드
const upload = multer({ storage: storage }).single('img');
router.post('/:userId', async (req, res) => {
    try {
        upload(req, res, (err) => {
            if (err) {
                return res.status(400);
            } else {
                return res.status(201).send({
                    //성공하면 파일경로, 파일 이름 클라이언트로
                    url: res.req.file.path, //path랑
                    fileName: res.req.file.filename, //filename
                });
            }
        });
    } catch (error) {
        res.status(400).send(error);
    }
});

//마이페이지/내 정보 수정
router.put('/:userId', authMiddleware, async (req, res) => {
    const { nickname, userName, imageUrl_profile, introduce, phoneNumber } =
        req.body;
    const { userId } = res.locals.user;
    try {
        const existNickname = await User.findOne({
            where: { nickname: nickname },
        });
        if (existNickname.length) {
            res.status(400).send({
                message: '사용중인 닉네임 입니다',
            });
        } else if (nickname == '') {
            res.status(400).send({});
        } else if (userName == '') {
            res.status(400).send({});
        }
        await User.update(
            {
                nickname: nickname,
                userName: userName,
                imageUrl_profile: imageUrl_profile,
                introduce: introduce,
                phoneNumber: phoneNumber,
            },
            {
                where: { userId: userId },
            }
        );
        res.status(204).send({});
    } catch (error) {
        res.status(400).send({});
    }
});

module.exports = router;
