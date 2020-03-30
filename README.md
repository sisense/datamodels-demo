# Sisense Datamodels API Demo

This project includes demo scripts using the Sisense Datamodels API, which can be utilized to automate Datamodel creation and maintenance.

> *Note: this demo utilizes the V2 REST API which is currently available only with Sisense for Linux L8.0.2 and higher*

The repository includes all the assets (such as an CSV files) required to set up this demo. Below you will find instructions for set up, customization and contributions.

For more information about the Sisense Datamodels API, please refer to the [Sisense Datamodels API Guide](https://developer.sisense.com/display/API2/Datamodels+API) and the [V2 REST API Reference](https://developer.sisense.com/display/API2/REST+API+Reference+-+v2.0)

#### Table of Contents

Within this document:
 - [Setting up this demo](#setting-up-this-demo)
 - [Included use cases](#included-use-cases)
 - [Extending this demo](#extending-this-demo)

External documents:
 - [License](LICENSE)
 - [Contribution guidelines](CONTRIBUTING.md)

## Setting up this demo

> Make sure you have met the following prerequisites prior to starting:
>  - Have a Sisense L8.0.2 or later version deployed and activated on a Linux server cluster
>  - Have the credentials of a user with sufficient permissions ("Data Designer" or higher) and generated an API token - See [Using the Sisense REST API](https://developer.sisense.com/display/API2/Using+the+REST+API)
>  - Have [NodeJS](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/) installed and up-to-date

1. Clone or download this repository
1. Run `npm install`
1. Rename `shared.js.template` to `shared.js`
1. Configure the API token and Sisense base URL in `shared.js`

## Included Use Cases

This package includes several demo scripts, written in Node.js, that show various operations and use-cases being achieved using the Datamodels API.

### Demo #1: Creating a Datamodel from scratch

This demo script uploads the included `demo.csv` to a Sisense server, and creates a new Datamodel schema based on this CSV file.

**To Run:**

```
node demo.js
```

**What it does**

1. Uploads `demo.csv` to the Sisense server
1. Creates a blank new `extract` type datamodel
1. Creates a CSV type dataset
1. Creates a table from the CSV
1. Adds a custom column to the table and hides 2 other columns
1. Creates a custom dataset
1. Creates a custom table
1. Creates a relation between the CSV table and the custom table
1. Builds the datamodel

### Demo #2: Changing connectivity

This demo script uploads the included `demo.csv` and `demo2.csv` to a Sisense server, creates a new Datamodel schema based on the first CSV file and then changes connectivity to the second CSV file.

**To Run:**

```
node change-connection.js
```

**What it does**

1. Uploads `demo.csv` and `demo2.csv` to the Sisense server
1. Creates a blank new `extract` type datamodel
1. Creates a CSV type dataset
1. Creates a table from the CSV
1. Adds a custom column to the table and hides 2 other columns
1. Updates the dataset connection to `demo2.csv`
1. Updates the table's `id` property according to new CSV file name
1. Builds the datamodel

### Demo #3: Exporting Datamodel Schemas

**Available on: Sisense Linux L8.0.3.150 or later**

This demo script downloads all available Datamodel schemas, without data, as `.smodel` files, which can be imported to Sisense via UI or API, into a folder called `backup`.

**To Run:**

```
node export-all.js
```

**What it does**

1. Creates a folder called `backup` if one doesn't already exist
1. Gets the `OID` and `title` of all available Datamodel entities
1. For each Datamodel found:
    1. Exports the Datamodel
    1. Stores the response JSON as `.smodel`

## Extending this demo

This demo uses Node.js with a minimal set of dependencies, listed below.

A shared configuration file, `shared.js` is used by all of the demo scripts. It contains only constants that are common to all scripts - configuration specific to only one demo script should generally be kept within the script.

Additionally, it contains several helper modules used by the demo scripts:

 - A very simple "client" module is provided in the file `client.js`, to handle the correct formatting of RESTful HTTP requests to the Sisense V2 API. This module takes care of constructing the full requst URI, appending the correct headers and so on.
 - A separate module (`upload.js`) handles validating and uploading files to Sisense for use as file-based data sources (CSV/Excel)

These helper modules should be re-used and extended as needed.

**Dependencies**

All of the dependencies below are used by the demo scripts for convenience **and are not required to use the Sisense Datamodels API**.

| Name | Type | Source | Version | Description |
|------|------|--------|---------|-------------|
| [request](https://www.npmjs.com/package/request) | Node.js | NPM | 2.88.0 | HTTP request library |
| [request-promise-native](https://www.npmjs.com/package/request-promise-native) | Node.js | NPM | 1.0.7 | Native `Promise` based wrapper for `request` |

Additionally, this project lists `eslint` and several plugins for it as a DevDependency used to validate the code format.

**File Structure**

```
./
├── .gitignore                   --> Git tracking ignore list
├── .eslintrc                    --> EsLint configuration
├── .eslintignore                --> EsLint checking ignore list
├── readme.md                    --> This README file
├── LICENSE                      --> License info
├── CONTRIBUTING.md              --> Contribution guidelines
├── package.json                 --> NPM
├── shared.js.template           --> Template for configuration
├── client.js                    --> Shared library for running RESTful requests to the Sisense V2 REST API
├── upload.js                    --> Shared library for uploading CSV/XLSX files to Sisense
├── demo.js                      --> Demo #1 - Create datamodel from scratch
├── change-connection.js         --> Demo #2 - Change connection of a dataset
├── export-all.js                --> Demo #3 - Export all Datamodel schemas
└── assets/                      
    ├── demo.csv                 --> Sample data
    ├── demo2.csv                --> Sample data
    └── tenants.xlsx             --> Sample data
```