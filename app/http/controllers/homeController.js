const Menu = require('../../models/menu')
function homeController() {
    return {
        async index(req, res) {
            const page  = req.query.page;
            const options = {
                page: parseInt(page, 10) || 1,
                limit: 8,
            };
            Menu.paginate({status: "show"}, options)
                .then(products => {
                    return res.render('home',
                     { 
                        products: products.docs,
                        currentPage: page,
                        hasPrevPage: products.hasPrevPage,
                        hasNextPage: products.hasNextPage,
                        offset: products.offset,
                        prev: products.prevPage,
                        next: products.nextPage,
                        pageTotal: products.totalPages
                     });
                })
                .catch(err => {
                    res.status(500).send('Error retrieving data');
                });
        }
    }
}

module.exports = homeController