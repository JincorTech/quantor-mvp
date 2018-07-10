require('dotenv').config();
import 'reflect-metadata';

const {
  CLIENT_IP_FORWARD_HEADER,
  LOGGING_LEVEL,
  LOGGING_FORMAT,
  LOGGING_COLORIZE,
  REDIS_URL,
  REDIS_PREFIX,
  HTTP_SERVER,
  PORT,
  HTTPS_PORT,
  HTTPS_SERVER,
  FORCE_HTTPS,
  THROTTLER_WHITE_LIST,
  THROTTLER_INTERVAL,
  THROTTLER_MAX,
  THROTTLER_MIN_DIFF,
  ORM_ENTITIES_DIR,
  ORM_SUBSCRIBER_DIR,
  ORM_MIGRATIONS_DIR,
  API_URL,
  AUTH_JWT,
  AUTH_BASE_URL,
  MONGO_URL,
  ACCESS_LOG,
  SERVICE_NAME,
  WEB3_RESTORE_START_BLOCK,
  WEB3_BLOCK_OFFSET,
  DEFAULT_INVEST_GAS,
  PURCHASE_GAS_LIMIT,
  SC_ADDRESS,
  SC_OWNER_PK,
  RPC_TYPE,
  RPC_ADDRESS
} = process.env;

export default {
  web3: {
    startBlock: parseInt(WEB3_RESTORE_START_BLOCK, 10) || 1,
    blockOffset: parseInt(WEB3_BLOCK_OFFSET, 10) || 200,
    defaultInvestGas: parseInt(DEFAULT_INVEST_GAS, 10) || 130000,
    purchaseGasLimit: parseInt(PURCHASE_GAS_LIMIT, 10) || 100000
  },
  app: {
    clientIpHeader: CLIENT_IP_FORWARD_HEADER || 'x-forwarded-for',
    serviceName: SERVICE_NAME || 'secret_tech',
    port: parseInt(PORT, 10) || 3000,
    httpsPort: parseInt(HTTPS_PORT, 10) || 4000,
    httpServer: HTTP_SERVER || 'enabled',
    httpsServer: HTTPS_SERVER || 'disabled',
    forceHttps: FORCE_HTTPS || 'disabled',
    apiUrl: API_URL,
    accessLog: ACCESS_LOG || true
  },
  logging: {
    level: LOGGING_LEVEL || 'warn',
    format: LOGGING_FORMAT || 'text',
    colorize: LOGGING_COLORIZE || false
  },
  redis: {
    url: REDIS_URL || 'redis://redis:6379',
    prefix: REDIS_PREFIX || 'backend_boilerplate_'
  },
  throttler: {
    prefix: 'request_throttler_',
    interval: THROTTLER_INTERVAL || 1000, // time window in milliseconds
    maxInInterval: THROTTLER_MAX || 5, // max number of allowed requests from 1 IP in "interval" time window
    minDifference: THROTTLER_MIN_DIFF || 0, // optional, minimum time between 2 requests from 1 IP
    whiteList: THROTTLER_WHITE_LIST ? THROTTLER_WHITE_LIST.split(',') : [] // requests from these IPs won't be throttled
  },
  auth: {
    baseUrl: AUTH_BASE_URL || 'http://auth:3000',
    token: AUTH_JWT
  },
  typeOrm: {
    type: 'mongodb',
    synchronize: true,
    logging: false,
    url: MONGO_URL,
    entities: [
      ORM_ENTITIES_DIR
    ],
    migrations: [
      ORM_MIGRATIONS_DIR
    ],
    subscribers: [
      ORM_SUBSCRIBER_DIR
    ]
  },
  rpc: {
    type: RPC_TYPE,
    address: RPC_ADDRESS,
    reconnectTimeout: 5000 // in milliseconds
  },
  contracts: {
    fileproof: {
      abi: [{"constant":false,"inputs":[{"name":"_id","type":"bytes32"},{"name":"user","type":"string"},{"name":"timestamp","type":"uint256"},{"name":"hash","type":"string"},{"name":"fileUrl","type":"string"}],"name":"addFile","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"bytes32"}],"name":"getFile","outputs":[{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"files","outputs":[{"name":"user","type":"string"},{"name":"timestamp","type":"uint256"},{"name":"hash","type":"string"},{"name":"fileUrl","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}],
      address: SC_ADDRESS || '',
      ownerPk: SC_OWNER_PK || ''
    }
  }
};
