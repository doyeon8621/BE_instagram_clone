const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
//const authMiddleware = require('./middlewares/auth-middleware');
const swaggerUi = require("swagger-ui-express");
//const swaggerFile = require("./swagger-output");
const mysql = require('mysql'); 
const {sequelize} = require('./models');

//app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));

const corsOptions = {
  origin: '*', // 나중에 여기에 url
  credentials: true,
};
app.use(cors(corsOptions));

//db연결(무조건 필요! )
sequelize.sync({force:false})
  .then(()=>{
    console.log('db Connected')
  })
  .catch((err)=>{
    console.log(err);
  });
  

app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public')); 
app.use(express.json());



app.use('/api/posts', express.urlencoded({ extended: false }), postsRouter);
app.use('/api/users', express.urlencoded({ extended: false }), userRouter);
app.use('/api/comments', express.urlencoded({ extended: false }), commentRouter);
//route
const postsRouter = require('./routers/posts');
const userRouter = require('./routers/users');
const commentRouter = require('./routers/comments');

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
