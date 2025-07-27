import type {Expr, Literal, JsonExpressionCodegenContext, JsonExpressionExecutionContext} from './types';
import type {OperatorRegistry} from './OperatorRegistry';
import {createEvaluate} from './createEvaluate';

/**
 * Runtime for evaluating JSON expressions using a specified operator registry.
 */
export class ExpressionRuntime {
  private evaluateFn: ReturnType<typeof createEvaluate>;

  constructor(
    private registry: OperatorRegistry,
    private options: JsonExpressionCodegenContext = {}
  ) {
    this.evaluateFn = createEvaluate({
      operators: registry.asMap(),
      ...options
    });
  }

  /**
   * Evaluate a JSON expression.
   */
  evaluate(
    expr: Expr | Literal<unknown>,
    ctx: JsonExpressionExecutionContext & JsonExpressionCodegenContext = {vars: undefined as any}
  ): unknown {
    return this.evaluateFn(expr, {...this.options, ...ctx});
  }

  /**
   * Get the operator registry used by this runtime.
   */
  getRegistry(): OperatorRegistry {
    return this.registry;
  }

  /**
   * Create a new runtime with a different registry.
   */
  withRegistry(registry: OperatorRegistry): ExpressionRuntime {
    return new ExpressionRuntime(registry, this.options);
  }

  /**
   * Create a new runtime with different options.
   */  
  withOptions(options: JsonExpressionCodegenContext): ExpressionRuntime {
    return new ExpressionRuntime(this.registry, {...this.options, ...options});
  }
}