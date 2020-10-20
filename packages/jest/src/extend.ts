import { BigNumber } from 'ethers';
import * as matchers from './matchers';

expect.extend(matchers);

expect.addSnapshotSerializer({
  serialize: (value) => BigNumber.from(value).toString(),
  test: (value) => BigNumber.isBigNumber(value),
});
