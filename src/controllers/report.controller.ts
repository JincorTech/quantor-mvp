import config from '../config';
import { inject, injectable } from 'inversify';
import { Response, Request } from 'express';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import 'reflect-metadata';
import { AuthorizedRequest } from '../requests/authorized.request';
import { Web3ClientInterface, Web3ClientType } from '../services/web3.client';
import { Logger } from '../logger';
import { Report } from '../entities/report';
import { getConnection } from 'typeorm';

@controller(
  '/report',
  'OnlyAcceptApplicationJson'
)
export class ReportController {
  private logger = Logger.getInstance('SECRET_CONTROLLER');

  constructor(
      @inject(Web3ClientType) private web3Client: Web3ClientInterface
  ) { }

  @httpPost(
    '/'
  )
  async addReport(req: AuthorizedRequest, res: Response): Promise<void> {
    if(!req.body.user || !req.body.timestamp || !req.body.md5 || !req.body.url) {
      throw new Error("You must specify all the fields: user, timestamp, hash, url");
    }
    const report = new Report(req.body.user, parseInt(req.body.timestamp), req.body.md5, req.body.url);
    await getConnection().getRepository(Report).save(report);
    const tx = await this.web3Client.addFileProof(report);
    this.logger.info('get info');
    res.json({ report: report, transaction: tx });
  }

  @httpGet(
    '/:fileId'
  )
  async getInfo(req: Request, res: Response): Promise<void> {
    this.logger.info('get info: ', req.params.requestId );
    const result = await this.web3Client.getFileProof(req.params.fileId);
    res.json({
      user: result[0],
      timestamp: result[1],
      md5: result[2],
      url: result[3]
    });
  }

}
