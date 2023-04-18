const path = require('path');
const multer = require('multer');

//upload image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/products');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
  
const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb){
        if(file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
            cb(null, true);
        }else {
            cb(new Error('Only jpg, jpeg, png Image File Supported!'), false); 
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 2
    }
});

module.exports = upload