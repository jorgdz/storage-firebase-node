'use strict'

const { Storage } = require('@google-cloud/storage')
const fs = require('fs')
const credentials = require('../../config/credentials')

var firebase = function () {
    const storageClient = new Storage({
        credentials: credentials
    })

    return storageClient.bucket(process.env.STORAGE_BUCKET)
}()

function uploadOneFile (file) {
    return new Promise((resolve, reject) => {        
        firebase.upload(file.filename, {
            gzip: true,
            metadata: {
                cacheControl: 'public, max-age=31536000',      
            },
            predefinedAcl: 'publicread',
            destination: `urbanizacion/${file.filename}`
        }).then(res => {
            const response = {
                name: file.filename,
                bucket: firebase.name,
                contentType: file.mimetype,
                size: file.size,
                url: getURL(file.filename)
            }

            fs.unlink(file.filename, function (err) {
                if (err) throw err;
            })

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

function getURL(name) {
    return `https://storage.googleapis.com/${process.env.STORAGE_BUCKET}/urbanizacion/${name}`
}

module.exports = { uploadOneFile, generateFileName }
