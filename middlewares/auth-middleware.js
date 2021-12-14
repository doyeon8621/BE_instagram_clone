const jwt = require('jsonwebtoken');
const { User } = require('../models'); // 실제로 데이터베이스에 조회해야 되니까 유저 사용자 모델이 필요

module.exports = (req, res, next) => {
    const { authorization } = req.headers; // http 인증 시 header에 담아서 보냄
    const [tokenType, tokenValue] = authorization.split(' ');

    if (tokenType !== 'Bearer') {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요.',
        });
        return;
    }

    try {
        const { userId } = jwt.verify(tokenValue, 'my-secret-key'); // jwt가 유효할 때만 데이터베이스에서 사용자 정보를 불러와서 res.locals에 담아준다.
        User.findByPk(userId).then((user) => {
            // async가 없으므로 await은 안됨. sequelize는 기본적으로 promise이므로  then
            res.locals.user = user;
            next(); // 미들웨어는 next를 호출하지 않으면 미들웨어 level에서 예외처리에 걸려 그 뒤에 미들웨어까지 연결이 안된다.
        });
    } catch (error) {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요.',
        });
        return;
    }
};
