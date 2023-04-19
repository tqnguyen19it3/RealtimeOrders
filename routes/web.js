const multipart = require('connect-multiparty')
const fs = require('fs')
const homeController = require('../app/http/controllers/homeController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const orderController = require('../app/http/controllers/customers/orderController')
const adminController = require('../app/http/controllers/admin/adminController')
const productController = require('../app/http/controllers/admin/productController')
const AdminOrderController = require('../app/http/controllers/admin/orderController')
const statusController = require('../app/http/controllers/admin/statusController')


// Middleware
const guest = require('../app/http/middlewares/guest')
const auth = require('../app/http/middlewares/auth')
const admin = require('../app/http/middlewares/admin')
const upload = require('../app/http/middlewares/upload')
const multipartMiddleware = multipart()

function initRoutes(app) {
    // // guest
    app.get('/', homeController().index)
    app.get('/login', guest, authController().login)
    app.post('/login', authController().postLogin)
    app.get('/register', guest, authController().register)
    app.post('/register', authController().postRegister)
    app.post('/logout', authController().logout)

    app.get('/cart', cartController().index)
    app.post('/update-cart', cartController().update)


    // // Customer routes
    app.post('/orders', auth, orderController().store)
    app.get('/customer/orders', auth, orderController().index)
    app.get('/customer/orders/:id', auth, orderController().show)
    app.get('/customer/success', auth, orderController().success)
    app.get('/customer/cancel', auth, orderController().cancel)


    // // Admin routes
        //dashboard
    app.get('/admin/dashboard', admin, adminController().index)
        //profile admin
    app.get('/admin/admin-profile/:id', admin, adminController().adminProfile)
        //account admin
    app.get('/admin/admin-account/:id', admin, adminController().adminAccount)
    app.put('/admin/change-admin-account/:id', admin, adminController().postChangeAdminAccount)
        //products
    app.get('/admin/add-product', admin, productController().addProduct)
    app.post('/admin/save-product', admin, upload.single('productImage'), productController().saveProduct)
    app.get('/admin/all-product', admin, productController().allProduct)
    app.get('/admin/edit-product/:id', admin, productController().editProduct)
    app.put('/admin/update-product/:id', admin, upload.single('productImage'), productController().updateProduct)
    app.patch('/admin/update-status-product/:id', admin, productController().updateStatusProduct)
    app.delete('/admin/soft-delete-product/:id', admin, productController().softDelProduct)
    app.get('/admin/trash-product', admin, productController().trashProduct)
    app.patch('/admin/restore-product/:id', admin, productController().restoreProduct)
    app.delete('/admin/delete-product/:id', admin, productController().destroyProduct)
        //uploads img ckeditor
    app.post('/admin/imgCKEditor-product-upload', admin, multipartMiddleware, productController().imgCKEditor)
        //order state
    app.get('/admin/orders', admin, AdminOrderController().index)
    app.post('/admin/order/status', admin, statusController().update)
}

module.exports = initRoutes