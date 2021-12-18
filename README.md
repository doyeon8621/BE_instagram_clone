# BE_instagram_clone
항해99 4기 7주차 clone coding - instagram<br>
![image](https://user-images.githubusercontent.com/80023108/146629670-a0389404-6eca-438d-8733-eaf8d0ff945d.png)
#### 저희의 서비스가 궁금하시다면
#### 유튜브주소 https://www.youtube.com/watch?v=DxQZ4e5tRxw
#### 도메인주소 http://team2instagram.s3-website.ap-northeast-2.amazonaws.com/in/signIn
## 🧑🏻‍💻 제작 기간 및 팀원 소개
#### 기간 : 2021년 12월 13일 ~ 2021년 12월 18일
#### Backend(Node.js)
- 이도연 : like + post + main
- 이동호 : comment + login + signup
- 정하나 : myPage + profile modify

#### Frontend(React) : https://github.com/eundol0519/cloneCodingProject
- 신항민
- 오은희
- 최주영

## 🛠 사용 기술
#### Languages
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
#### Frameworks, Platforms and Libraries
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
#### IDEs/Editors
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)
#### Version Control
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
#### Hosting/SaaS
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
#### Databases
![MySQL](https://img.shields.io/badge/mysql-4479A1?style=flat-square&logo=mysql&logoColor=white)
#### Other
![Notion](https://img.shields.io/badge/Notion-%23000000.svg?style=for-the-badge&logo=notion&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
## 🎢 API 설계
#### user
- Post /api/users/login
- Post /api/users
- Get /api/users/me
#### post
- Get /api/posts
- Post /api/posts/images
- Post /api/posts
- Get /api/posts/:postId
- Delete /api/posts
#### comment
- Get /api/comments/:postId
- Delete /api/comments/:commentId
- Post /api/comments/:postId
#### like
- Post /api/posts/:postId/like
#### myPage
- Get /api/users/posts/:userId
- Get /api/users/:userId/posts
- Post /api/users/:userId
- Put /api/users/:userId

## 🗂ERD
![ERD](https://user-images.githubusercontent.com/93478396/146630306-61d678bd-df03-4613-972b-7aa69eb62c0d.png)


## 📜 핵심기능
#### 로그인/회원가입
- JWT를 이용하여 로그인과 회원가입 구현
- 이메일은 이메일형식( ex) test@test.com ), 숫자, 영문자 소/대문자로만 구성
- 이름은 2글자 이상, 영문자 소/대문자로만 구성
- 닉네임은 2글자 이상, 숫자, 영문자 소/대문자로만 구성
- 비밀번호가 4글자 이상 12자 이하, 숫자, 영문자 소/대문자로만 구성
- 이메일, 닉네임을 이미 사용중이면 회원 가입 불가능
#### 게시글 관련
- 게시글 작성 시 이미지업로드
- 댓글, 좋아요 기능
- 다른 유저의 게시글, 댓글 조회 기능
- 유저 본인의 게시글, 댓글은 삭제가능하며, 다른 유저의 게시글과 댓글은 수정 불가능
#### 댓글 작성하기
- 유저 본인의 생각을 담아 작성 가능
- 다른 유저의 댓글 조회
- 유저 본인의 댓글을 수정가능하며, 다른 유저의 리뷰글은 수정 불가능
- 유저 본인의 댓글을 삭제가능하며, 다른 유저의 리뷰글은 수정 불가능
#### 유저 프로필 페이지
- 해당 유저의 프로필 조회
- 해당 유저가 작성한 게시글 조회
- 내 프로필 정보 수정
## 🤦🏻 Trouble shooting
- API명세를 자주 수정
    - 원래는 api작성시 라우터 이름을 활용해야 된다고만 생각했었는데, 중간멘토링 이후 그것이 잘못되었다는 것을 배웠다. 
    - ex) POST /api/login (로그인 요청) <br>
          POST /api/user/image (회원 이미지 업로드)
- DB설계 시 foreignKey 작업 시 관계를 양쪽에 작성했던 문제
    - 한 쪽만 작성해서 중복이 없게 함
    - ex) db.Post.belongsTo(db.User, { foreignKey: 'userID', targetKey: 'userId', });
    - ex) db.User.hasMany(db.Post);
- sequelize findOne으로 가져온 데이터가 Json객체형식으로 가져와야 하는데 DB의 정보를 모두 가져와서 생긴 문제
    - 가져온 데이터를 api에서 다시 가공하여 프론트에 전달
- sequelize 설정 관련
    - primaryKey를 sequelize에서 기본으로 제공하는 것을 사용하지 않고 primaryKey:true 속성을 이용하면 직접 지정할 수 있다.
    - timestamp:true로 지정하였을 때 UTC로 자동설정되어서, timezone속성을 이용하여 우리나라 현재 시간으로 설정 했다. ("timezone":"+09:00")
- 서버 배포시 node_modules파일을 안올리고 서버에서 npm install 

## 🍻 개인 회고
#### 이도연 https://velog.io/@doyeon11/%ED%81%B4%EB%A1%A0%EC%BD%94%EB%94%A9-%ED%9A%8C%EA%B3%A0
#### 이동호 https://velog.io/@point/%ED%95%AD%ED%95%B499-4%EA%B8%B0-Day-49-WIL
#### 정하나 https://hana-j.tistory.com/61