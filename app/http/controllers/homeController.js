// const Menu = require('../../models/menu')
function homeController() {
    return {
        index(req, res) {
            // const pizzas = await Menu.find()
            res.render('home')
        }
    }
}

module.exports = homeController