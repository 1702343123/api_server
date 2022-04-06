//导入数据库操作模块
const db = require('../db/index')
// 导入 bcrypt.js 这个包（加密）
const bcrypt = require('bcryptjs')
// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
//导入全局的配置文件
const config = require('../config')

//注册新用户的处理函数
exports.regUser = (req, res) => {
	// 获取客户端提交到服务器的用户信息
	const userinfo = req.body
	// 对表单中的数据，进行合法性的校验
	if(!userinfo.username || !userinfo.password) {
		// return res.send({status: 1, message: '用户名或密码不能为空！'})
		return res.cc('用户名或密码不能为空！')
	}
	
	// 定义 SQL 语句，查询用户名是否被占用
	const sql = 'select * from ev_users where username=?'
	db.query(sql, userinfo.username, (err, results) => {
		if(err) {
			// return res.send({status: 1, message: err.message})
			return res.cc(err)
		}
		//判断用户名是否被占用
// 		if(results.length > 0) {
// 			// return res.send({status: 1, message: '用户名被占用，请更换其他用户名'})
// 			return res.cc('用户名被占用，请更换其他用户名')
// 		}
		// 调用 bcrypt.hashSync() 对密码进行加密
		userinfo.password = bcrypt.hashSync(userinfo.password, 10)
		// console.log(userinfo)
		// 定义插入新用户的 SQL 语句
		const sql2 = 'insert into ev_users set ?'
		db.query(sql2, {username: userinfo.username, password: userinfo.password}, (err, results) => {
			if(err) return res.cc(err)
			// 判断影响行数是否为 1
			if(results.affectedRows !== 1) return res.cc('注册用户失败，请稍后再试！')
			// 注册成功
			// res.send({status: 0, message: '注册成功！'})
			res.cc('注册成功！', 0)
		})
	})

}

//登录的处理函数
exports.login = (req, res) => {
	//接受表单数据
	const userinfo = req.body
	const sql = 'select * from ev_users where username=?'
	db.query(sql, userinfo.username, (err, results) => {
		if(err) return res.cc(err)
		//获取到的数据条数不等于 1
		if(results.length !== 1) return res.cc('登录失败！')
		// TODO:判断密码是否正确
		// 调用 bcrypt.compareSync(用户提交的密码, 数据库中的密码) 方法比较密码是否一致
		const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
		if(!compareResult) return res.cc('登录失败')
		
		// TODO：登录成功，生成 Token 字符串
		// 剔除完毕之后，user 中只保留了用户的 id, username, nickname, email 这四个属性的值
		const user = { ...results[0], password: '', user_pic: '' }
		// 生成 Token 字符串
		const tokenStr = jwt.sign(user, config.jwtSecretKey, {expiresIn: config.expiresIn})
		// 调用 res.send() 将 token 响应给客户端
		res.send({
			status: 0,
			message: '登录成功！',
			token: 'Bearer ' + tokenStr
		})
	})
}