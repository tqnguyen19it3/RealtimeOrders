const User = require('../../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')
function authController() {
    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/'
    }
    
    return {
        login(req, res) {
            res.render('auth/login')
        },
        postLogin(req, res, next) {
            const { email, password }   = req.body
           // Validate request 
            if(!email || !password) {
                req.flash('error', 'Tất cả các trường là bắt buộc')
                return res.redirect('/login')
            }
            passport.authenticate('local', (err, user, info) => {
                if(err) {
                    req.flash('error', info.message )
                    return next(err)
                }
                if(!user) {
                    req.flash('error', info.message )
                    return res.redirect('/login')
                }
                req.logIn(user, (err) => {
                    if(err) {
                        req.flash('error', info.message ) 
                        return next(err)
                    }
                    //login success
                    return res.redirect(_getRedirectUrl(req))
                })
            })(req, res, next)
        },
        register(req, res) {
            res.render('auth/register')
        },
        async postRegister(req, res) {
            const { name, email, password }   = req.body
         // Validate request (nếu rổng thì đưa ra message)
            if(!name || !email || !password) {
                req.flash('error', 'Tất cả các trường là bắt buộc')
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/register')
         }

         // Check if email exists 
            User.exists({ email: email }, (err, result) => {
            if(result) {
                req.flash('error', 'Email đã tồn tại')
                req.flash('name', name)
                req.flash('email', email) 
                return res.redirect('/register')
            }
         })

         // Hash password 
            const hashedPassword = await bcrypt.hash(password, 10)
         // Create a user 
            const user = new User({
                name,
                email,
                password: hashedPassword
            })

            user.save().then((user) => {
                // ĐKY thành công trả về trang Login
                return res.redirect('/login')
            }).catch(err => {
                req.flash('error', 'Có gì đó không ổn!')
                return res.redirect('/register')
            })
        },
        logout(req, res) {
            req.logout()
            return res.redirect('/login')  
        }
    }
}

module.exports = authController