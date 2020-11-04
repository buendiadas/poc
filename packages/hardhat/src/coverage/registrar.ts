import { ASTNode, FunctionDefinition, IfStatement, LineColumn, ModifierDefinition } from '@solidity-parser/parser';
import { BranchMapping, FunctionMapping, Range } from 'istanbul-lib-coverage';
import { Injection } from './injector';

export interface RegisteredStatement {
  start: LineColumn;
  end: LineColumn;
}

export type RegisteredFunctions = Record<number, FunctionMapping>;
export type RegisteredBranches = Record<number, BranchMapping>;
export type RegisteredStatements = Record<number, Range>;
export type Injections = Record<number, Injection[]>;

export interface RegistrarStateItem<TRecords> {
  id: number;
  map: TRecords;
}

export interface RegistrarState {
  ast: ASTNode;
  source: string;
  tracking: boolean;
  contract: string;
  injections: Injections;
  functions: RegistrarStateItem<RegisteredFunctions>;
  branches: RegistrarStateItem<RegisteredBranches>;
  statements: RegistrarStateItem<RegisteredStatements>;
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
  if (!state.tracking) {
    return;
  }

  if (!expression.range) {
    return;
  }

  const startContract = state.source.slice(0, expression.range[0]);
  const startline = (startContract.match(/\n/g) || []).length + 1;
  const startcol = expression.range[0] - startContract.lastIndexOf('\n') - 1;
  const expressionContent = state.source.slice(expression.range[0], expression.range[1] + 1);
  const endline = startline + (expressionContent.match('/\n/g') || []).length;

  let endcol;
  if (expressionContent.lastIndexOf('\n') >= 0) {
    endcol = state.source.slice(expressionContent.lastIndexOf('\n'), expression.range[1]).length;
  } else {
    endcol = startcol + (expressionContent.length - 1);
  }

  const id = ++state.statements.id;
  state.statements.map[id] = {
    start: { line: startline, column: startcol },
    end: { line: endline, column: endcol },
  };

  createInjection(state, expression.range[0], {
    type: 'Statement',
    statementId: id,
  });
}

/**
 * Registers injections for function measurements
 */
export function registerFunctionDeclaration(
  state: RegistrarState,
  expression: FunctionDefinition | ModifierDefinition,
) {
  if (!expression.range) {
    return;
  }

  let start = 0;

  // It's possible functions will have modifiers that take string args
  // which contains an open curly brace. Skip ahead...
  if (expression.type === 'FunctionDefinition' && expression.modifiers && expression.modifiers.length) {
    for (let modifier of expression.modifiers) {
      if (modifier.range && modifier.range[1] > start) {
        start = modifier.range[1];
      }
    }
  } else {
    start = expression.range[0];
  }

  const startContract = state.source.slice(0, start);
  const startline = (startContract.match(/\n/g) || []).length + 1;
  const endlineDelta = state.source.slice(start).indexOf('{');
  const name = expression.type === 'FunctionDefinition' && expression.isConstructor ? 'constructor' : expression.name;

  const id = ++state.functions.id;
  state.functions.map[id] = {
    name: name ?? '',
    line: startline,
    loc: expression.loc!,
    decl: expression.body?.loc ?? expression.loc!,
  };

  createInjection(state, start + endlineDelta + 1, {
    type: 'Function',
    functionId: id,
  });
}

/**
 * Registers injections for branch measurements. This generic is consumed by
 * the `require` and `if` registration methods.
 */
export function registerBranch(state: RegistrarState, expression: ASTNode) {
  if (!expression.range) {
    return;
  }

  const startContract = state.source.slice(0, expression.range[0]);
  const startline = (startContract.match(/\n/g) || []).length + 1;
  const startcol = expression.range[0] - startContract.lastIndexOf('\n') - 1;
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

  const id = ++state.branches.id;
  state.branches.map[id] = {
    line: startline,
    type: 'if',
    loc: loc,
    locations: [loc, loc],
  };
}

/**
 * Registers injections for require statement measurements (branches)
 */
export function registerRequireBranch(state: RegistrarState, expression: ASTNode) {
  registerBranch(state, expression);

  if (!expression.range) {
    return;
  }

  createInjection(state, expression.range[0], {
    type: 'RequirePre',
    branchId: state.branches.id,
  });

  createInjection(state, expression.range[1] + 2, {
    type: 'RequirePost',
    branchId: state.branches.id,
  });
}

/**
 * Registers injections for if statement measurements (branches)
 */
export function registerIfStatement(state: RegistrarState, expression: IfStatement) {
  registerBranch(state, expression);

  if (expression.trueBody.type === 'Block' && expression.trueBody.range) {
    createInjection(state, expression.trueBody.range[0] + 1, {
      type: 'Branch',
      branchId: state.branches.id,
      locationId: 0,
    });
  }

  if (expression.falseBody && expression.falseBody.type === 'IfStatement') {
    // Do nothing - we must be pre-preprocessing
  } else if (expression.falseBody && expression.falseBody.range && expression.falseBody.type === 'Block') {
    createInjection(state, expression.falseBody.range[0] + 1, {
      type: 'Branch',
      branchId: state.branches.id,
      locationId: 1,
    });
  } else if (expression.falseBody && expression.trueBody.range) {
    createInjection(state, expression.trueBody.range[1] + 1, {
      type: 'EmptyBranch',
      branchId: state.branches.id,
      locationId: 1,
    });
  }
}
