var express = require('express')
var router = express.Router()

const { generateFileName, uploadOneFile } = require('../lib/storage')

const multer = require('multer')
const storage = multer.diskStorage({
  destination: '',
  filename: function (req, file, cb) {
    cb(null, generateFileName(file.originalname))
  },
})

const upload = multer({ 
  storage: storage,  
  limits: {
    fileSize: 5 * 1024 * 1024
  } 
})


/* GET home page. */
router.get('/', async function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.post('/upload', upload.array('file'), async function (req, res, next) {
  let response = []
  for await (let file of req.files) {
    response.push(await uploadOneFile(file))
  }

  res.send(response)
})

router.post('/upload-single', upload.single('file'), async function (req, res, next) {
  const response = await uploadOneFile(req.file)
  res.send(response)
})

module.exports = router
