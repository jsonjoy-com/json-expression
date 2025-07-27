import type {OperatorDefinition, OperatorMap, Expression} from './types';
import {operatorsToMap} from './util';

/**
 * Registry for operators that can be used in JSON expressions.
 * Allows building custom operator sets for different use cases.
 */
export class OperatorRegistry {
  private operators: OperatorDefinition<Expression>[] = [];
  private operatorMap: OperatorMap | null = null;

  constructor(operators: OperatorDefinition<Expression>[] = []) {
    this.operators = [...operators];
  }

  /**
   * Add one or more operators to the registry.
   */
  add(...operators: OperatorDefinition<Expression>[]): this {
    this.operators.push(...operators);
    this.operatorMap = null; // Invalidate cache
    return this;
  }

  /**
   * Remove an operator by name.
   */
  remove(name: string): this {
    this.operators = this.operators.filter(([operatorName]) => operatorName !== name);
    this.operatorMap = null; // Invalidate cache
    return this;
  }

  /**
   * Check if an operator exists in the registry.
   */
  has(name: string): boolean {
    return this.operators.some(([operatorName, aliases]) => 
      operatorName === name || aliases.includes(name)
    );
  }

  /**
   * Get all operators as an array.
   */
  all(): OperatorDefinition<Expression>[] {
    return [...this.operators];
  }

  /**
   * Get operators as a Map for efficient lookup.
   */
  asMap(): OperatorMap {
    if (!this.operatorMap) {
      this.operatorMap = operatorsToMap(this.operators);
    }
    return this.operatorMap;
  }

  /**
   * Create a new registry with the same operators.
   */
  clone(): OperatorRegistry {
    return new OperatorRegistry(this.operators);
  }

  /**
   * Merge this registry with another registry.
   */
  merge(other: OperatorRegistry): OperatorRegistry {
    return new OperatorRegistry([...this.operators, ...other.operators]);
  }

  /**
   * Get the number of operators in the registry.
   */
  size(): number {
    return this.operators.length;
  }
}