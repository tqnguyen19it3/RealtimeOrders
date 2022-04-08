const Menu = require('../../models/menu')
function homeController() {
    return {
        async index(req, res) {
            const products = await Menu.find()
            return res.render('home', { products: products })
        }
    }
}

module.exports = homeController