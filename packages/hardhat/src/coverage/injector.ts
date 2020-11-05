import { v4 as uuid } from 'uuid';
import { utils } from 'ethers';
import { ParseResult } from './parser';
import { Injections } from './registrar';

export interface InstrumentationBase {
  type: string;
  id: number;
  target: string;
}

export interface StatementInstrumentation extends InstrumentationBase {
  type: 'statement';
}

export interface BranchInstrumentation extends InstrumentationBase {
  type: 'branch';
  branch: number;
}

export interface FunctionInstrumentation extends InstrumentationBase {
  type: 'function';
}

export type Instrumentation = StatementInstrumentation | BranchInstrumentation | FunctionInstrumentation;
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
  id: number;
}

export interface StatementInjection extends InjectionBase {
  type: 'Statement';
  id: number;
}

export interface BranchInjection extends InjectionBase {
  type: 'Branch';
  id: number;
  branch: number;
}

export type Injection = HashMethodInjection | BranchInjection | FunctionInjection | StatementInjection;

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
    state.injections[point].forEach((injection) => {
      switch (injection.type) {
        case 'Statement':
          return injectStatement(state, point, injection);
        case 'Function':
          return injectFunction(state, point, injection);
        case 'Branch':
          return injectBranch(state, point, injection);
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
  return `function ${method}(bytes32 c__${hash}) private pure {} /* hash method */`;
}

function getInjectable(id: string, hash: string, type: string) {
  return `${getMethodIdentifier(id)}(${hash});/* ${type} */`;
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
    id: injection.id!,
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
    id: injection.id!,
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
    id: injection.id!,
    type: type,
    branch: injection.branch,
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
