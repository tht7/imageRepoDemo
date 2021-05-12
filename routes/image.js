/**
 * @author tht7 ( tht7 )
 * @date 12/05/2021 3:00 PM
 */
// region imports
const express       = require('express');
const path          = require('path');
const fileUpload    = require('express-fileupload');
const fs            = require('fs');
const router        = express.Router();

// my imports
const userLimiter   = require('../store/Users').user;
const ImageModel    = require('../store/Images').ImageModel;
// endregion

router.get('/:imageName', function (req, res) {
	try {
		const imagePath = `public/images/${path.basename(req.params.imageName)}`;
		if (fs.existsSync(imagePath)) {
			res.sendFile(path.resolve(imagePath));
		}else {
			return res.status(404).end();
		}
	} catch (imageFetchingException) {
		return res.status(500).json(imageFetchingException).end();
	}
});

router.post('/', fileUpload({limits: {fileSize: 50 * 1024 * 1024}}), async function (req, res) {
	const userId = req.header('x-username');
	if (!userId) {
		// no userId and thus not permissions
		if (req.files && Object.keys(req.files).length > 0) {
			// taking out the garbage
			for (let file of req.files) {
				try{ fs.unlinkSync(file.tempFilePath); } catch (ignore) {}
			}
			return res.status(401).end();
		}
	}
	// if images where uploaded, save them!
	if (req.files && Object.keys(req.files).length > 0) {
		let uploadedImages = [];
		for (let file in req.files) {
			file = req.files[file];
			if (await userLimiter.rateLimitUser(userId) && file.mimetype.startsWith('image')) {
				// we're premitted to upload the file at this point :)
				await file.mv(`public/images/${path.basename(file.name)}`);
				let newImage = new ImageModel();
				newImage.userId = userId;
				newImage.imageName = path.basename(file.name);
				newImage.size = file.size;
				await newImage.save();
				uploadedImages.push(newImage.toObject());
			} else {
				try{ fs.unlinkSync(file.tempFilePath); } catch (ignore) {}
			}
		}
		// return all the images the we uploaded :)
		return res.status(200).json(uploadedImages).end();
	} else {
		return res.status(400).end();
	}
});

router.delete('/:imageName', async function (req, res) {
	const userId = req.header('x-username');
	if (!userId) {
		return res.status(401).end();
	}
	
	// let's try to get this image from the database t osee if it belongs to this user
	const imageFromDb = await ImageModel.findOne({imageName: req.params.imageName }).exec();
	if (!imageFromDb) {
		return res.status(404).end();
	}
	if (imageFromDb.userId.toString() !== userId) {
		return res.status(403).end();
	}
	
	try{
		fs.unlinkSync(`public/images/${path.basename(imageFromDb.imageName)}`);
	} catch (deletingImageException) {
		return res.status(500).json(deletingImageException).end();
	}
	await ImageModel.remove({ _id: imageFromDb._id}).exec();
	
	return res.status(200).end();
	
});

// getting all the images for this user
router.get('/', async function (req, res) {
	const userId = req.header('x-username');
	if (!userId) {
		return res.status(401).end();
	}
	let allImagesForUser = await ImageModel.find({ userId }).exec();
	return res.status(200).json(allImagesForUser.toObject()).end();
	
})
module.exports = router;
