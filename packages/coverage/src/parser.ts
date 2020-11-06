import SolidityParser, {
  ASTNode,
  Block,
  BinaryOperation,
  FunctionCall,
  ContractDefinition,
  EmitStatement,
  ExpressionStatement,
  ForStatement,
  FunctionDefinition,
  IfStatement,
  ModifierDefinition,
  SourceUnit,
  ReturnStatement,
  VariableDeclarationStatement,
  WhileStatement,
  Statement,
  InlineAssemblyStatement,
  UnaryOperation,
  ContinueStatement,
  BreakStatement,
  Expression,
} from '@solidity-parser/parser';
import { Range, BranchMapping, FunctionMapping } from 'istanbul-lib-coverage';
import { BlockDelimiter, Injection } from './injector';
import {
  createInjection,
  registerFunction,
  registerStatement,
  registerBranch,
  registerBranchLocation,
} from './registrar';

export interface ParseState {
  contract: string;
  branch?: number;
  source: string;
  injections: Record<number, Injection[]>;
  functions: FunctionMapping[];
  branches: BranchMapping[];
  statements: Range[];
}

export interface ParseResult {
  source: string;
  injections: Record<number, Injection[]>;
  functions: FunctionMapping[];
  branches: BranchMapping[];
  statements: Range[];
}

export function parse(source: string): ParseResult {
  const ast = SolidityParser.parse(source, { range: true, loc: true });
  const state: ParseState = {
    contract: '',
    branch: undefined,
    source: source,
    injections: {},
    functions: [],
    branches: [],
    statements: [],
  };

  parseExpression(state, ast);

  return {
    source: source,
    injections: state.injections,
    functions: state.functions,
    branches: state.branches,
    statements: state.statements,
  };
}

function parseExpression(state: ParseState, expression: ASTNode) {
  switch (expression.type) {
    case 'Block':
      parseBlock(state, expression as Block);
      break;
    case 'BinaryOperation':
      parseBinaryOperation(state, expression as BinaryOperation)
      break;
    case 'ContractDefinition':
      parseContractDefinition(state, expression as ContractDefinition)
      break;
    case 'EmitStatement':
      parseEmitStatement(state, expression as EmitStatement)
      break;
    case 'ExpressionStatement':
      parseExpressionStatement(state, expression as ExpressionStatement)
      break;
    case 'ForStatement':
      parseForStatement(state, expression as ForStatement)
      break;
    case 'FunctionCall':
      parseFunctionCall(state, expression as FunctionCall)
      break;
    case 'FunctionDefinition':
      parseFunctionDefinition(state, expression as FunctionDefinition)
      break;
    case 'IfStatement':
      parseIfStatement(state, expression as IfStatement)
      break;
    case 'ModifierDefinition':
      parseModifierDefinition(state, expression)
      break;
    case 'NewExpression' as any:
      parseNewExpression(state, expression)
      break;
    case 'ReturnStatement':
      parseReturnStatement(state, expression as ReturnStatement)
      break;
    case 'SourceUnit':
      parseSourceUnit(state, expression as SourceUnit)
      break;
    case 'TryStatement' as any:
      parseTryStatement(state, expression)
      break;
    case 'VariableDeclarationStatement':
      parseVariableDeclarationStatement(state, expression as VariableDeclarationStatement)
      break;
    case 'WhileStatement':
      parseWhileStatement(state, expression as WhileStatement)
      break;
    case 'InlineAssemblyStatement':
      parseInlineAssemblyStatement(state, expression as InlineAssemblyStatement)
      break;
    case 'UnaryOperation':
      parseUnaryOperation(state, expression as UnaryOperation)
      break;
    case 'ContinueStatement':
      parseContinueStatement(state, expression as ContinueStatement)
      break;
    case 'BreakStatement':
      parseBreakStatement(state, expression as BreakStatement)
      break;
  }
}

function parseBlock(state: ParseState, expression: Block) {
  for (let x = 0; x < expression.statements.length; x++) {
    parseExpression(state, expression.statements[x]);
  }
}

function parseBinaryOperation(state: ParseState, expression: BinaryOperation) {
  registerStatement(state, expression);

  // TODO: Ternary expressions are currently not supported.
  if (expression.right.type === 'Conditional') {
    console.warn(`Instrumentation for ternary statements is currently not supported: ${state.contract}:${expression.loc?.start.line}`);
  }
}

function parseFunctionCall(state: ParseState, expression: FunctionCall) {
  if (expression.expression.type !== 'FunctionCall') {
    registerStatement(state, expression);
    parseExpression(state, expression.expression);
  } else {
    parseExpression(state, expression.expression);
  }
}

