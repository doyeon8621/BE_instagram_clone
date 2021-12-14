const multer = require('multer');

const storage = multer.diskStorage({
    destination:(req, file, fn)=>{
        fn(null, "uploads/profiles")
    },
    filename:(req, file, fn)=>{
        fn(null, `${Date.now()}_${file.originalname}`);
    
    },
    fileFilter:(req, file, fn)=>{
        const ext = path.extname(file.originalname)
        if(ext !==".gif" || ext !==".png"){
            return fn(res.status(400).end('파일 업로드중 오류가 발생 했습니다.'),false);
        }
        fn(null, true)
    }
});
module.exports = storage;