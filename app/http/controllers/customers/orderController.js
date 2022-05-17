const Order = require('../../../models/order')
const moment = require('moment')
const { json } = require('express')

function orderController () {
    return {
        store(req, res) {
            // Validate request
            const { phone, address} = req.body
            if(!phone || !address) {
                req.flash('error', 'Tất cả các trường là bắt buộc')
                return res.redirect('/cart')
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })

            order.save().then(result => {
                Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
                    req.flash('success', 'Đặt hàng thành công!')
                    delete req.session.cart
                    // Emit
                    const eventEmitter = req.app.get('eventEmitter') 
                    eventEmitter.emit('orderPlaced', placedOrder)
                    return res.redirect('/customer/orders')
                    // return res.json({message : 'Đặt hàng thành công!'})
                })
            }).catch(err => {
                req.flash('error', 'Có gì đó không ổn!')
                return res.redirect('/cart')
            })
        },
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id },
                null,
                { sort: { 'createdAt': -1 } } )
            // res.header('Cache-Control', 'no-store')
            res.render('customers/orders', { orders: orders, moment: moment})
        },
        async show(req, res) {
            const order = await Order.findById(req.params.id)
            // Authorize user
            if(req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order })
            }
            return res.redirect('/')
        }
    }
}

module.exports = orderController