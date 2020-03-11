/**
 * Sisense Datamodels API Demo - #1 Basic Flow
 * Written by Moti Granovsky, Sisense DevX, January 2020
 *
 * Generates a simple CSV-based datamodel from scratch
 */

const { token, baseUrl, fileNameRx } = require('./shared.js');
const client = new (require('./client.js'))(token, baseUrl);
const uploader = new (require('./upload.js'))(token, baseUrl);
const FILE_PATH = './assets/demo.csv';

async function main() {

    /**
     * Step 1: Upload the CSV file
     */

    console.log(`01. Uploading file ${FILE_PATH}: starting`);

    const uploadResponse = await uploader.upload(FILE_PATH);

    console.log(`01. Uploading file ${FILE_PATH}: done | Uploaded file path: ${uploadResponse.storageInfo.path}`);

    /**
     * Step 2: Create a blank Datamodel
     */

    console.log("02. Creating blank Datamodel: starting");

    const newDatamodel = {
        title: `test-${new Date() * 1}`
    };

    const datamodel = await client.post('datamodels', newDatamodel);

    console.log(`02. Creating blank Datamodel: done | New model title: '${datamodel.title}', oid '${datamodel.oid}'`);

    /**
     * Step 3: Create a CSV Dataset
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

    const csvDataset = await client.post(`datamodels/${datamodel.oid}/schema/datasets`, newDataset);

    console.log(`03. Creating a CSV dataset: done | New CSV dataset oid: '${csvDataset.oid}'`);

    /**
     * Step 4: Create the Customer table from the CSV file
     */

    console.log("04. Creating CSV table: starting");

    const newTable = {
        "id": uploadResponse.storageInfo.path.match(fileNameRx)[0],
        "name": "Customers",
        "description": "Customer table from CSV",
        "hidden": false,
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
        "buildBehavior": {
            "type": "sync"
        },
        "configOptions": {
            "culture": "en-US",
            "delimiter": ",",
            "hasHeader": true,
            "stringQuote": "\""
        }
    };

    let csvTable = await client.post(`datamodels/${datamodel.oid}/schema/datasets/${csvDataset.oid}/tables`, newTable);

    console.log(`04. Creating CSV table: done | New table oid: '${csvTable.oid}'`);

    /**
     * Step 5: Add a custom column and make the name columns invisible
     */

    console.log("05. Modifying CSV table + Creating custom column: starting");

    const { columns } = csvTable;

    columns.forEach((col) => {
        if (col.id === 'first name' || col.id === 'last name') {
            col.hidden = true;
        }
    });

    columns.push({
        "expression": "select [first name] + ' ' + [last name]",
        "indexed": true,
        "name": "full name",
        "isCustom": true,
        "type": 18,
        "id": "full name"
    });

    const updateTable = {
        columns
    };

    csvTable = await client.patch(`datamodels/${datamodel.oid}/schema/datasets/${csvDataset.oid}/tables/${csvTable.oid}`, updateTable);

    console.log("05. Modifying CSV table + Creating custom column: done");

    /**
     * Step 6: Create custom dataset
     */

    console.log("06. Creating custom dataset: starting");

    const newCustomDataset = {
        "name": `test-${new Date() * 1}`,
        "type": "custom"
    };

    const customDataset = await client.post(`datamodels/${datamodel.oid}/schema/datasets`, newCustomDataset);

    console.log(`06. Creating custom dataset: done | New custom Dataset oid: '${customDataset.oid}'`);

    /**
     * Step 7: Create the country codes table
     */

    console.log("07. Creating custom table: starting");

    const newCustomTable = {
        "id": `custom-${new Date() * 1}`,
        "name": "custom1",
        "type": "custom",
        "description": "Custom table",
        "expression": "select 'UK' as Country, 'UK' as Code UNION\nselect 'Canada' as Country, 'CA' as Code UNION\nselect 'Iceland' as Country, 'IC' as Code UNION\nselect 'USA' as Country, 'US' as Code"
    };

    const customTable = await client.post(`datamodels/${datamodel.oid}/schema/datasets/${customDataset.oid}/tables`, newCustomTable);

    console.log(`07. Creating custom table: done | New custom table oid: '${customTable.oid}'`);

    /**
     * Step 8: Create a relation
     */

    console.log("08. Linking CSV and custom tables: starting");

    // Find the "country" column in the customer/csv table
    const customerCountryColumnOid = csvTable.columns.find(col => col.id === 'country').oid;

    // Find the "country" column in the countries/custom table
    const countriesCountryColumnOid = customTable.columns.find(col => col.name === 'Country').oid;

    const newRelation = {
        "columns": [
            {
                "dataset": csvDataset.oid,
                "table": csvTable.oid,
                "column": customerCountryColumnOid
            },
            {
                "dataset": customDataset.oid,
                "table": customTable.oid,
                "column": countriesCountryColumnOid
            }
        ]
    };

    await client.post(`datamodels/${datamodel.oid}/schema/relations`, newRelation);

    console.log("08. Linking CSV and custom tables: done");

    /**
     * Step 9: Run a full build
     */

    console.log("09. Initiating full build: starting");

    const newBuildTask = {
        "datamodelId": datamodel.oid,
        "buildType": "full",
        "rowLimit": 0
    };

    const buildTask = await client.post('builds', newBuildTask);

    console.log(`09. Initiating full build: initated | Build task oid: '${buildTask.oid}'`);

    /**
     * Step 10: Wait for build task to finish
     */

    console.log("10. Wait for build to complete: starting");

    const buildResult = await client.waitForBuild(buildTask.oid);

    console.log(`10. Wait for build to complete: done | Build outcome: '${buildResult}'`);

    return buildResult;
}

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

main().then(console.log).catch(console.error);
