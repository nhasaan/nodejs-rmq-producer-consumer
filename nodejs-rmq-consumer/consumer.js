#!/usr/bin/env node

// Import required libraries
const amqp = require('amqplib');
const mysql = require('mysql2/promise');
const RMQConfig = require('./rmq-config');
const mysqlConfig = require('./mysql-config');

// RabbitMQ connection information
const { rmqConn, rmqQueueName } = RMQConfig;

async function main() {
  try {
    // Connect to RabbitMQ
    const rabbitMQConnection = await amqp.connect(rmqConn);
    const channel = await rabbitMQConnection.createChannel();

    // Connect to MySQL
    const mysqlConnection = await mysql.createConnection(mysqlConfig);

    // Ensure the MySQL table exists
    // await mysqlConnection.query(`
    //   SELECT * FROM rne_bonus_transactions
    // `);

    // Assert the RabbitMQ queue
    await channel.assertQueue(rmqQueueName, { durable: true });

    // Consume messages from RabbitMQ
    channel.consume(rmqQueueName, async (message) => {
      if (message !== null) {
        const content = message.content.toString();
        console.log(`Received message: ${content}`);

        // Store the message in MySQL
        console.log(
          // await mysqlConnection.query('SELECT * FROM rne_bonus_transactions')
          'apihub call here',
          'update query here'
        );

        // Acknowledge the message
        channel.ack(message);
      }
    });

    console.log('Waiting for messages. Press Ctrl+C to exit.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
