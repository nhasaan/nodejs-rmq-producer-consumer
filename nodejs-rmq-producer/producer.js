#!/usr/bin/env node

// Import required libraries
const amqp = require('amqplib');
const mysql = require('mysql2/promise');

const RMQConfig = require('./rmq-config');
const { mysqlConfig } = require('./mysql-config');

// RabbitMQ connection information
const { rmqConn, rmqQueueName } = RMQConfig;

async function main() {
  console.log('produce message...');

  try {
    // Connect to RabbitMQ
    const rabbitMQConnection = await amqp.connect(rmqConn);
    const channel = await rabbitMQConnection.createChannel();

    // Connect to MySQL
    const mysqlConnection = await mysql.createConnection(mysqlConfig);

    // Message to send to RabbitMQ
    const message = 'Hello, RabbitMQ!';

    // Publish the message to RabbitMQ
    await channel.assertQueue(rmqQueueName, { durable: true });
    channel.sendToQueue(rmqQueueName, Buffer.from(message), {
      persistent: true,
    });

    console.log(`Sent message: ${message}`);

    const sqlQuery = `SELECT * FROM rne_bonus_transactions WHERE status = 'pending'`;

    const result = await mysqlConnection.query(sqlQuery);

    console.log(result[0].length);

    result[0].map((trx) => {
      const transaction = {
        id: trx.id,
        transaction_id: trx.transaction_id,
        referrer_status: trx.referrer_status,
        referee_status: trx.referee_status,
        referrer_msisdn: trx.referrer_msisdn,
        referee_msisdn: trx.referee_msisdn,
        referrer_product_code: trx.referrer_product_code,
        referee_product_code: trx.referee_product_code,
        status: trx.status,
        retry_count: trx.retry_count,
        referrer_disbursement_time: trx.referrer_disbursement_time,
        referee_disbursement_time: trx.referee_disbursement_time,
        created_at: trx.created_at,
        updated_at: trx.updated_at,
      };
      console.log(transaction);
      channel.sendToQueue(rmqQueueName, Buffer.from(transaction), {
        persistent: true,
      });
    });

    // Close connections
    await channel.close();
    await rabbitMQConnection.close();
    await mysqlConnection.end();

    console.log('Message sent and stored in the database.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
