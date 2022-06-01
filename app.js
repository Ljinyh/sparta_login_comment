const express = require("express");
const app = express();
const Joi = require("joi");
const router = express.Router();

//인증절차
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middlewares/auth-middleware");

//models 불러오기
const Contents = require('./models/contents');//게시글 Schema
const Comment = require('./models/comment');// 댓글 Schema
const User = require('./models/user');// user schema
const connect = require("./models"); //몽고디비 연결

connect(); //몽고디비 연결

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/api", express.json(), router);

app.get("/users", (req, res) => {
    res.status(200).json({});
});

app.get("/contents", (req, res) => {
    res.status(200).json({});
});

const postUsersSchema = Joi.object({
    nickname:
        Joi.string()
            .required()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    password:
        Joi.string()
            .required()
            .min(4),
    checkPassword:
        Joi.string()
            .required()
            .min(4),
});

//회원가입 API
router.post("/users", async (req, res) => {
    try {
        const { nickname, password, checkPassword } =
            await postUsersSchema.validateAsync(req.body);

        //비밀번호에 닉네임이 들어갔는지 확인
        if (password.includes(nickname)) {
            res.status(400).send({
                errorMessage: "비밀번호에 닉네임과 같은 값이 포함되면 안됩니다."
            });
            return;
        }

        // 비밀번호가 같은지 확인
        if (password !== checkPassword) {
            res.status(400).send
                ({ errorMessage: "비밀번호를 다시 확인해주세요." });
            return;
        }

        const existUsers = await User.find({
            $or: [{ nickname }],
        });
        if (existUsers.length) {
            // 중복데이터가 존재할 경우
            res.status(400).send
                ({ errorMessage: "중복된 닉네임 입니다." });
            return;
        }

        const users = new User({ nickname, password });
        await users.save();

        res.status(201).send({});
    } catch (err) {
        res.status(400).send({
            errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
        });
    }
});

//로그인 API
router.post("/auth", async (req, res) => {
    try {
        const { nickname, password } = req.body;

        const usersinfo = await User.findOne({ nickname }).exec();
        // console.log(usersinfo)
        if (!usersinfo || password !== usersinfo.password) {
            res.status(400).send({
                errorMessage: "닉네임 또는 패스워드를 확인해주세요."
            });
            return;
        }

        const token = jwt.sign({ userId: usersinfo.userId }, "my-secret-key1");
        res.send({
            token,
        });

    } catch (err) {
        res.status(400).send({
            errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
        });
    }
});

//내정보 불러오기
router.get("/users/me", authMiddleware, async (req, res) => {
    const { userId } = res.locals;
    // console.log(user) 이게 왜 안나올까..? =>이제나옴
    // require할때 변수에 {} 쳐놔서 그럼. => MySQL쓸때 설정해놓은걸 안바꿈
    res.send({
        userId,
    });
});

//게시글 전체조회
router.get("/contents", async (req, res) => {
    const AllContents = await Contents.find({});
    res.json({ AllContents });
});

// 게시글 작성하기
router.post("/contents", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { title, content, articlePassword } = req.body;

    const creatcontents =
        await Contents.create({ userId, title, content, articlePassword });
    res.status(201).json({ result: 'success', msg: '글이 등록되었습니다.' });
});

//게시글 수정
router.put("/contents/detail/:contentId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { contentId } = req.params;
    const { title, detail, articlePassword } = req.body;

    const existsContentsId = await Contents.find(userId);

    if (!existsContentsId.length) {
        return res.status(400).json({ errorMessage: "게시물이 존재하지 않습니다." });
    }

    if ((existsContentsId[0].userId === userId) && (existsContentsId[0].articlePassword === articlePassword)) {
        await Contents.updateOne({ contentId }, { $set: { title, detail } });

    };

    res.json({ success: true });
});

//게시글 삭제
router.delete("/contents/detail/:contentId", authMiddleware, async (req, res) => {
    const { userId, articlePassword, contentId } = req.body;

    const existsContentsId = await Contents.find(contentId);
    if ((existsContentsId.length) && (existsContentsId[0].userId === userId) && (existsContentsId[0].articlePassword === articlePassword)) {
        await Contents.deleteOne(contentId);
    }
    res.json({ success: true });
})

//댓글목록 조회
router.get("/contents/:contentId/detail/comments", async (req, res) => {
    const comments = await Comment.find({}).sort({ createdAt: -1 });
    res.json({ comments });
});

//댓글 작성하기
router.post('/contents/:contentId/detail/comments', authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { contentId } = req.params;
    const { comment } = req.body;

    if (comment === null) {
        res.status(400).send({ msg: "댓글 내용을 입력해주세요." })
    }
    if (userId === null) {
        res.status(400).send({ msg: "로그인이 필요한 기능입니다." })
    }

    const postArticle = await Comment.create({
        userId,
        contentId,
        comment,
    });
    res.status(201).json({ article: postArticle, msg: "댓글이 등록되었습니다." });
});

//댓글 수정하기
router.put("/contents/:contentId/detail/comments/:commentId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { commentId } = req.params;
    const { comment } = req.body;

    const existsComment = await Comment.findById(commentId).exec();
    console.log(existsComment)
    if (existsComment.userId === userId) {
        await existsComment.updateOne({ comment }, { $set: { comment } })
    };
    res.json({ success: true });
});

//댓글 삭제하기
router.delete("/contents/:contentId/detail/comments/:commentId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { commentId } = req.params;

    const existsComment = await Comment.findById(commentId).exec();
    if (existsComment.userId === userId) {
        await existsComment.delete();
    };
    res.json({ success: true });
});

const port = 8080;
app.listen(port, () => {
    console.log(port, "포트로 서버 On!");
});
