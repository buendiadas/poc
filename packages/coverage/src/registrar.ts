import {
  Expression,
  FunctionDefinition,
  IfStatement,
  ModifierDefinition,
  Statement,
} from '@solidity-parser/parser';
import { Injection } from './injector';
import { ParseState } from './parser';

/**
 * Adds injection point to injection points map
 */
export function createInjection(state: ParseState, key: number, value: Partial<Injection>) {
  const injection = {
    ...value,
    contract: state.contract,
  } as Injection;

  if (state.injections[key]) {
    state.injections[key].push(injection);
  } else {
    state.injections[key] = [injection];
  }
}

/**
 * Registers injections for statement measurements
 */
export function registerStatement(state: ParseState, expression: Expression | Statement) {
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
    type: 'Statement',
    id,
  });
}

/**
 * Registers injections for function measurements
 */
export function registerFunction(state: ParseState, expression: FunctionDefinition | ModifierDefinition) {
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
    id,
    type: 'Function',
  });
}

export function registerBranch(state: ParseState, expression: IfStatement) {
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

export function registerBranchLocation(state: ParseState, expression: Statement) {
  const branch = state.branches[state.branch!].locations.length;
  const point = expression.range![0] + (expression.type === 'Block' ? 1 : 0);

  createInjection(state, point, {
    id: state.branch!,
    type: 'Branch',
    branch,
  });

  state.branches[state.branch!].locations.push(expression.loc!);
}
