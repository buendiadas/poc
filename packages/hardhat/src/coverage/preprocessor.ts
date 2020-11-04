import SolidityParser, { ASTNode, Statement, WhileStatement } from '@solidity-parser/parser';

enum InsertionType {
  OPEN = '{',
  CLOSE = '}',
}

interface Insertion {
  type: InsertionType;
  pos: number;
}

/**
 * Locates unbracketed singleton statements attached to if, else, for and while statements
 * and brackets them. Instrumenter needs to inject events at these locations and having
 * them pre-bracketed simplifies the process.
 */
export function preprocess(source: string, ast: ASTNode) {
  const insertions: Insertion[] = [];

  SolidityParser.visit(ast, {
    IfStatement: (node) => {
      if (node.trueBody.type !== 'Block' && node.trueBody.range) {
        insertions.push({ type: InsertionType.OPEN, pos: node.trueBody.range[0] });
        insertions.push({ type: InsertionType.CLOSE, pos: node.trueBody.range[1] + 1 });
      }
      if (node.falseBody && node.falseBody.type !== 'Block' && node.falseBody.range) {
        insertions.push({ type: InsertionType.OPEN, pos: node.falseBody.range[0] });
        insertions.push({ type: InsertionType.CLOSE, pos: node.falseBody.range[1] + 1 });
      }
    },
    ForStatement: (node) => {
      if (node.body.type !== 'Block' && node.body.range) {
        insertions.push({ type: InsertionType.OPEN, pos: node.body.range[0] });
        insertions.push({ type: InsertionType.CLOSE, pos: node.body.range[1] + 1 });
      }
    },
    WhileStatement: (node) => {
      // TODO: This is incorrectly typed in solidity-parser.
      const typed = node as WhileStatement & {
        body: Statement;
      };

      if (typed.body.type !== 'Block' && typed.body.range) {
        insertions.push({ type: InsertionType.OPEN, pos: typed.body.range[0] });
        insertions.push({ type: InsertionType.CLOSE, pos: typed.body.range[1] + 1 });
      }
    },
  });

  return insertions
    .sort((a, b) => a.pos - b.pos)
    .reduce((source, insertion, index) => {
      // TODO: Use `source.splice` here instead.
      return source.slice(0, insertion.pos + index) + insertion.type + source.slice(insertion.pos + index);
    }, source);
}
