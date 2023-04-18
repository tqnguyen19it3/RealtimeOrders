const User = require('../../../models/user');
const Menu = require('../../../models/menu');
const Order = require('../../../models/order');

function adminController() {
    return {
        index(req, res) {
            User.count({}, function(err, userCount) {
                if (err) {
                    return res.status(400).json({
                        err: 'Unable to get user count',
                    });
                } else {
                    // console.log("Count :", userCount);
                    Menu.count({}, function(err, productCount) {
                        if (err) {
                            return res.status(400).json({
                                err: 'Unable to get product count',
                            });
                        } else {
                            // console.log("Count :", productCount);
                            Order.count({}, function(err, orderCount) {
                                if (err) {
                                    return res.status(400).json({
                                        err: 'Unable to get order count',
                                    });
                                } else {
                                    // console.log("Count :", orderCount);
                                    const data = {productCount, orderCount, userCount}
                                    return res.render('admin/dashboard/adminHome', { layout: 'admin/adminLayout', data });
                                }
                            });
                        }
                    });
                }
            });
        },
        // index(req, res) {
        //     return res.render('admin/dashboard/adminHome' , { layout: 'admin/adminLayout' });
        // }
    }
}

module.exports = adminController