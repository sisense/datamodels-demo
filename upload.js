/**
 * Written by Moti Granovsky, Sisense DevX, January 2020
 *
 * A mini library that utilizes Sisense's built in (internal, **not public!**) file upload APIs to upload CSV/Excel files to the Sisense cluster for use in Datamodels.
 */

const request = require('request-promise-native');
const fs = require('fs');

const PATHS = {
    VALIDATE: 'storage/fs/validate_file',
    UPLOAD: 'storage/fs/upload'
};

/**
 * Provides functionality to validate and upload files to linux-based storage on the Sisense cluster
 */
class SisenseUploadClient {

    /**
     * @param {string} token The Sisense Bearer token
     * @param {string} baseUrl The Sisense web server address (host/ip and port) **without trailing `/`**
     */
    constructor(token, baseUrl) {
        this.token = token;
        this.baseUrl = baseUrl;
    }

    /**
     * Validate a file for upload and get an upload token
     * @param {string} filePath Local path to file which should be validated
     */
    async validateFile(filePath) {

        const filename = filePath.match(/\w+\.\w+$/)[0];

        try {

            // Read file as a buffer
            const buffer = await new Promise((resolve, reject) => {
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });

            const size = buffer.length;

            const options = {
                method: 'POST',
                uri: this._getUrl(PATHS.VALIDATE),
                body: {
                    filename, size
                },
                headers: {
                    'Authorization': this.token
                },
                json: true
            };

            const response = await request(options);
            return response.token;

        } catch (e) {
            console.error('could not validate file');
            throw e;
        }
    }

    /**
     * Uploads a file
     * @param {*} filePath Local path to file which should be uploaded
     * @param {string} [token] Upload token received from the `validate` method - if omitted, validation will be done first
     */
    async upload(filePath, token) {

        try {

            // Get upload token if not provided as an argument
            const uploadToken = token || await this.validateFile(filePath);

            // Read file as stream
            const formData = {
                file: fs.createReadStream(filePath)
            };

            // Send stream to upload endpoint
            const options = {
                method: 'POST',
                uri: this._getUrl(PATHS.UPLOAD),
                headers: {
                    'Authorization': this.token,
                    'x-upload-token': uploadToken
                },
                json: false,
                formData
            };

            const raw = await request(options);
            return JSON.parse(raw)[0];
        } catch (e) {
            console.error('could not upload file');
            throw e;
        }
    }

    /**
     * _Internal_
     */
    _getUrl(endpoint) {
        return `${this.baseUrl}/${endpoint}`;
    }
}

module.exports = SisenseUploadClient;
