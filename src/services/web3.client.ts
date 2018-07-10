import { injectable } from 'inversify';

const Web3 = require('web3');
const net = require('net');

const bip39 = require('bip39');
import config from '../config';
import 'reflect-metadata';
import { Logger } from '../logger';
import { Report } from '../entities/report';
import {ObjectID} from "typeorm";

export interface Web3ClientInterface {

    sendTransactionByPrivateKey(input: TransactionInput, privateKey: string): Promise<string>;

    addFileProof(report: Report): any;

    getFileProof(fileId: string): any;

    sufficientBalance(input: TransactionInput): Promise<boolean>;

    getCurrentGasPrice(): Promise<string>;

    investmentFee(): Promise<any>;

    isHex(key: any): boolean;
}

/* istanbul ignore next */
@injectable()
export class Web3Client implements Web3ClientInterface {
    private logger = Logger.getInstance('WEB3CLIENT');

    fileproof: any;
    web3: any;

    constructor() {
        switch (config.rpc.type) {
            case 'ipc':
                this.web3 = new Web3(new Web3.providers.IpcProvider(config.rpc.address, net));
                break;
            case 'ws':
                const webSocketProvider = new Web3.providers.WebsocketProvider(config.rpc.address);

                webSocketProvider.connection.onclose = () => {
                    this.logger.info('Web3 socket connection closed');
                    this.onWsClose();
                };

                this.web3 = new Web3(webSocketProvider);
                break;
            case 'http':
                this.web3 = new Web3(config.rpc.address);
                break;
            default:
                throw Error('Unknown Web3 RPC type!');
        }

        this.createContracts();
    }

    sendTransactionByPrivateKey(input: TransactionInput, privateKey: string): Promise<string> {
        const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);

        const params = {
            value: this.web3.utils.toWei(input.amount.toString()),
            from: account.address,
            to: input.to,
            gas: input.gas,
            gasPrice: this.web3.utils.toWei(input.gasPrice, 'gwei')
        };

        return new Promise<string>((resolve, reject) => {
            account.signTransaction(params).then(transaction => {
                this.web3.eth.sendSignedTransaction(transaction.rawTransaction)
                    .on('transactionHash', transactionHash => {
                        resolve(transactionHash);
                    })
                    .on('error', (error) => {
                        reject(error);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        });
    }

    addFileProof(report: Report) {
        return new Promise(async(resolve, reject) => {
            const account = this.web3.eth.accounts.privateKeyToAccount(config.contracts.fileproof.ownerPk);
            const modifiedId = this.getBytes32Id(report.id.toHexString());
            const params = {
                value: '0',
                to: this.fileproof.options.address,
                gas: 200000,
                nonce: await this.web3.eth.getTransactionCount(account.address, 'pending'),
                data: this.fileproof.methods.addFile(modifiedId, report.user, report.timestamp, report.hash, report.fileUrl).encodeABI()
            };

            account.signTransaction(params).then(transaction => {
                this.web3.eth.sendSignedTransaction(transaction.rawTransaction)
                    .on('transactionHash', transactionHash => {
                        resolve(transactionHash);
                    })
                    .on('error', (error) => {
                        reject(error);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        });
    }

    getFileProof(fileId: string) {
        return this.fileproof.methods.getFile(fileId).call();
    }

    async getEthBalance(address: string): Promise<string> {
        return this.web3.utils.fromWei(
            await this.web3.eth.getBalance(address)
        );
    }

    sufficientBalance(input: TransactionInput): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.web3.eth.getBalance(input.from)
                .then((balance) => {
                    const BN = this.web3.utils.BN;
                    const txFee = new BN(input.gas).mul(new BN(this.web3.utils.toWei(input.gasPrice, 'gwei')));
                    const total = new BN(this.web3.utils.toWei(input.amount)).add(txFee);
                    resolve(total.lte(new BN(balance)));
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    onWsClose() {
        this.logger.error('Web3 socket connection closed. Trying to reconnect');
        const webSocketProvider = new Web3.providers.WebsocketProvider(config.rpc.address);
        webSocketProvider.connection.onclose = () => {
            this.logger.info('Web3 socket connection closed');
            setTimeout(() => {
                this.onWsClose();
            }, config.rpc.reconnectTimeout);
        };

        this.web3.setProvider(webSocketProvider);
        this.createContracts();
    }

    createContracts() {
        this.fileproof = new this.web3.eth.Contract(config.contracts.fileproof.abi, config.contracts.fileproof.address);
    }

    async getCurrentGasPrice(): Promise<string> {
        return this.web3.utils.fromWei(await this.web3.eth.getGasPrice(), 'gwei');
    }

    getBytes32Id(id: string): string {
        return this.web3.utils.padRight('0x' + id, 32, '0');
    }

    async investmentFee(): Promise<any> {
        const gasPrice = await this.getCurrentGasPrice();
        const gas = config.web3.defaultInvestGas;
        const BN = this.web3.utils.BN;

        return {
            gasPrice,
            gas,
            expectedTxFee: this.web3.utils.fromWei(
                new BN(gas).mul(new BN(this.web3.utils.toWei(gasPrice, 'gwei'))).toString()
            )
        };
    }

    isHex(key: any): boolean {
        return this.web3.utils.isHex(key);
    }
}

const Web3ClientType = Symbol('Web3ClientInterface');
export {Web3ClientType};