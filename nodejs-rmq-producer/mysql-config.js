const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: '1qazZAQ!',
  database: 'bl_cms_db',
};

const mysqlPoolConfig = {
  ...mysqlConfig,
  connectionLimit: 10,
};

module.exports = { mysqlConfig, mysqlPoolConfig };
