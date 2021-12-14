const express = require('express');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { User } = require('../models/users');
const authMiddleware = require('../middlewares/auth-middleware');

// 회원가입
router.post('/', async (req, res) => {
    const { userEmail, userName, nickname, password } = req.body;

    try {
        const existUsers = await User.findAll({
            where: {
                [Op.or]: [{ nickname }, { email }], // 둘중 하나라도 맞으면 가져오기
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
    res.send({
        // default 200
        user,
    });
});

module.exports = router;
