const Order = require('../../../models/order')
const moment = require('moment')
const { json } = require('express')
const paypal_secret = process.env.PAYPAL_PRIVATE_KEY;
const paypal = require('paypal-rest-sdk');


// Paypal connection
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Af2v_mI07m_uFGhPtS62aaK1KnK6ksGxcS2K3A8Fo31GSoGi_FSy-ATqfIAeRWEf-78k6r9A7u-w27Re',
    'client_secret': paypal_secret
});

function orderController () {
    return {
        store(req, res) {
            // Validate request
            const { phone, address, paymentType } = req.body
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

            if(paymentType === 'paypal'){ // thanh toan paypal

                var tongtien = req.session.cart.totalPrice;
                var sanpham = req.session.cart.items;
                console.log(JSON.stringify(sanpham))
                var sanpham2 = []
                for(var key in sanpham) {
                    let data = sanpham[key].item
                    delete(data._id)
                    delete(data.image)
                    delete(data.size)
                    data.quantity = sanpham[key].qty
                    data.currency = "USD"
                    data.sku = data.name
                    data.price = parseFloat(data.price).toString()
                    sanpham2.push(data)
                }
                console.log(sanpham2)

                const create_payment_json = {
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        "return_url": "https://nhsportsfootball.tqnguyen.social/customer/success",
                        "cancel_url": "https://nhsportsfootball.tqnguyen.social/customer/cancel"
                    },
                    "transactions": [{
                        "item_list": {
                            "items": sanpham2
                        },
                        "amount": {
                            "currency": "USD",
                            "total": tongtien.toString()
                        },
                        "description": "This is the payment description."
                    }]
                }
                console.log(JSON.stringify(create_payment_json))
            
                paypal.payment.create(create_payment_json, function (error, payment) {
                    if (error) {
                        throw error;
                    } else {
                        console.log(payment);
                        for (let i = 0; i < payment.links.length; i++) {
                            if (payment.links[i].rel === 'approval_url') {
                                res.redirect(payment.links[i].href);
                            }
                        }
            
                    }
                });

                order.save().then(result => {
                    Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
                        
                            placedOrder.paymentStatus = true
                            placedOrder.paymentType = paymentType
                            placedOrder.save().then((ord) => {
                                // Emit
                                const eventEmitter = req.app.get('eventEmitter') 
                                eventEmitter.emit('orderPlaced', ord)
                                // delete req.session.cart
                                // return res.redirect('/customer/orders')
                            }).catch((err) => {
                                console.log(err)
                            })
                        })
                }).catch(err => {
                    req.flash('error', 'Có gì đó không ổn!')
                    return res.redirect('/cart')
                });
            }else{ //thanh toan khi nhan hang
                order.save().then(result => {
                    Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
                        req.flash('success', 'Đặt hàng thành công!')
                        delete req.session.cart
                        // Emit
                        const eventEmitter = req.app.get('eventEmitter') 
                        eventEmitter.emit('orderPlaced', placedOrder)
                        return res.redirect('/customer/orders')
                    })
                }).catch(err => {
                    req.flash('error', 'Có gì đó không ổn!')
                    return res.redirect('/cart')
                })
            }
        },
        async cancel(req, res) {
            req.flash('error', 'Thanh toán chưa được thực hiện')
            return res.render('/cart')
        },
        async success(req, res) {

            var tongtien = req.session.cart.totalPrice;
            const payerId = req.query.PayerID;
            const paymentId = req.query.paymentId;
            
            const execute_payment_json = {
                "payer_id": payerId,
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": tongtien.toString()
                    }
                }]
            };

            paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
                if (error) {
                    console.log(error.response);
                    throw error;
                } else {
                    console.log(JSON.stringify(payment))
                    delete req.session.cart
                    req.flash('success', 'Thanh toán online thành công! Đơn hàng đã được trả tiền, cần đợi 1 lúc để nhân viên giao hàng tới')
                    return res.redirect('/customer/orders')
                }
            });
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