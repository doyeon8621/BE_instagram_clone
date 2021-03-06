const express = require('express');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { Post, User, Like } = require('../models');
const upload = require('../middlewares/uploade');
const authMiddleware = require('../middlewares/auth-middleware');
const Joi = require('joi');

const postUsersSchema = Joi.object({
    userEmail: Joi.string().email().required(),
    userName: Joi.string().min(2).max(10).required(),
    nickname: Joi.string().min(2).max(10).required(),
    password: Joi.string().min(4).max(12).required(),
});

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

// 회원가입
router.post('/', async (req, res) => {
    try {
        const { userEmail, userName, nickname, password } =
            await postUsersSchema.validateAsync(req.body);

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
        res.status(400).send({
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
        res.status(400).send({
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

router.post('/:userId', upload.single('img'), (req, res) => {
    const { filename, path, originalname } = req.file;
    try {
        res.status(201).send({ url: path, fileName: filename });
    } catch (err) {
        res.status(400).send(err);
    }
});

// 마이페이지내 정보 수정
router.put('/:userId', authMiddleware, async (req, res) => {
    const { nickname, userName, imageUrl_profile, introduce, phoneNumber } =
        req.body;
    const { userId } = res.locals.user;
    try {
        const existNickname = await User.findOne({
            attributes: ['nickname'],
            where: { userId: userId },
        });
        console.log(existNickname.nickname);
        if (existNickname.nickname !== nickname) {
            //0이면 false로 실행안됨
            const newNickname = await User.findAll({
                attributes: ['nickname'],
                where: { nickname: nickname },
            });
            if (newNickname.length) {
                res.status(400).send({
                    message: '사용중인 닉네임 입니다',
                });
                return;
            }
        }
        if (nickname == '') {
            res.status(400).send({});
            return;
        }
        if (userName == '') {
            res.status(400).send({});
            return;
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
        res.status(400).send({ error });
    }
});

// 다른 유저 페이지
router.get('/posts/:userId', authMiddleware, async (req, res) => {
    const { userId } = req.params;
    let users = {};
    let posts = [];
    let postsInfos = {};
    try {
        const users_temp = await User.findOne({
            attributes: [
                'userId',
                'userEmail',
                'userName',
                'nickname',
                'imageUrl_profile',
                'introduce',
                'phoneNumber',
            ],
            where: { userId: userId },
        });

        const { userEmail, userName, nickname, imageUrl_profile, introduce, phoneNumber } = users_temp;
        users['userId'] = userId;
        users['userEmail'] = userEmail;
        users['userName'] = userName;
        users['nickname'] = nickname;
        users['imageUrl_profile'] = 'http://13.125.45.147/'+imageUrl_profile;
        users['introduce'] = introduce;
        users['phoneNumber'] = phoneNumber;

        const posts_temp = await Post.findAll({
            order: [['postId', 'DESC']], // 내림차순으로 정렬
            where: { userID: userId },
        });
        for (let i = 0; i < posts_temp.length; i++) {
            const { postId, content, imageUrl, createdAt } = posts_temp[i];

            const likes = await Like.findAll({ where: { postID: postId } });

            let createdAt_temp = date_formmatter(new Date(createdAt));
            postsInfos['postId'] = postId;
            postsInfos['content'] = content;
            postsInfos['likeCount'] = likes.length;
            postsInfos['imageUrl'] = 'http://13.125.45.147/'+imageUrl;
            postsInfos['createdAt'] = createdAt_temp;

            posts.push(postsInfos);

            postsInfos = {};
        }

        console.log(users)
        console.log(posts)
        res.status(200).send({
            users,
            posts,
        });
    } catch (err) {
        res.status(400).send({
            errorMessage: 'Error : ' + err,
        });
    }
});

module.exports = router;
