const { Sequelize } = require("sequelize");
const db = require(".");

module.exports = class User extends Sequelize.Model{
   static init(sequelize){
       return super.init({
           userId:{
               type:Sequelize.INTEGER,
               primaryKey:true,
               allowNull:false,
               autoIncrement: true,
           },
           userEmail :{
               type:Sequelize.STRING(50),
               allowNull:false,
               unique:true,
           },
           userName : {
               type:Sequelize.STRING(45),
               allowNull:false,
           },
           nickname :{
               type:Sequelize.STRING(50),
               allowNull:false,
           },
           password :{
               type:Sequelize.STRING(45),
               allowNull:true,
           },
           imageUrl_profile : {
               type:Sequelize.STRING(200),
               allowNull:true,
           },
           introduce : {
               type:Sequelize.TEXT,
               allowNull:true,
           },
           phoneNumber : {
               type:Sequelize.STRING(45),
               allowNull:true,
           },
       },{
        sequelize,
        timestamps:true, 
        underscored:false,  //_사용 여부
        modelName :'User', //js에서사용
        tableName:'users',  //db에서 사용
        paranoid:false,
        charset:'utf8',
        collate:'utf8_general_ci',
       });
   }
//    static associate(db){
//        db.User.hasMany(db.Comment, {foreignkey:'ID', sourceKey:'userId'});//외부에서 참조하는 키는 user의 nickname FK는 userNickname
//        db.User.hasMany(db.Post, {foreignkey:'ID', sourceKey:'userId'});
//        db.User.hasMany(db.Like, {foreignkey:'ID', sourceKey:'userId'}); 
//    }
}
