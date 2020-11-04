import SolidityParser, {
  ASTNode,
  Block,
  BinaryOperation,
  FunctionCall,
  Conditional,
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
} from '@solidity-parser/parser';
import {
  createInjection,
  registerFunctionDeclaration,
  registerIfStatement,
  registerRequireBranch,
  registerStatement,
  Injections,
  RegistrarState,
  RegisteredFunctions,
  RegisteredBranches,
  RegisteredStatements,
} from './registrar';

export interface ParseResult {
  ast: ASTNode;
  source: string;
  file: string;
  injections: Injections;
  functions: RegisteredFunctions;
  branches: RegisteredBranches;
  statements: RegisteredStatements;
}

export function parse(source: string, file: string): ParseResult {
  const ast = SolidityParser.parse(source, { range: true, loc: true });
  const state: RegistrarState = {
    ast,
    source: source,
    tracking: true,
    contract: '',
    injections: {},
    functions: {
      id: -1,
      map: [],
    },
    branches: {
      id: -1,
      map: [],
    },
    statements: {
      id: -1,
      map: [],
    },
  };

  parseExpression(state, ast);

  return {
    ast,
    source,
    file,
    injections: state.injections,
    functions: state.functions.map,
    branches: state.branches.map,
    statements: state.statements.map,
  };
}

function parseExpression(state: RegistrarState, expression: ASTNode) {
  switch (expression.type) {
    case 'Block':
      return parseBlock(state, expression as Block);
    case 'BinaryOperation':
      return parseBinaryOperation(state, expression as BinaryOperation);
    // case 'AssignmentExpression':
    //   return parseAssignmentExpression(expression);
    case 'FunctionCall':
      return parseFunctionCall(state, expression as FunctionCall);
    case 'Conditional':
      return parseConditional(state, expression as Conditional);
    case 'ContractDefinition':
      return parseContractDefinition(state, expression as ContractDefinition);
    case 'EmitStatement':
      return parseEmitStatement(state, expression as EmitStatement);
    case 'ExpressionStatement':
      return parseExpressionStatement(state, expression as ExpressionStatement);
    case 'ForStatement':
      return parseForStatement(state, expression as ForStatement);
    case 'FunctionDefinition':
      return parseFunctionDefinition(state, expression as FunctionDefinition);
    case 'IfStatement':
      return parseIfStatement(state, expression as IfStatement);
    case 'ModifierDefinition':
      return parseModifierDefinition(state, expression);
    // TODO: This doesn't have a proper type.
    case 'NewExpression' as any:
      return parseNewExpression(state, expression);
    case 'SourceUnit':
      return parseSourceUnit(state, expression as SourceUnit);
    case 'ReturnStatement':
      return parseReturnStatement(state, expression as ReturnStatement);
    // TODO: This doesn't have a proper type.
    case 'TryStatement' as any:
      return parseTryStatement(state, expression);
    case 'VariableDeclarationStatement':
      return parseVariableDeclarationStatement(state, expression as VariableDeclarationStatement);
    case 'WhileStatement':
      return parseWhileStatement(state, expression as WhileStatement);
  }
}

function parseBlock(state: RegistrarState, expression: Block) {
  for (let x = 0; x < expression.statements.length; x++) {
    parseExpression(state, expression.statements[x]);
  }
}

function parseBinaryOperation(state: RegistrarState, expression: BinaryOperation) {
  registerStatement(state, expression);
}

function parseFunctionCall(state: RegistrarState, expression: FunctionCall) {
  // In any given chain of call expressions, only the last one will fail this check.
  // This makes sure we don't instrument a chain of expressions multiple times.
  if (expression.expression.type !== 'FunctionCall') {
    registerStatement(state, expression);

    if (expression.expression.type === 'Identifier' && expression.expression.name === 'require') {
      registerRequireBranch(state, expression);
    }

    parseExpression(state, expression.expression);
  } else {
    parseExpression(state, expression.expression);
  }
}

function parseConditional(state: RegistrarState, expression: Conditional) {
  registerStatement(state, expression);
  // TODO: Investigate node structure
  // There are potential substatements here we aren't measuring
}

function parseContractDefinition(state: RegistrarState, expression: ContractDefinition) {
  // We need to define a method to pass coverage hashes into at top of each target.
  // This lets us get a fresh stack for the hash and avoid stack-too-deep errors.
  if (expression.kind !== 'interface') {
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
  }

  if (expression.subNodes) {
    expression.subNodes.forEach((construct) => {
      parseExpression(state, construct);
    });
  }
}

function parseEmitStatement(state: RegistrarState, expression: EmitStatement) {
  registerStatement(state, expression);
}

function parseExpressionStatement(state: RegistrarState, expression: ExpressionStatement) {
  parseExpression(state, expression.expression);
}

function parseForStatement(state: RegistrarState, expression: ForStatement) {
  registerStatement(state, expression);
  parseExpression(state, expression.body);
}

function parseFunctionDefinition(state: RegistrarState, expression: FunctionDefinition) {
  if (expression.modifiers) {
    expression.modifiers.forEach((modifier) => parseExpression(state, modifier));
  }

  if (expression.body) {
    if (expression.name === null && (expression as any).isReceiveEther) {
      state.tracking = false;
    } else {
      registerFunctionDeclaration(state, expression);
    }

    parseExpression(state, expression.body);
    state.tracking = true;
  }
}

function parseIfStatement(state: RegistrarState, expression: IfStatement) {
  registerStatement(state, expression);
  registerIfStatement(state, expression);

  if (expression.trueBody) {
    parseExpression(state, expression.trueBody);
  }

  if (expression.falseBody) {
    parseExpression(state, expression.falseBody);
  }
}

function parseModifierDefinition(state: RegistrarState, expression: ModifierDefinition) {
  registerFunctionDeclaration(state, expression);
  parseExpression(state, expression.body);
}

// TODO: This doesn't have a proper type.
function parseNewExpression(state: RegistrarState, expression: any) {
  parseExpression(state, expression.typeName);
}

function parseSourceUnit(state: RegistrarState, expression: SourceUnit) {
  expression.children.forEach((construct) => {
    parseExpression(state, construct);
  });
}

function parseReturnStatement(state: RegistrarState, expression: ReturnStatement) {
  registerStatement(state, expression);
}

// TODO: This doesn't have a proper type.
function parseTryStatement(state: RegistrarState, expression: any) {
  registerStatement(state, expression);
  parseExpression(state, expression.body);
  for (let x = 0; x < expression.catchClauses.length; x++) {
    parseExpression(state, expression.catchClauses[x].body);
  }
}

function parseVariableDeclarationStatement(state: RegistrarState, expression: VariableDeclarationStatement) {
  registerStatement(state, expression);
}

function parseWhileStatement(state: RegistrarState, expression: WhileStatement) {
  // TODO: This is incorrectly typed in solidity-parser.
  const typed = expression as WhileStatement & {
    body: Statement;
  };

  registerStatement(state, expression);
  parseExpression(state, typed.body);
}

// TODO: Investigate why this isn't used.

// function parseMemberAccess(state: RegistrarState, expression: any) {
//   parseExpression(expression.object);
// }

// function parseUnaryOperation(state: RegistrarState, expression: any) {
//   parseExpression(expression.argument);
// }

// function parseAssignmentExpression(expression) {
//   registerStatement(expression);
// }
