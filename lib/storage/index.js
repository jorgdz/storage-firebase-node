'use strict'

const { Storage } = require('@google-cloud/storage')
const { v4: uuidv4 } = require('uuid')

var firebase = function () {
    const storageClient = new Storage({
        projectId: process.env.STORAGE_PROJECT_ID,
        keyFilename: process.env.STORAGE_KEY_FILENAME
    })

    return storageClient.bucket(process.env.STORAGE_BUCKET)
}()

function uploadOneFile (file) {
    return new Promise((resolve, reject) => {
        const token = uuidv4()
        
        firebase.upload(file.filename, {
            gzip: true,
            metadata: {
                cacheControl: 'public, max-age=31536000',
                metadata: {
                    firebaseStorageDownloadTokens: token
                }
            }
        }).then(res => {
            const response = {
                name: file.filename,
                bucket: firebase.name,
                contentType: file.mimetype,
                size: file.size,
                url: getURL(file.filename, token)
            }

            resolve(response)
        }).catch(err => {
            reject(err)
        })
    })
}

function generateFileName(originalname) {
    originalname = originalname.replace(' ', '_')
    return new Date().getTime() + '-' + originalname
}

function getURL(name, token) {
    return `https://firebasestorage.googleapis.com/v0/b/${process.env.STORAGE_BUCKET}/o/${name}?alt=media&token=${token}`
}

module.exports = { uploadOneFile, generateFileName }
