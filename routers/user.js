const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../schemas/users');
const Join = require('../schemas/join');
const Post = require('../schemas/posts');
const Comment = require('../schemas/comments');
const authMiddleware = require('../middlewares/auth-middleware');

// 회원가입
router.post('/register', async (req, res) => {
  const { userEmail, userName, password, passwordConfirm } = req.body;
  if (password !== passwordConfirm) {
    res.status(400).send({
      result: 'passwordError',
      errorMessage: '패스워드가 패스워드 확인란과 일치하지 않습니다.',
    });
    return;
  }
  const existEmail = await User.find({ userEmail });

  if (existEmail.length) {
    res.status(400).send({
      result: 'existError',
      errorMessage: '이미 가입된 아이디가 있습니다.',
    });
    return;
  }
  const existName = await User.find({ userName });
  if (existName.length) {
    res.status(400).send({
      result: 'usernameExist',
      errorMessage: '중복된 닉네임이 있습니다.',
    });
    return;
  }
  let userId = 1;
  const recentUser = await User.find().sort('-userId').limit(1);

  if (recentUser.length != 0) {
    userId = recentUser[0]['userId'] + 1;
  }
  const user = new User({ userId, userEmail, userName, password });
  await user.save();
  res.status(201).send({
    result: 'success',
  });
});

//로그인
router.post('/login', async (req, res) => {
  const { userEmail, password } = req.body;
  const user = await User.findOne({ userEmail, password });
  if (user == null) {
    res.status(401).send({
      result: 'notExist',
      errorMessage: '아이디와 비밀번호를 확인하세요.',
    });
    return;
  }
  const token = jwt.sign(
    { userId: user.userId, userEmail: user.userEmail, userName: user.userName },
    'my-secret-key'
  );
  res.send({
    result: 'success',
    token,
  });
});

//마이페이지 조회 API
router.get('/mypage/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOne({ userId });
  const userEmail = user.userEmail;
  const userName = user.userName;

  res.send({
    userEmail: userEmail,
    userName: userName,
  });
});
// 내정보 수정 get
router.get('/mypage/modify/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOne({ userId });
  const userEmail = user.userEmail;
  const userName = user.userName;
  res.send({
    userEmail: userEmail,
    userName: userName,
  });
});

// 내정보 수정 API
router.patch('/mypage/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOne({ userId });
  const { userName, password, passwordConfirm } = req.body;
  const userEmail = user.userEmail;
  const myNickName = user.userName
  if (password !== passwordConfirm) {
    res.status(400).send({
      errorMessage: '패스워드가 패스워드 확인란과 일치하지 않습니다.',
    });
    return;
  }
  const existName = await User.find({ userName });
  if (myNickName == userName){
    await User.updateOne(
        { userId: userId },
        { $set: { userName: userName, password: password } }
      ).exec();
      await Post.updateMany({ userId: userId }, { $set: { userName: userName } });
      await Comment.updateMany(
        { userId: userId },
        { $set: { userName: userName } }
      );
      const userFix = await User.findOne({ userId });
      const token = jwt.sign(
        { userId: userFix.userId, userEmail: userFix.userEmail, userName: userFix.userName },
        'my-secret-key'
      );
    
      res.send({
        result: 'success',
        token,
      });
  }
  if (existName.length) {
    res.status(401).send({
      result: 'nicknameExist',
      errorMessage: '중복된 닉네임 입니다.',
    });
    return;
  }
  await User.updateOne(
    { userId: userId },
    { $set: { userName: userName, password: password } }
  ).exec();
  await Post.updateMany({ userId: userId }, { $set: { userName: userName } });
  await Comment.updateMany(
    { userId: userId },
    { $set: { userName: userName } }
  );

  const userFix = await User.findOne({ userId });
  const token = jwt.sign(
    { userId: userFix.userId, userEmail: userFix.userEmail, userName: userFix.userName },
    'my-secret-key'
  );

  res.send({
    result: 'success',
    token,
  });
});
// 내가 작성한 모임 API
router.get('/mypage/posts/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const mypost = await Post.find({ userId }).exec();

  res.send({
    mypost: mypost,
  });
});

// 내가 쓴 글 삭제
router.delete(
  '/mypage/posts/:userId/:postId',
  authMiddleware,
  async (req, res) => {
    const { userId, postId } = req.params;

    await Post.deleteOne({ userId, postId });
    await Join.deleteMany({ postId });
    await Comment.deleteMany({ postId });
    res.send({ result: 'success' });
  }
);

//참가한 스터디 목록
router.get('/mypage/join/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  let temp;
  let temp2;
  const existJoin = await Join.find({ userId });
  const existPost = [];
  for (let i = 0; i < existJoin.length; i++) {
    temp = existJoin[i]['postId'];
    temp2 = await Post.findOne({ postId: temp });
    existPost.push(temp2);
  }
  res.send(existPost);
});

router.get('/users/me', authMiddleware, async (req, res) => {
    // 이 미들웨어를 사용하면 res.locals에 접근하면 항상 사용자정보가 들어있는 상태로 api를 구현하면 된다. 엄청쉬워짐
    const { user } = res.locals;
    res.send({
      // 기본 status 코드는 200
      user, // 현재 패스워드값이 포함되어있는데 원래는 이렇게 하면 안된다. 패스워드는 암호화 되어있어도 로그를 남기면 안됨
    });
  });

module.exports = router;
