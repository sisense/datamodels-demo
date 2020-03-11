# Contributing to Sisense Datamodels API Demo

First off, thanks for taking the time to contribute! :+1:

The following is a set of guidelines for contributing to this project on GitHub.
Use your best judgment, and feel free to propose changes to this document in a pull request.

#### Further Questions

For questions that aren't covered by this document as well as the project's `README.md` file and API's online documentation, please contact devexp@sisense.com

#### Table Of Contents

[What should I know before I get started?](#what-should-i-know-before-i-get-started)
  * [Project Purpose](#project-purpose)
  * [Project Requirements](#project-requirements)

[How Can I Contribute?](#how-can-i-contribute)
  * [Git Commit Messages](#git-commit-messages)
  * [Pull Requests](#pull-requests)

## What should I know before I get started?

### Project Purpose

The purpose of this project is to demonstrate the correct use of the Sisense Datamodels API to programmatically create and modify Sisense Datamodels.

The project is **not** intended to demonstrate how to build or design a full automated solution based on these APIs, neither is it intended to meet specific business requirements or be used as a plug-and-play solution for a production project.

### Project Requirements

This demo was designed to meet the following requirements. Any contributions should strive to meet the same requirements, although exceptions may be considered.

**1. The demo should be as easy as possible to deploy**

As such, it should only require a minimal set of assets needed to demonstrate the API's capabilities. For example: The demo scripts use CSV data sources as they do not require setting up a database instance and can be easily included in the repository.

In addition, as few tools and setup steps as possible should be required to complete setup of this demo.

**2. The demo should cover as much of the API functionality as possible**

In order to provide an opportunity for learning the various capabilities of the API, while maintaining a reasonable business/user story behind the application.

## How Can I Contribute?

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Keep it short and descriptive

### Pull Requests

Please follow these steps to have your contribution considered by the maintainers:

1. Read this document, as well as the project's `README.md` and all inline code comments thoroughly
1. Keep the requirements listed above in mind
1. Do not introduce new dependencies to the project (exceptions may be considered - please elaborate in pull request description)
1. Ensure your code uses a similar design and layout to existing project code
1. Run `npm run lint` and ensure your code generates no eslint errors
1. Document your code with valid JSDoc format comments, as well as changes to the `README` when applicable
1. Code and comments should be in clear English and must be written in a civil, respectful language
1. Submit a pull request with a detailed description of changes and their purpose

While the prerequisites above must be satisfied prior to having your pull request reviewed, the reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.