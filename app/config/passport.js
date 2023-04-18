const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt')

function init(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        // Login
        // kiem tra email ton tai
        const user = await User.findOne({ email: email })
        if(!user) {
            return done(null, false, { message: 'Email này chưa được đăng ký!' })
        }

        bcrypt.compare(password, user.password).then(match => {
            if(match) {
                return done(null, user, { message: 'Đã đăng nhập thành công!' })
            }
            return done(null, false, { message: 'Tên người dùng hoặc mật khẩu sai!' })
        }).catch(err => {
            return done(null, false, { message: 'Có gì đó không ổn!' })
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })

}

module.exports = init