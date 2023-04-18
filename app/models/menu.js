const mongoose = require('mongoose')
const Schema = mongoose.Schema
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const mongoosePaginate = require('mongoose-paginate-v2');

const menuSchema = new Schema({
    name: { type: String },
    slug: { type: String, slug: 'name', unique: true },
    image: { type: String },
    price: { type: Number },
    count: { type: Number },
    size: { type: String },
    status: { type: String },
    description: { type: String },
    content: { type: String }
}, { timestamps: true });

//add plugins
menuSchema.plugin(slug);
menuSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true });
menuSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Menu', menuSchema)