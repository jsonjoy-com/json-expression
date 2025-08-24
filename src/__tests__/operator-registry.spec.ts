import {OperatorRegistry} from '../OperatorRegistry';
import {ExpressionRuntime} from '../ExpressionRuntime';
import {ExpressionCodegen} from '../ExpressionCodegen';
import {defaultOperatorRegistry, extendedOperatorRegistry} from '../registries';
import {Vars} from '../Vars';
import {arithmeticOperators} from '../operators/arithmetic';
import {comparisonOperators} from '../operators/comparison';
import {binaryOperators} from '../operators/binary';

describe('OperatorRegistry', () => {
  test('can create empty registry', () => {
    const registry = new OperatorRegistry();
    expect(registry.size()).toBe(0);
  });

  test('can add operators', () => {
    const registry = new OperatorRegistry();
    registry.add(...arithmeticOperators);
    expect(registry.size()).toBe(arithmeticOperators.length);
    expect(registry.has('+')).toBe(true);
    expect(registry.has('add')).toBe(true); // alias
  });

  test('can remove operators', () => {
    const registry = new OperatorRegistry(arithmeticOperators);
    expect(registry.has('+')).toBe(true);
    registry.remove('+');
    expect(registry.has('+')).toBe(false);
  });

  test('can clone registry', () => {
    const registry = new OperatorRegistry(arithmeticOperators);
    const cloned = registry.clone();
    expect(cloned.size()).toBe(registry.size());
    expect(cloned.has('+')).toBe(true);
  });

  test('can merge registries', () => {
    const registry1 = new OperatorRegistry(arithmeticOperators);
    const registry2 = new OperatorRegistry(comparisonOperators);
    const merged = registry1.merge(registry2);
    expect(merged.size()).toBe(arithmeticOperators.length + comparisonOperators.length);
    expect(merged.has('+')).toBe(true);
    expect(merged.has('==')).toBe(true);
  });

  test('asMap returns correct operator map', () => {
    const registry = new OperatorRegistry(arithmeticOperators);
    const map = registry.asMap();
    expect(map.get('+')).toBeDefined();
    expect(map.get('add')).toBeDefined(); // alias
    expect(map.get('+')).toBe(map.get('add')); // should be same operator
  });
});

describe('ExpressionRuntime', () => {
  test('can evaluate expressions with custom registry', () => {
    const registry = new OperatorRegistry(arithmeticOperators);
    const runtime = new ExpressionRuntime(registry);
    const result = runtime.evaluate(['+', 1, 2], {vars: new Vars(null)});
    expect(result).toBe(3);
  });

  test('throws error for unknown operators', () => {
    const registry = new OperatorRegistry(); // empty registry
    const runtime = new ExpressionRuntime(registry);
    expect(() => {
      runtime.evaluate(['+', 1, 2], {vars: new Vars(null)});
    }).toThrow();
  });

  test('can switch registry', () => {
    const arithmeticRegistry = new OperatorRegistry(arithmeticOperators);
    const comparisonRegistry = new OperatorRegistry(comparisonOperators);
    
    const runtime = new ExpressionRuntime(arithmeticRegistry);
    expect(runtime.evaluate(['+', 1, 2], {vars: new Vars(null)})).toBe(3);
    
    const newRuntime = runtime.withRegistry(comparisonRegistry);
    expect(newRuntime.evaluate(['==', 1, 1], {vars: new Vars(null)})).toBe(true);
  });
});

describe('ExpressionCodegen', () => {
  test('can compile expressions with custom registry', () => {
    const registry = new OperatorRegistry(arithmeticOperators);
    const codegen = new ExpressionCodegen(registry, {expression: ['+', 1, 2]});
    const fn = codegen.run().compile();
    const result = fn(new Vars(null));
    expect(result).toBe(3);
  });

  test('throws error for unknown operators in codegen', () => {
    const registry = new OperatorRegistry(); // empty registry
    const codegen = new ExpressionCodegen(registry, {expression: ['+', 1, 2]});
    const fn = codegen.run().compile();
    const result = fn(new Vars(null));
    expect(result).toBe(false); // returns false for unknown operators
  });

  test('can switch registry', () => {
    const arithmeticRegistry = new OperatorRegistry(arithmeticOperators);
    const comparisonRegistry = new OperatorRegistry(comparisonOperators);
    
    const codegen = new ExpressionCodegen(arithmeticRegistry, {expression: ['+', 1, 2]});
    expect(codegen.run().compile()(new Vars(null))).toBe(3);
    
    const newCodegen = codegen.withRegistry(comparisonRegistry);
    const newCodegenWithExpr = new ExpressionCodegen(comparisonRegistry, {expression: ['==', 1, 1]});
    expect(newCodegenWithExpr.run().compile()(new Vars(null))).toBe(true);
  });
});

describe('Built-in Registries', () => {
  test('default registry has core operators', () => {
    expect(defaultOperatorRegistry.has('+')).toBe(true);
    expect(defaultOperatorRegistry.has('==')).toBe(true);
    expect(defaultOperatorRegistry.has('and')).toBe(true);
    expect(defaultOperatorRegistry.has('type')).toBe(true);
    expect(defaultOperatorRegistry.has('len')).toBe(true);
    expect(defaultOperatorRegistry.has('cat')).toBe(true);
    expect(defaultOperatorRegistry.has('concat')).toBe(true);
    expect(defaultOperatorRegistry.has('keys')).toBe(true);
    expect(defaultOperatorRegistry.has('if')).toBe(true);
    expect(defaultOperatorRegistry.has('get')).toBe(true);
  });

  test('default registry does not have advanced operators', () => {
    expect(defaultOperatorRegistry.has('u8')).toBe(false); // binary
    expect(defaultOperatorRegistry.has('&')).toBe(false); // bitwise
    expect(defaultOperatorRegistry.has('jp.add')).toBe(false); // patch
  });

  test('extended registry has all operators', () => {
    expect(extendedOperatorRegistry.has('+')).toBe(true); // arithmetic
    expect(extendedOperatorRegistry.has('==')).toBe(true); // comparison
    expect(extendedOperatorRegistry.has('u8')).toBe(true); // binary
    expect(extendedOperatorRegistry.has('&')).toBe(true); // bitwise
    expect(extendedOperatorRegistry.has('jp.add')).toBe(true); // patch
  });

  test('extended registry has more operators than default', () => {
    expect(extendedOperatorRegistry.size()).toBeGreaterThan(defaultOperatorRegistry.size());
  });

  test('can evaluate with default registry', () => {
    const runtime = new ExpressionRuntime(defaultOperatorRegistry);
    const result = runtime.evaluate(['+', ['*', 2, 3], 4], {vars: new Vars(null)});
    expect(result).toBe(10);
  });

  test('can evaluate with extended registry', () => {
    const runtime = new ExpressionRuntime(extendedOperatorRegistry);
    const result = runtime.evaluate(['+', ['*', 2, 3], 4], {vars: new Vars(null)});
    expect(result).toBe(10);
  });
});