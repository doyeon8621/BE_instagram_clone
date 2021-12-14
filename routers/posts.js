const express = require("express");
const Posts = require("../models/posts");
const Likes = require("../models/likes");
const router = express.Router();

//게시글전체 조회
router.get("/", async(req, res) => {
    const posts = await Posts.findAll({}).sort("createdAt");
})













module.exports = router;