/**
 * @author tht7 ( tht7 )
 * @date 12/05/2021 2:18 PM
 * @soundtrack Count to Three (feat. The Stupendium & Ellen McLain)
 */
// region imports and connections
const mongoose = require('mongoose');
mongoose.connect(process.env['MONGODB_URI'] || 'mongodb://127.0.0.1:27017/myImages', { useNewUrlParser: true, useUnifiedTopology: true })
	.then(()=>{ console.log('MONGOOSE CONNECTED'); });
// endregion imports and connections

// region Just a shortcut
const Schema       = mongoose.Schema;      // Just a shortcut
const Mixed        = Schema.Types.Mixed;   // Just a shortcut
const ObjectId     = Schema.Types.ObjectId;// Just a shortcut
// endregion Just a shortcut

// region Schema
/**
 * @typedef {{createdAt: Date, imageName: string, size: number, userId: string}} ImageSchema
 */
const ImageSchema  = {
	userId         : { type: String, required:  true, index:  true                       },
	imageName      : { type: String, required: false, index: false                       },
	size           : { type: Number, required:  true, index: false                       },
	createdAt      : { type:   Date, required:  true, index: false, default: Date.now    }
};
// endregion

/** @type {Model<ImageSchema>} */
const ImageModel   = mongoose.model('Image', new Schema(ImageSchema));

exports.ImageModel = ImageModel;
