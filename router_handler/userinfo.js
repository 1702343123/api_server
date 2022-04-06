// 导入数据库操作模块
const db = require('../db/index')

// 在头部区域导入 bcryptjs 后，
// 即可使用 bcrypt.compareSync(提交的密码，数据库中的密码) 方法验证密码是否正确
// compareSync() 函数的返回值为布尔值，true 表示密码正确，false 表示密码错误
const bcrypt = require('bcryptjs')

//获取用户基本信息的处理函数
exports.getUserInfo = (req, res) => {
	// 定义查询用户信息的 SQL 语句
	const sql = 'select id, username, nickname, email, user_pic from ev_users where id=?'
	db.query(sql, req.user.id, (err, results) => {
		if(err) return res.cc(err)
		// 如果查询结果为空
		if(results.length !== 1) return res.cc('获取用户信息失败！')
		
		// 信息获取成功
		res.send({
			status: 0,
			message: '获取用户信息成功！',
			data: results[0]
		})
	})
}

// 更新用户基本信息的处理函数
exports.updateUserInfo = (req, res) => {
  const sql = 'update ev_users set ? where id=?'
	db.query(sql, [req.body, req.body.id], (err, results) => {
  // 执行 SQL 语句失败
  if (err) return res.cc(err)

  // 执行 SQL 语句成功，但影响行数不为 1
  if (results.affectedRows !== 1) return res.cc('修改用户基本信息失败！')

  // 修改用户信息成功
  res.cc('修改用户基本信息成功！', 0)
})
}

// 重置密码的处理函数
exports.updatePassword = (req, res) => {
	const sql = 'select * from ev_users where id=?'
	db.query(sql, req.user.id, (err, results) => {
		if(err) return res.cc(err)
		// console.log(req.user)
		if(results.length !== 1) return res.cc('用户不存在')
		// 判断提交的旧密码是否正确
		const compareResult = bcrypt.compareSync(req.body.oldPwd, results[0].password)
		if (!compareResult) return res.cc('旧密码错误！')
		// 定义更新用户密码的 SQL 语句
		const sql2 = 'update ev_users set password=? where id=?'
		// 对新密码进行 bcrypt 加密处理
		const newPwd = bcrypt.hashSync(req.body.newPwd, 10)
		db.query(sql2, [newPwd, req.user.id], (err, results) => {
			// SQL 语句执行失败
			if (err) return res.cc(err)

			// SQL 语句执行成功，但是影响行数不等于 1
			if (results.affectedRows !== 1) return res.cc('更新密码失败！')

			// 更新密码成功
			res.cc('更新密码成功！', 0)
		})
	})
}

// 更新用户头像的处理函数
exports.updateAvatar = (req, res) => {
  // 定义更新头像 SQL 语句
	const sql = 'update ev_users set user_pic=? where id=?'
	db.query(sql, [req.body.avatar, req.user.id], (err, results) => {
		if(err) return res.cc(err)
		if(results.affectedRows !== 1) return res.cc('更换头像失败！')
		res.cc('更换头像成功！', 0)
	})
}