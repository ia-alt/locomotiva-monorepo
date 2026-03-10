import fs from 'node:fs';
import { minifyContractRouter } from '@orpc/contract';
import { router } from '../src/modules/_core/presentation/orpc-server/router';

const minifiedRouter = minifyContractRouter(router);
fs.writeFileSync('./contract.json', JSON.stringify(minifiedRouter, null, 2));
