const express = require('express');
//const jwt = require('jsonwebtoken');
const router = express.Router();
// const authMiddleware = require('../middlewares/auth-middleware');
const {User} = require('../models/users')

//마이페이지 정보조회 & 마이페이지 수정페이지 최초 조회 같이사용
router.get('/:userId', async(req, res)=>{
    try{

    }catch(error){
        res.statusCode(400)
    }
    const {userId} = req.params;
    User.findAll({});
})
module.exports = router;