function parseContractDefinition(state: ParseState, expression: ContractDefinition) {
  // Interfaces don't have any relevant instrumentation.
  if (expression.kind === 'interface') {
    return;
  }

  // We need to define a method to pass coverage hashes into at top of each target.
  // This lets us get a fresh stack for the hash and avoid stack-too-deep errors.
  let start = 0;

  // It's possible a base contract will have constructor string arg
  // which contains an open curly brace. Skip ahead pass the bases...
  if (expression.baseContracts && expression.baseContracts.length) {
    for (const base of expression.baseContracts) {
      if (base.range && base.range[1] > start) {
        start = base.range[1];
      }
    }
  } else if (expression.range) {
    start = expression.range[0];
  }

  const end = state.source.slice(start).indexOf('{') + 1;
  const loc = start + end;

  state.contract = expression.name;
  createInjection(state, loc, {
    type: 'HashMethod',
  });

  if (expression.subNodes) {
    expression.subNodes.forEach((construct) => {
      parseExpression(state, construct);
    });
  }
}

function parseFunctionDefinition(state: ParseState, expression: FunctionDefinition) {
  if (expression.modifiers) {
    expression.modifiers.forEach((modifier) => parseExpression(state, modifier));
  }

  registerFunction(state, expression);
  if (expression.body) {
    parseExpression(state, expression.body);
  }
}

function parseIfStatement(state: ParseState, expression: IfStatement) {
  const before = state.branch;
  state.branch = registerBranch(state, expression);

  parseExpression(state, expression.trueBody);
  registerBranchLocation(state, expression.trueBody);
  ensureBlock(state, expression.trueBody);

  if (expression.falseBody) {
    if (expression.falseBody.type === 'IfStatement') {
      // If `falseBody` in an `IfStatement` and also has `falseBody` itself, it's a nested branch.
      if (expression.falseBody.falseBody) {
        parseExpression(state, expression.falseBody);
      } else {
        parseExpression(state, expression.falseBody.trueBody);
      }
    } else {
      // Otherwise it's just an `else` statement.
      parseExpression(state, expression.falseBody);
    }

    registerBranchLocation(state, expression.falseBody);
    ensureBlock(state, expression.falseBody);
  }

  state.branch = before;
}

function parseModifierDefinition(state: ParseState, expression: ModifierDefinition) {
  registerFunction(state, expression);
  parseExpression(state, expression.body);
}

function parseSourceUnit(state: ParseState, expression: SourceUnit) {
  expression.children.forEach((construct) => {
    parseExpression(state, construct);
  });
}

// TODO: This doesn't have a proper type.
function parseTryStatement(state: ParseState, expression: any) {
  parseExpression(state, expression.body);

  for (let x = 0; x < expression.catchClauses.length; x++) {
    parseExpression(state, expression.catchClauses[x].body);
  }
}

function parseWhileStatement(state: ParseState, expression: WhileStatement) {
  // TODO: This is incorrectly typed in solidity-parser.
  const typed = expression as WhileStatement & {
    body: Statement;
  };

  parseExpression(state, typed.body);
  ensureBlock(state, typed.body);
}

// TODO: This doesn't have a proper type.
function parseNewExpression(state: ParseState, expression: any) {
  parseExpression(state, expression.typeName);
}

function parseReturnStatement(state: ParseState, expression: ReturnStatement) {
  registerStatement(state, expression);
}

function parseVariableDeclarationStatement(state: ParseState, expression: VariableDeclarationStatement) {
  registerStatement(state, expression);
}

function parseUnaryOperation(state: ParseState, expression: UnaryOperation) {
  registerStatement(state, expression);
}

function parseInlineAssemblyStatement(state: ParseState, expression: InlineAssemblyStatement) {
  registerStatement(state, expression);
}

function parseContinueStatement(state: ParseState, expression: ContinueStatement) {
  registerStatement(state, expression);
}

function parseBreakStatement(state: ParseState, expression: BreakStatement) {
  registerStatement(state, expression);
}

function parseEmitStatement(state: ParseState, expression: EmitStatement) {
  registerStatement(state, expression);
}

function parseExpressionStatement(state: ParseState, expression: ExpressionStatement) {
  parseExpression(state, expression.expression);
}

function parseForStatement(state: ParseState, expression: ForStatement) {
  parseExpression(state, expression.body);
  ensureBlock(state, expression.body);
}

function ensureBlock(state: ParseState, expression: Statement | Expression) {
  if (expression.type !== 'Block') {
    createInjection(state, expression.range![0], {
      type: 'BlockDelimiter',
      delimiter: BlockDelimiter.OPEN,
    });

    createInjection(state, expression.range![1] + 1, {
      type: 'BlockDelimiter',
      delimiter: BlockDelimiter.CLOSE,
    });
  }
}