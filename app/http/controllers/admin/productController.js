const fs = require('fs')
const path = require('path')
const moment = require('moment');
const Menu = require('../../../models/menu')

function productController() {
    return {
        addProduct(req, res) {
            return res.render('admin/product/addProduct' , { layout: 'admin/adminLayout' });
        },
        saveProduct(req, res) {
            const product = new Menu({ 
                name: req.body.productName,
                price: req.body.productPrice, 
                count: req.body.productCount,
                size: req.body.productSize,
                status: req.body.productStatus,
                description: req.body.productDesc,
                content: req.body.productContent,
            });

            // console.log(req.file)
            if(req.file){
                product.image = req.file.filename;
            }
            // console.log(product);
            product.save().then(response => {
                req.flash('success', 'Add product successfully!');
                return res.redirect('back');
            }).catch(err => {
                req.flash('error', 'Something went wrong!');
                console.error(err);
                res.status(500).send(err);
            })
        },
        async allProduct(req, res) {
            const deletedCount = await Menu.countDocumentsDeleted();
            const products = await Menu.find();
            return res.render('admin/product/allProduct', { layout: 'admin/adminLayout', products: products, deletedCount, moment });
        },
        editProduct(req, res) {
            Menu.findById(req.params.id)
                .then(product => res.render('admin/product/editProduct', { layout: 'admin/adminLayout', product}))
                .catch(err => {
                    req.flash('error', 'Something went wrong!');
                    console.error(err);
                    res.status(500).send(err);
                });
        },
        updateProduct(req, res) {
            const product = { 
                name: req.body.productName,
                price: req.body.productPrice, 
                count: req.body.productCount,
                size: req.body.productSize,
                status: req.body.productStatus,
                description: req.body.productDesc,
                content: req.body.productContent,
            }
            if(req.file){
                Menu.findById(req.params.id)
                    .then(pro => {
                        if(pro.image){
                            // Delete old image file exist
                            fs.unlink(path.join(__dirname, '../../../../public/uploads/' + pro.image), (err) => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                            })
                        }
                    })
                    .catch(err => {
                        req.flash('error', 'Something went wrong!');
                        console.error(err);
                        res.status(500).send(err);
                    });

                product.image = req.file.filename;
            }
            Menu.updateOne({ _id: req.params.id }, product)
                .then(() => {
                    req.flash('success', 'Update product successfully!');
                    return res.redirect("/admin/all-product")
                })
                .catch(err => {
                    req.flash('error', 'Something went wrong!');
                    console.error(err);
                    res.status(500).send(err);
                });
        },
        updateStatusProduct(req, res) {
            const id = req.params.id;
            const newStatus = req.body.status;
            Menu.findByIdAndUpdate(id, { status: newStatus }, { new: true })
            .then(() => {
                // req.flash('success', 'Update product status successfully!');
                // res.redirect('back');
                res.status(200);
            })
            .catch(err => {
                // req.flash('error', 'Something went wrong!');
                console.error(err);
                res.status(500).send(err);
            })
        },
        softDelProduct(req, res) {
            Menu.delete({ _id: req.params.id })
            .then(() => {
                req.flash('success', 'Move product to trash successfully!');
                res.redirect('back');
            })
            .catch(err => {
                req.flash('error', 'Something went wrong!');
                console.error(err);
                res.status(500).send(err);
            })
        },
        async trashProduct(req, res) {
            const products = await Menu.findDeleted();
            return res.render('admin/product/trashProduct', { layout: 'admin/adminLayout', products: products, moment });
        },
        restoreProduct(req, res) {
            Menu.restore({ _id: req.params.id })
            .then(() => {
                req.flash('success', 'Restore product successfully!');
                res.redirect('back');
            })
            .catch(err => {
                req.flash('error', 'Something went wrong!');
                console.error(err);
                res.status(500).send(err);
            })
        },
        destroyProduct(req, res) {
            Menu.findOneAndDelete({ _id: req.params.id })
            .then((item) => {
                if (!item) {
                    return res.status(404).send('Item not found');
                } else {
                    // Delete old image file exist in uploads folder
                    fs.unlink(path.join(__dirname, '../../../../public/uploads/' + item.image), (err) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                    })
                }
                req.flash('success', 'Delete product successfully!');
                res.redirect('back');
            })
            .catch(err => {
                req.flash('error', 'Something went wrong!');
                console.error(err);
                res.status(500).send(err);
            })
        },
        imgCKEditor(req, res){
            try {
                fs.readFile(req.files.upload.path, function (err, data) {
                    var newPath = path.join(__dirname, '../../../../public/uploads/products/IMG_CKEditor/' + req.files.upload.name);
                    fs.writeFile(newPath, data, function (err) {
                        if (err) console.log({err: err});
                        else {
                            let fileName = req.files.upload.name;
                            let url = '/uploads/products/IMG_CKEditor/' + fileName;                    
                            let msg = 'Upload successfully';
                            let funcNum = req.query.CKEditorFuncNum;
                            console.log({url,msg,funcNum});
                           
                            res.status(201).send("<script>window.parent.CKEDITOR.tools.callFunction('"+funcNum+"','"+url+"','"+msg+"');</script>");
                        }
                    });
                });
            } catch (error) {
                console.log(error.message);
            }
        },
    }
}

module.exports = productController