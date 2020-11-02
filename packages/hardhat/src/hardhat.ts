import deepmerge from 'deepmerge';
import { HardhatArguments, HardhatConfig, HardhatNetworkConfig } from 'hardhat/types';
import { HardhatContext } from 'hardhat/internal/context';
import { Environment } from 'hardhat/internal/core/runtime-environment';
import { loadConfigAndTasks } from 'hardhat/internal/core/config/config-loading';
import { getEnvHardhatArguments } from 'hardhat/internal/core/params/env-variables';
import { HARDHAT_NETWORK_NAME } from 'hardhat/internal/constants';
import { HARDHAT_PARAM_DEFINITIONS } from 'hardhat/internal/core/params/hardhat-params';

export async function hardhat(network: Partial<HardhatNetworkConfig> = {}) {
  if (!HardhatContext.isCreated()) {
    HardhatContext.createHardhatContext();
  }

  const context = HardhatContext.getHardhatContext();
  const config = deepmerge<HardhatConfig>(loadConfigAndTasks(), {
    networks: {
      [HARDHAT_NETWORK_NAME]: network,
    } as any,
  });

  const extenders = context.extendersManager.getExtenders();
  const args = deepmerge<HardhatArguments>(getEnvHardhatArguments(HARDHAT_PARAM_DEFINITIONS, process.env), {
    network: HARDHAT_NETWORK_NAME,
    emoji: false,
    help: false,
    version: false,
  });

  return new Environment(config, args, {}, extenders);
}
