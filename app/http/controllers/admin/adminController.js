const User = require('../../../models/user');
const Menu = require('../../../models/menu');
const Order = require('../../../models/order');

function adminController() {
    return {
        // index(req, res) {
        //     User.count({}, function(err, userCount) {
        //         if (err) {
        //             return res.status(400).json({
        //                 err: 'Unable to get user count',
        //             });
        //         }
        //         Menu.count({}, function(err, productCount) {
        //             if (err) {
        //                 return res.status(400).json({
        //                     err: 'Unable to get product count',
        //                 });
        //             } 
        //             Order.count({}, function(err, orderCount) {
        //                 if (err) {
        //                     return res.status(400).json({
        //                         err: 'Unable to get order count',
        //                     });
        //                 }
        //                 return res.render('admin/dashboard/adminHome', { layout: 'admin/adminLayout' }, userCount, productCount, orderCount);
        //             });
        //         });

        //     });
        // },
        index(req, res) {
            return res.render('admin/dashboard/adminHome' , { layout: 'admin/adminLayout' });
        }
    }
}

module.exports = adminController