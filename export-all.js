/**
 * Sisense Datamodels API Demo - #3 Export All Schemas
 * Written by Moti Granovsky, Sisense DevX, March 2020
 *
 * Exports all existing Datamodel schemas as .smodel files
 * 
 * **Available on: Sisense Linux L8.0.3.150 or later**
 */

const fs = require('fs');
const { token, baseUrl } = require('./shared.js');
const client = new (require('./client.js'))(token, baseUrl);

const TARGET_FOLDER = './backup';

/**
 * Main script flow
 */
async function main() {

    /**
     * Step 1: Create a folder to export to
     */

    console.log(`01. Create folder ${TARGET_FOLDER} if it didn't exist: starting`);

    if (!fs.existsSync(TARGET_FOLDER)) {
        fs.mkdirSync(TARGET_FOLDER);
    }

    console.log(`01. Create folder ${TARGET_FOLDER} if it didn't exist: done`);

    /**
     * Step 2: Get a list of all datamodel OIDs and titles
     */

    console.log('02. Getting all datamodels: starting');

    const datamodels = await client.get('datamodels/schema', { fields: 'oid, title' });

    console.log(`02. Getting all datamodels: done | found ${datamodels.length} models`);

    /**
     * Step 3: Iterate over all models and export each one
     */

    console.log('03. Exporting all datamodels: starting');

    for (const item of datamodels) {
        await exportAndSave(item);
    }

    console.log('03. Exporting all datamodels: done');

    return true;
}

/**
 * Exports a datamodel using the API and saves it to the target folder
 * @param {object} datamodel Object containing a datamodel `oid` and `title`
 */
async function exportAndSave(datamodel) {

    console.log(`--> Exporting datamodel "${datamodel.title}"`);

    const schema = await client.get(`datamodel-exports/schema`, { datamodelId: datamodel.oid, type: 'schema-latest' });

    console.log(`  > Saving datamodel "${datamodel.title}" as "${TARGET_FOLDER}/${datamodel.title}.smodel"`);

    fs.writeFileSync(`${TARGET_FOLDER}/${datamodel.title}.smodel`, JSON.stringify(schema), { encoding: 'utf8' });

    console.log(`  > Datamodel "${datamodel.title}" downloaded`);

    return true;
}

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

main().then(console.log).catch(console.error);
