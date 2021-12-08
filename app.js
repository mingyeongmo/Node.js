const express = require("express");
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const { Session } = require("express-session");
const mysql = require('mysql');
const app = express()
const port = 9000

// const path = require('path');
// const crypto = require('crypto');
// const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("assets"));
app.use(express.json());

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'alsrudah9854',
    database: 'node_mall',
});

// 세션등록
app.use(session({
    secret: 'mykey', // 이 값을 통해 세션을 암호화 (노출하지 않아야 함)
    resave: false, // 세션 데이터가 바뀌기 전까지는 세션 저장소에 값을 저장하지 않음
    saveUninitialized: true, // 세션이 필요하면 세션을 실행시킨다
    store : new FileStore() // 세션이 데이터를 저장하는 곳
}));

// 회원가입
app.get('/register', (req, res) => {
    console.log('회원가입 페이지');
    res.render('register');
})

app.post('/register', (req, res) => {
    console.log('회원가입 하는중');
    const body = req.body;
    const id = body.id;
    const pw = body.pw;
    const name = body.name;
    const age = body.age;
    const param = [id,pw,name,age];
    const sql = 'insert into users(id,pw,name,age) values(?,?,?,?)';

    console.log(param)
    con.query(sql, param, function(err, result, fields){
        if (err) throw err;
        res.redirect('/');
    });

    
});

// 로그인
app.get('/login',(req,res)=>{
    console.log('로그인 작동');
    res.render('login');
});

app.post('/login',(req,res)=>{
    const body = req.body;
    const id = body.id;
    const pw = body.pw;
    console.log('hihihi');
    con.query('select * from users where id=?',[id],(err,data)=>{
        // 로그인 확인
        console.log(data[0]);
        console.log(id);
        console.log(data[0].id);
        console.log(data[0].pw);
        console.log(id == data[0].id);
        console.log(pw == data[0].pw);
        if(id == data[0].id && pw == data[0].pw){
            console.log('로그인 성공');
            // 세션에 추가
            req.session.is_logined = true;
            req.session.name = data.name;
            req.session.id = data.id;
            req.session.pw = data.pw;
            req.session.save(function(){ // 세션 스토어에 적용하는 작업
                res.render('index',{ // 정보전달
                    name : data[0].name,
                    id : data[0].id,
                    age : data[0].age,
                    is_logined : true,
                });
            });
        }else{
            console.log('로그인 실패');
            res.render('login');
        }
    });
});

// 로그아웃
app.get('/logout',(req,res)=>{
    console.log('로그아웃 성공');
    req.session.destroy(function(err){
        // 세션 파괴후 할 것들
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`${port}번 포트에서 서버 대기중입니다.`)
});