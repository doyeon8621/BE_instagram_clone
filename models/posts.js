const { Sequelize } = require("sequelize");
const db = require(".");

module.exports = class User extends Sequelize.Model{
   static init(sequelize){
       return super.init({
           postId:{
                type:Sequelize.INTEGER,
                primaryKey:true,
                allowNull:false,
                autoIncrement: true,
           },
           content :{
               type:Sequelize.TEXT,
               allowNull:true,
           },
           imageUrl :{
               type:Sequelize.STRING(100),
               allowNull:true,
           },
           createdAt : {
               type:Sequelize.STRING(45),
               allowNull:false,
           },
       },{
        sequelize,
        timestamps:true,
        underscored:false,  //_사용 여부
        modelName :'Post', //js에서사용
        tableName:'posts',  //db에서 사용
        paranoid:false,
        charset:'utf8',
        collate:'utf8_general_ci',
       });
   }
   static associate(db){
    db.Post.belongsTo(db.User, { foreignKey: 'userID', targetKey: 'userId' });
     db.Post.hasMany(db.Comment, {foreignKey:'postID', sourceKey:'postId', onDelete:'cascade'});
     db.Post.hasMany(db.Like,{foreignKey:'postID', sourceKey:'postId', onDelete:'cascade'});
   }
}