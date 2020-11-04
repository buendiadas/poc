import { v4 as uuid } from 'uuid';
import { utils } from 'ethers';
import { ParseResult } from './parser';
import { Injections } from './registrar';

export interface Instrumentation {
  id: number;
  type: string;
  target: string;
  locationId?: number;
}

export type Instrumentations = Record<string, Instrumentation>;

export interface InjectionBase {
  type: string;
  contract: string;
}

export interface HashMethodInjection extends InjectionBase {
  type: 'HashMethod';
}

export interface FunctionInjection extends InjectionBase {
  type: 'Function';
  functionId: number;
}

export interface StatementInjection extends InjectionBase {
  type: 'Statement';
  statementId: number;
}

export interface BranchInjection extends InjectionBase {
  type: 'Branch' | 'EmptyBranch';
  branchId: number;
  locationId: 0 | 1;
}

export interface RequireInjection extends InjectionBase {
  type: 'RequirePre' | 'RequirePost';
  branchId: number;
}

export type Injection =
  | HashMethodInjection
  | BranchInjection
  | RequireInjection
  | FunctionInjection
  | StatementInjection;

export interface InjectionResult extends ParseResult {
  file: string;
  instrumented: string;
  instrumentation: Instrumentations;
  injections: Injections;
}

export function inject(input: ParseResult) {
  const state: InjectionResult = {
    ...input,
    instrumented: input.source,
    instrumentation: {},
  };

  const points = ((Object.keys(state.injections) as any) as number[]).sort((a, b) => b - a);
  points.forEach((point) => {
    state.injections[point].sort((a, b) => {
      const injections = ['Branch', 'EmptyBranch'];
      return injections.indexOf(b.type) - injections.indexOf(a.type);
    });

    state.injections[point].forEach((injection) => {
      switch (injection.type) {
        case 'Statement':
          return injectStatement(state, point, injection);
        case 'Function':
          return injectFunction(state, point, injection);
        case 'Branch':
          return injectBranch(state, point, injection);
        case 'EmptyBranch':
          return injectEmptyBranch(state, point, injection);
        case 'RequirePre':
          return injectRequirePre(state, point, injection);
        case 'RequirePost':
          return injectRequirePost(state, point, injection);
        case 'HashMethod':
          return injectHashMethod(state, point, injection);
      }
    });
  });

  return state;
}

function split(state: InjectionResult, point: number) {
  return {
    start: state.instrumented.slice(0, point),
    end: state.instrumented.slice(point),
  };
}

function getHash(id: string) {
  return utils.id(`${id}:${uuid()}`);
}

function getMethodIdentifier(id: string) {
  return `c_${utils.id(id).slice(0, 10)}`;
}

function getHashMethodDefinition(id: string) {
  const hash = utils.id(id).slice(0, 10);
  const method = getMethodIdentifier(id);
  return `\nfunction ${method}(bytes32 c__${hash}) public pure {}\n`;
}

function getInjectable(id: string, hash: string, type: string) {
  return `${getMethodIdentifier(id)}(${hash}); /* ${type} */ \n`;
}

function getInjectionComponents(state: InjectionResult, point: number, id: string, type: string) {
  const { start, end } = split(state, point);
  const hash = getHash(id);
  const injectable = getInjectable(id, hash, type);

  return {
    start: start,
    end: end,
    hash: hash,
    injectable: injectable,
  };
}

function injectStatement(state: InjectionResult, point: number, injection: StatementInjection) {
  const type = 'statement';
  const id = `${state.file}:${injection.contract}`;

  const { start, end, hash, injectable } = getInjectionComponents(state, point, id, type);

  state.instrumentation[hash] = {
    id: injection.statementId!,
    type: type,
    target: state.file,
  };

  state.instrumented = `${start}${injectable}${end}`;
}

function injectFunction(state: InjectionResult, point: number, injection: FunctionInjection) {
  const type = 'function';
  const id = `${state.file}:${injection.contract}`;

  const { start, end, hash, injectable } = getInjectionComponents(state, point, id, type);

  state.instrumentation[hash] = {
    id: injection.functionId!,
    type: type,
    target: state.file,
  };

  state.instrumented = `${start}${injectable}${end}`;
}

function injectBranch(state: InjectionResult, point: number, injection: BranchInjection) {
  const type = 'branch';
  const id = `${state.file}:${injection.contract}`;

  const { start, end, hash, injectable } = getInjectionComponents(state, point, id, type);

  state.instrumentation[hash] = {
    id: injection.branchId!,
    type: type,
    locationId: injection.locationId,
    target: state.file,
  };

  state.instrumented = `${start}${injectable}${end}`;
}

function injectEmptyBranch(state: InjectionResult, point: number, injection: BranchInjection) {
  const type = 'branch';
  const id = `${state.file}:${injection.contract}`;

  const { start, end, hash, injectable } = getInjectionComponents(state, point, id, type);

  state.instrumentation[hash] = {
    id: injection.branchId!,
    type: type,
    locationId: injection.locationId,
    target: state.file,
  };

  state.instrumented = `${start}else { ${injectable}}${end}`;
}

function injectRequirePre(state: InjectionResult, point: number, injection: RequireInjection) {
  const type = 'requirePre';
  const id = `${state.file}:${injection.contract}`;

  const { start, end, hash, injectable } = getInjectionComponents(state, point, id, type);

  state.instrumentation[hash] = {
    id: injection.branchId!,
    type: type,
    target: state.file,
  };

  state.instrumented = `${start}${injectable}${end}`;
}

function injectRequirePost(state: InjectionResult, point: number, injection: RequireInjection) {
  const type = 'requirePost';
  const id = `${state.file}:${injection.contract}`;

  const { start, end, hash, injectable } = getInjectionComponents(state, point, id, type);

  state.instrumentation[hash] = {
    id: injection.branchId!,
    type: type,
    target: state.file,
  };

  state.instrumented = `${start}${injectable}${end}`;
}

function injectHashMethod(state: InjectionResult, point: number, injection: HashMethodInjection) {
  const start = state.instrumented.slice(0, point);
  const end = state.instrumented.slice(point);
  const id = `${state.file}:${injection.contract}`;
  state.instrumented = `${start}${getHashMethodDefinition(id)}${end}`;
}
