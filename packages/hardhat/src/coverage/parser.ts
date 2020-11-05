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
} from '@solidity-parser/parser';
import { Range, BranchMapping, FunctionMapping } from 'istanbul-lib-coverage';
import {
  createInjection,
  registerFunctionDeclaration,
  registerStatement,
  Injections,
  RegistrarState,
  registerBranch,
  registerBranchLocation,
} from './registrar';

export interface ParseResult {
  ast: ASTNode;
  source: string;
  file: string;
  injections: Injections;
  functions: FunctionMapping[];
  branches: BranchMapping[];
  statements: Range[];
}

export function parse(source: string, file: string): ParseResult {
  const ast = SolidityParser.parse(source, { range: true, loc: true });
  const state: RegistrarState = {
    ast,
    source: source,
    contract: '',
    injections: {},
    functions: [],
    branches: [],
    statements: [],
  };

  parseExpression(state, ast);

  return {
    ast,
    source,
    file,
    injections: state.injections,
    functions: state.functions,
    branches: state.branches,
    statements: state.statements,
  };
}

function parseExpression(state: RegistrarState, expression: ASTNode) {
  switch (expression.type) {
    case 'Block':
      return parseBlock(state, expression as Block);
    case 'BinaryOperation':
      return parseBinaryOperation(state, expression as BinaryOperation);
    case 'ContractDefinition':
      return parseContractDefinition(state, expression as ContractDefinition);
    case 'EmitStatement':
      return parseEmitStatement(state, expression as EmitStatement);
    case 'ExpressionStatement':
      return parseExpressionStatement(state, expression as ExpressionStatement);
    case 'ForStatement':
      return parseForStatement(state, expression as ForStatement);
    case 'FunctionCall':
      return parseFunctionCall(state, expression as FunctionCall);
    case 'FunctionDefinition':
      return parseFunctionDefinition(state, expression as FunctionDefinition);
    case 'IfStatement':
      return parseIfStatement(state, expression as IfStatement);
    case 'ModifierDefinition':
      return parseModifierDefinition(state, expression);
    case 'NewExpression' as any:
      return parseNewExpression(state, expression);
    case 'ReturnStatement':
      return parseReturnStatement(state, expression as ReturnStatement);
    case 'SourceUnit':
      return parseSourceUnit(state, expression as SourceUnit);
    case 'TryStatement' as any:
      return parseTryStatement(state, expression);
    case 'VariableDeclarationStatement':
      return parseVariableDeclarationStatement(state, expression as VariableDeclarationStatement);
    case 'WhileStatement':
      return parseWhileStatement(state, expression as WhileStatement);
    case 'InlineAssemblyStatement':
      return parseInlineAssemblyStatement(state, expression as InlineAssemblyStatement);
    case 'UnaryOperation':
      return parseUnaryOperation(state, expression as UnaryOperation);
    case 'ContinueStatement':
      return parseContinueStatement(state, expression as ContinueStatement);
    case 'BreakStatement':
      return parseBreakStatement(state, expression as BreakStatement);
  }
}

function parseBlock(state: RegistrarState, expression: Block) {
  for (let x = 0; x < expression.statements.length; x++) {
    parseExpression(state, expression.statements[x]);
  }
}

function parseBinaryOperation(state: RegistrarState, expression: BinaryOperation) {
  registerStatement(state, expression);

  // NOTE: Ternary expressions are currently not supported.
  if (expression.right.type === 'Conditional') {
    throw new Error(`Ternary statements are currently not supported: ${state.contract}:${expression.loc?.start.line}`);
  }
}

function parseFunctionCall(state: RegistrarState, expression: FunctionCall) {
  if (expression.expression.type !== 'FunctionCall') {
    registerStatement(state, expression);
    parseExpression(state, expression.expression);
  } else {
    parseExpression(state, expression.expression);
  }
}

function parseContractDefinition(state: RegistrarState, expression: ContractDefinition) {
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

function parseFunctionDefinition(state: RegistrarState, expression: FunctionDefinition) {
  if (expression.modifiers) {
    expression.modifiers.forEach((modifier) => parseExpression(state, modifier));
  }

  registerFunctionDeclaration(state, expression);
  if (expression.body) {
    parseExpression(state, expression.body);
  }
}

function parseIfStatement(state: RegistrarState, expression: IfStatement) {
  const branch = registerBranch(state, expression);
  parseIfStatementSiblings(state, expression, branch);
}

function parseIfStatementSiblings(state: RegistrarState, expression: Statement, id: number) {
  if (expression.type === 'Block') {
    registerBranchLocation(state, expression, id);
    parseExpression(state, expression);
  } else if (expression.type === 'IfStatement') {
    parseIfStatementSiblings(state, expression.trueBody, id);

    if (expression.falseBody) {
      parseIfStatementSiblings(state, expression.falseBody, id);
    }
  }
}

function parseModifierDefinition(state: RegistrarState, expression: ModifierDefinition) {
  registerFunctionDeclaration(state, expression);
  parseExpression(state, expression.body);
}

function parseSourceUnit(state: RegistrarState, expression: SourceUnit) {
  expression.children.forEach((construct) => {
    parseExpression(state, construct);
  });
}

// TODO: This doesn't have a proper type.
function parseTryStatement(state: RegistrarState, expression: any) {
  parseExpression(state, expression.body);

  for (let x = 0; x < expression.catchClauses.length; x++) {
    parseExpression(state, expression.catchClauses[x].body);
  }
}

function parseWhileStatement(state: RegistrarState, expression: WhileStatement) {
  // TODO: This is incorrectly typed in solidity-parser.
  const typed = expression as WhileStatement & {
    body: Statement;
  };

  parseExpression(state, typed.body);
}

// TODO: This doesn't have a proper type.
function parseNewExpression(state: RegistrarState, expression: any) {
  parseExpression(state, expression.typeName);
}

function parseReturnStatement(state: RegistrarState, expression: ReturnStatement) {
  registerStatement(state, expression);
}

function parseVariableDeclarationStatement(state: RegistrarState, expression: VariableDeclarationStatement) {
  registerStatement(state, expression);
}

function parseUnaryOperation(state: RegistrarState, expression: UnaryOperation) {
  registerStatement(state, expression);
}

function parseInlineAssemblyStatement(state: RegistrarState, expression: InlineAssemblyStatement) {
  registerStatement(state, expression);
}

function parseContinueStatement(state: RegistrarState, expression: ContinueStatement) {
  registerStatement(state, expression);
}

function parseBreakStatement(state: RegistrarState, expression: BreakStatement) {
  registerStatement(state, expression);
}

function parseEmitStatement(state: RegistrarState, expression: EmitStatement) {
  registerStatement(state, expression);
}

function parseExpressionStatement(state: RegistrarState, expression: ExpressionStatement) {
  parseExpression(state, expression.expression);
}

function parseForStatement(state: RegistrarState, expression: ForStatement) {
  parseExpression(state, expression.body);
}
