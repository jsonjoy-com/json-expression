import * as util from './util';
import {Codegen} from '@jsonjoy.com/util/lib/codegen/Codegen';
import {type ExpressionResult, Literal} from './codegen-steps';
import {createEvaluate} from './createEvaluate';
import type {JavaScript} from '@jsonjoy.com/util/lib/codegen';
import {Vars} from './Vars';
import type * as types from './types';
import type {OperatorRegistry} from './OperatorRegistry';

export type ExpressionFn = (vars: types.JsonExpressionExecutionContext['vars']) => unknown;

export interface ExpressionCodegenOptions extends types.JsonExpressionCodegenContext {
  expression: types.Expr;
}

/**
 * Code generator for JSON expressions using a specified operator registry.
 */
export class ExpressionCodegen {
  protected codegen: Codegen<ExpressionFn>;
  protected evaluate: ReturnType<typeof createEvaluate>;
  protected operatorMap: types.OperatorMap;

  public constructor(
    private registry: OperatorRegistry,
    protected options: ExpressionCodegenOptions
  ) {
    this.operatorMap = registry.asMap();
    this.codegen = new Codegen<ExpressionFn>({
      args: ['vars'],
      epilogue: '',
    });
    this.evaluate = createEvaluate({
      operators: this.operatorMap,
      ...options
    });
  }

  private linkedOperandDeps: Set<string> = new Set();
  private linkOperandDeps = (dependency: unknown, name?: string): string => {
    if (name) {
      if (this.linkedOperandDeps.has(name)) return name;
      this.linkedOperandDeps.add(name);
    } else {
      name = this.codegen.getRegister();
    }
    this.codegen.linkDependency(dependency, name);
    return name;
  };

  private operatorConst = (js: JavaScript<unknown>): string => {
    return this.codegen.addConstant(js);
  };

  private subExpression = (expr: types.Expr): ExpressionFn => {
    const codegen = new ExpressionCodegen(this.registry, {...this.options, expression: expr});
    const fn = codegen.run().compile();
    return fn;
  };

  protected onExpression(expr: types.Expr | unknown): ExpressionResult {
    if (expr instanceof Array) {
      if (expr.length === 1) return new Literal(expr[0]);
    } else return new Literal(expr);

    const def = this.operatorMap.get(expr[0]);
    if (def) {
      const [name, , arity, , codegen, impure] = def;
      util.assertArity(name, arity, expr);
      const operands = expr.slice(1).map((operand) => this.onExpression(operand));
      if (!impure) {
        const allLiterals = operands.every((expr) => expr instanceof Literal);
        if (allLiterals) {
          const result = this.evaluate(expr, {vars: new Vars(undefined)});
          return new Literal(result);
        }
      }
      const ctx: types.OperatorCodegenCtx<types.Expression> = {
        expr,
        operands,
        createPattern: this.options.createPattern,
        operand: (operand: types.Expression) => this.onExpression(operand),
        link: this.linkOperandDeps,
        const: this.operatorConst,
        subExpression: this.subExpression,
        var: (value: string) => this.codegen.var(value),
      };
      return codegen(ctx);
    }
    return new Literal(false);
  }

  public run(): this {
    const expr = this.onExpression(this.options.expression);
    this.codegen.js(`return ${expr};`);
    return this;
  }

  public generate() {
    return this.codegen.generate();
  }

  public compileRaw(): ExpressionFn {
    return this.codegen.compile();
  }

  public compile(): ExpressionFn {
    const fn = this.compileRaw();
    return (vars: any) => {
      try {
        return fn(vars);
      } catch (err) {
        if (err instanceof Error) throw err;
        const error = new Error('Expression evaluation error.');
        (<any>error).value = err;
        throw error;
      }
    };
  }

  /**
   * Get the operator registry used by this codegen.
   */
  getRegistry(): OperatorRegistry {
    return this.registry;
  }

  /**
   * Create a new codegen with a different registry.
   */
  withRegistry(registry: OperatorRegistry): ExpressionCodegen {
    return new ExpressionCodegen(registry, this.options);
  }
}