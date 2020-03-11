/**
 * Sisense Datamodels API Demo - #2 Change connectivity
 * Written by Moti Granovsky, Sisense DevX, January 2020
 *
 * Generates a simple CSV-based datamodel and then changes a table's connection to a different CSV file
 */

const { token, baseUrl, fileNameRx } = require('./shared.js');

const FILE_PATH_1 = './assets/demo.csv';
const FILE_PATH_2 = './assets/demo2.csv';
const client = new (require('./client.js'))(token, baseUrl);
const uploader = new (require('./upload.js'))(token, baseUrl);

async function main() {

    /**
     * Step 1: Upload the CSV files
     */

    console.log("01. Uploading 2 files: starting");

    console.log(`  -> Uploading file ${FILE_PATH_1}`);
    const uploadResponse = await uploader.upload(FILE_PATH_1);
    console.log(`  -> Uploaded file ${FILE_PATH_1} | Uploaded file path: ${uploadResponse.storageInfo.path}`);

    console.log(`  -> Uploading file ${FILE_PATH_2}`);
    const uploadResponse2 = await uploader.upload(FILE_PATH_1);
    console.log(`  -> Uploaded file ${FILE_PATH_2} | Uploaded file path: ${uploadResponse2.storageInfo.path}`);

    console.log("01. Uploading 2 files: done");

    /**
     * Step 2: Create a new Datamodel
     */

    console.log("02. Creating blank Datamodel: starting");

    const newDatamodel = {
        title: `test-${new Date() * 1}`
    };

    const datamodel = await client.post('datamodels', newDatamodel);

    console.log(`02. Creating blank Datamodel: done | New model title: '${datamodel.title}', oid '${datamodel.oid}'`);

    /**
     * Step 3: Create CSV Dataset
     */

    console.log("03. Creating a CSV dataset: starting");

    const newDataset = {
        "name": `test-${new Date() * 1}`,
        "type": "extract",
        "connection": {
            "provider": "CSV",
            "schema": uploadResponse.storageInfo.path,
            "fileName": uploadResponse.filename + uploadResponse.extension,
            "parameters": {
                "ApiVersion": "2",
                "files": [
                    uploadResponse.storageInfo.path
                ]
            }
        }
    };

    let csvDataset = await client.post(`datamodels/${datamodel.oid}/schema/datasets`, newDataset);

    console.log(`03. Creating a CSV dataset: done | New CSV dataset oid: '${csvDataset.oid}'`);

    /**
     * Step 4: Create a table
     */

    console.log("04. Creating CSV table: starting");

    const newTable = {
        "id": uploadResponse.storageInfo.path.match(fileNameRx)[0],
        "name": "Customers",
        "columns": [
            {
                "id": "id",
                "name": "id",
                "indexed": true,
                "type": 8
            },
            {
                "id": "first name",
                "name": "first name",
                "indexed": true,
                "type": 18
            },
            {
                "id": "last name",
                "name": "last name",
                "indexed": true,
                "type": 18
            },
            {
                "id": "country",
                "name": "country",
                "indexed": true,
                "type": 18
            }
        ],
        "hidden": false,
        "buildBehavior": {
            "type": "sync"
        },
        "configOptions": {
            "culture": "en-US",
            "delimiter": ",",
            "hasHeader": true,
            "stringQuote": "\""
        },
        "description": "Customer table from CSV"
    };

    let csvTable = await client.post(`datamodels/${datamodel.oid}/schema/datasets/${csvDataset.oid}/tables`, newTable);

    console.log(`04. Creating CSV table: done | New table oid: '${csvTable.oid}'`);

    /**
     * Step 5: Update the Dataset's connection property to the new CSV file
     */

    console.log("05. Modifying dataset connection: starting");

    const newConnection = csvDataset.connection;

    newConnection.schema = uploadResponse2.storageInfo.path;
    newConnection.fileName = uploadResponse2.filename + uploadResponse.extension;
    newConnection.parameters = {
        "ApiVersion": "2",
        "files": [
            uploadResponse2.storageInfo.path
        ]
    };

    csvDataset = await client.patch(`datamodels/${datamodel.oid}/schema/datasets/${csvDataset.oid}`, { "connection": newConnection });

    console.log("05. Modifying dataset connection: done");

    /**
     * Step 6: Update the `id` property of the dependant table (only applicable to some source types)
     */

    console.log("06. Updating CSV table with new id: starting");

    const updateTable = {
        "id": uploadResponse2.storageInfo.path.match(fileNameRx)[0]
    };

    csvTable = await client.patch(`datamodels/${datamodel.oid}/schema/datasets/${csvDataset.oid}/tables/${csvTable.oid}`, updateTable);

    console.log("06. Updating CSV table with new id: done");

    /**
     * Step 7: Start a build
     */

    console.log("07. Initiating full build: starting");

    const newBuildTask = {
        "datamodelId": datamodel.oid,
        "buildType": "full",
        "rowLimit": 0
    };

    const buildTask = await client.post('builds', newBuildTask);

    console.log(`07. Initiating full build: initated | Build task oid: '${buildTask.oid}'`);

    /**
     * Step 8: Wait for build task to complete
     */

    console.log("08. Wait for build to complete: starting");

    const buildResult = await client.waitForBuild(buildTask.oid);

    console.log(`08. Wait for build to complete: done | Build outcome: '${buildResult}'`);

    return buildResult;
}

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

main().then(console.log).catch(console.error);
