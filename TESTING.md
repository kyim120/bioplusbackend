# Backend Testing Instructions

This document describes how to run the integration tests for the backend API.

## Prerequisites

- Node.js (version >= 16)
- npm installed
- MongoDB is not required locally as tests use an in-memory database

## Installing Dependencies

```bash
npm install
```

## Running Tests

Tests are written using [Jest](https://jestjs.io/) and [Supertest](https://github.com/visionmedia/supertest) for HTTP endpoint testing.

To run all tests, run:

```bash
npm test
```

This runs Jest with the configuration set up for the backend. It automatically uses the in-memory MongoDB for tests.

## Adding New Tests

- Tests are located in the `backend/tests` directory.
- Use `supertest` to send requests to the Express app.
- Use the `authHelper.js` file in tests for generating auth tokens for different user roles.
- Tests connect to an in-memory MongoDB instance managed by `setup.js` to isolate test data.

## Notes

- Ensure the backend dependencies are installed.
- The backend server does not need to be running to execute the tests.
- Tests will spin up the server app directly.

For any issues or help, please consult the backend developers.
