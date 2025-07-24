import pkg from "pg";

const { Client } = pkg;

// Development
// const config = {
//   user: "postgres",
//   password: "13090122",
//   host: "localhost",
//   database: "ppdb",
//   port: 5432,
// };

// Production
const config = {
  user: process.env.P_USER,
  password: process.env.P_PASSWORD,
  host: process.env.P_HOST,
  database: process.env.P_DATABASE,
  port: 5432,
};

const client = new Client(config);

const connect = async () => {
  try {
    await client.connect();
    const result = await client.query(`SELECT NOW() as current_time`);

    console.log(`Connected to ${result.rows[0].current_time}`);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

export { client, connect };
