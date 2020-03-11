/**
 * Written by Moti Granovsky, Sisense DevX, January 2020
 *
 * A mini library for performing RESTful operations on the Sisense **V2** API
 */

const request = require('request-promise-native');

/**
 * Provides functionality to perform GET, POST, PATCH and DELETE (CRUD) operations on the Sisense V2 REST API
 */
class SisenseV2Client {

    /**
     * @param {string} token The Sisense Bearer token
     * @param {string} baseUrl The Sisense web server address (host/ip and port) **without trailing `/`**
     */
    constructor(token, baseUrl) {
        this.token = token;
        this.baseUrl = baseUrl;
        this.apiVersion = 'v2';
    }

    /**
     * Perform a GET operation
     * @param {*} endpoint Endpoint path (not including a starting `/` or the base URL)
     * @param {object} query JSON object with query string parameters
     */
    get(endpoint, query) {

        const options = {
            uri: this._getUrl(endpoint),
            qs: query,
            headers: this._getHeaders(),
            json: true
        };

        return request(options);
    }

    /**
     * Perform a POST operation
     * @param {*} endpoint Endpoint path (not including a starting `/` or the base URL)
     * @param {object} body JSON object to send as the payload
     */
    post(endpoint, body) {

        const options = {
            method: 'POST',
            uri: this._getUrl(endpoint),
            headers: this._getHeaders(),
            json: true,
            body
        };

        return request(options);
    }

    /**
     * Perform a PATCH operation
     * @param {*} endpoint Endpoint path (not including a starting `/` or the base URL)
     * @param {object} body JSON object to send as the payload
     */
    patch(endpoint, body) {

        const options = {
            method: 'PATCH',
            uri: this._getUrl(endpoint),
            headers: this._getHeaders(),
            json: true,
            body
        };

        return request(options);
    }

    /**
     * Given a started build process, check the build task's status at regular intervals until it is complete or has failed
     * @param {string} buildId UUID of the build task
     * @param {number} [interval] Interval in milliseconds (default: 10 seconds)
     * @param {number} [timeout] Timeout in milliseconds (default: 300 seconds)
     */
    async waitForBuild(buildId, interval = 10000, timeout = 300000) {

        // Calculate how many retries fit into the defined timeout
        let retries = Math.round(timeout / interval);
        let done = false;

        console.log(`  Starting ${timeout} ms wait for build to complete at ${interval} ms interval, ${retries} retries`);

        try {

            // Probe the build status until it finishes, or there are no more retries left
            while (!done && retries > 0) {

                // Get build task's status
                const buildTask = await this.get(`builds/${buildId}`);
                const { status } = buildTask;

                console.log(`  -> Build ${buildId} is currently in status: ${status} | ${retries} retries left`);

                // If the build completed, exit and return status
                if (status === 'done' || status === 'failed') {
                    done = true;
                    return status;
                }

                // If incomplete, wait for 1 interval and try again
                retries--;
                await _wait(interval);
            }
        } catch (e) {
            console.error('error in wait for build');
            throw e;
        }
    }

    /**
     * _Internal_
     */
    _getUrl(endpoint) {
        return `${this.baseUrl}/api/${this.apiVersion}/${endpoint}`;
    }

    /**
     * _Internal_
     */
    _getHeaders() {
        return {
            'Authorization': this.token
        };
    }

}

module.exports = SisenseV2Client;

/**
 * _Internal_
 */
function _wait(timeout) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}
