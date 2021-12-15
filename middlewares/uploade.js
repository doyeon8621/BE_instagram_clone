const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const fileFilter = (req, file, cb)=>{
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"|| file.mimetype == "image/gif") {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error(' .png, .jpg ,.jpeg and .gif 파일만 업로드 가능합니다.'));
      }
    }
module.exports = multer({
    storage:storage,
    fileFilter:fileFilter,
    limits:{fileSize:5*1024*1024},
});
