const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middlewares/auth-middleware');
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output");


app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));

const corsOptions = {
  origin: '*', // 나중에 여기에 url
  credentials: true,
};
app.use(cors(corsOptions));

const postsRouter = require('./routers/posts');
const userRouter = require('./routers/user');
const commentRouter = require('./routers/comment');

const connect = require('./schemas');
connect();

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.json());

app.use('/api', express.urlencoded({ extended: false }), postsRouter);
app.use('/api', express.urlencoded({ extended: false }), userRouter);
app.use('/api', express.urlencoded({ extended: false }), commentRouter);

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
