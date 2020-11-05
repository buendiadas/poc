import {
  ASTNode,
  Block,
  FunctionDefinition,
  IfStatement,
  LineColumn,
  ModifierDefinition,
} from '@solidity-parser/parser';
import { BranchMapping, FunctionMapping, Range } from 'istanbul-lib-coverage';
import { Injection } from './injector';

export interface RegisteredStatement {
  start: LineColumn;
  end: LineColumn;
}

export type Injections = Record<number, Injection[]>;

export interface RegistrarStateItem<TRecords> {
  id: number;
  map: TRecords;
}

export interface RegistrarState {
  ast: ASTNode;
  source: string;
  contract: string;
  injections: Injections;
  functions: FunctionMapping[];
  branches: BranchMapping[];
  statements: Range[];
}

/**
 * Adds injection point to injection points map
 */
export function createInjection(state: RegistrarState, key: number, value: Partial<Injection>) {
  value.contract = state.contract;

  if (state.injections[key]) {
    state.injections[key].push(value as Injection);
  } else {
    state.injections[key] = [value as Injection];
  }
}

/**
 * Registers injections for statement measurements
 */
export function registerStatement(state: RegistrarState, expression: ASTNode) {
  const startContract = state.source.slice(0, expression.range![0]);
  const startline = (startContract.match(/\n/g) || []).length + 1;
  const startcol = expression.range![0] - startContract.lastIndexOf('\n') - 1;

  const expressionContent = state.source.slice(expression.range![0], expression.range![1] + 1);
  const endline = startline + (expressionContent.match(/\n/g) || []).length;

  let endcol;
  if (expressionContent.lastIndexOf('\n') >= 0) {
    endcol = state.source.slice(expressionContent.lastIndexOf('\n'), expression.range![1]).length;
  } else {
    endcol = startcol + expressionContent.length + 1;
  }

  const id =
    state.statements.push({
      start: {
        line: startline,
        column: startcol,
      },
      end: {
        line: endline,
        column: endcol,
      },
    }) - 1;

  createInjection(state, expression.range![0], {
    id,
    type: 'Statement',
  });
}

/**
 * Registers injections for function measurements
 */
export function registerFunctionDeclaration(
  state: RegistrarState,
  expression: FunctionDefinition | ModifierDefinition,
) {
  const name =
    expression.type === 'FunctionDefinition' && expression.isConstructor ? 'constructor' : expression.name ?? '';

  const id =
    state.functions.push({
      name,
      line: expression.loc!.start.line,
      loc: expression.loc!,
      decl: {
        start: expression.loc!.start,
        end: expression.body!.loc!.start,
      },
    }) - 1;

  createInjection(state, expression.body!.range![0] + 1, {
    id: id,
    type: 'Function',
  });
}

export function registerBranch(state: RegistrarState, expression: IfStatement) {
  const startContract = state.source.slice(0, expression.range![0]);
  const startline = (startContract.match(/\n/g) || []).length + 1;
  const startcol = expression.range![0] - startContract.lastIndexOf('\n') - 1;
  const loc = {
    start: {
      line: startline,
      column: startcol,
    },
    end: {
      line: startline,
      column: startcol,
    },
  };

  const id =
    state.branches.push({
      line: startline,
      type: 'if',
      loc: loc,
      locations: [],
    }) - 1;

  return id;
}

export function registerBranchLocation(state: RegistrarState, expression: Block, id: number) {
  const branch = state.branches[id].locations.length;
  createInjection(state, expression.range![0] + 1, {
    id,
    type: 'Branch',
    branch,
  });

  state.branches[id].locations.push(expression.loc!);
}
