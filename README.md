# Flashpoint MCP
## Setup
### Node
Install Node.JS and run `npm install`
### Postgres
OS dependant, enter credentials into .env, make sure the database with the name exists
### Minio (Optional)
For remote file storage. Set `DRIVE_DISK` in .env to `minio` and fill in the minio details.
## Usage
`npm run dev` OR `npm run build` and `npm run start`