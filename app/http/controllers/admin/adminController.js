const User = require('../../../models/user');
const Menu = require('../../../models/menu');
const Order = require('../../../models/order');

function adminController() {
    return {
        async index(req, res) {
            try{
                const [userCount, productCount, orderCount] = await Promise.all([User.count(), Menu.count(), Order.count()]);
                return res.render('admin/dashboard/adminHome' , { layout: 'admin/adminLayout', userCount, productCount, orderCount });
            } catch (error){
                return res.status(400).json({
                    failed: 'Unable to get count data',
                    error: error
                });
            }
        },
        async adminProfile(req, res) {
            const admin = await User.findOne({ _id: req.params.id });
            return res.render('admin/dashboard/adminProfile' , { layout: 'admin/adminLayout', admin });
        },
        async adminAccount(req, res) {
            const admin = await User.findOne({ _id: req.params.id });
            return res.render('admin/dashboard/adminAccount' , { layout: 'admin/adminLayout', admin });
        },
        postChangeAdminAccount(req, res) {
            const admin = new User({
                name: req.body.name,
                email: req.body.email,
            })
            User.findOneAndUpdate({ _id: req.params.id }, admin)
                .then(() => {
                    req.flash('success', 'Update admin account successfully!');
                    return res.redirect("back")
                })
                .catch(err => {
                    req.flash('error', 'Something went wrong!');
                    res.status(500).send(err);
                });
        },
    }
}

module.exports = adminController