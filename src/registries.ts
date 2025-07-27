import {OperatorRegistry} from './OperatorRegistry';
import {arithmeticOperators} from './operators/arithmetic';
import {comparisonOperators} from './operators/comparison';
import {logicalOperators} from './operators/logical';
import {typeOperators} from './operators/type';
import {containerOperators} from './operators/container';
import {stringOperators} from './operators/string';
import {arrayOperators} from './operators/array';
import {objectOperators} from './operators/object';
import {branchingOperators} from './operators/branching';
import {inputOperators} from './operators/input';
import {binaryOperators} from './operators/binary';
import {bitwiseOperators} from './operators/bitwise';
import {patchOperators} from './operators/patch';

/**
 * Default operator registry containing the most commonly used operators.
 * Includes: arithmetic, comparison, logical, type, container, string, array, object, branching, and input operators.
 */
export const defaultOperatorRegistry = new OperatorRegistry([
  ...arithmeticOperators,
  ...comparisonOperators,
  ...logicalOperators,
  ...typeOperators,
  ...containerOperators,
  ...stringOperators,
  ...arrayOperators,
  ...objectOperators,
  ...branchingOperators,
  ...inputOperators,
]);

/**
 * Extended operator registry containing all available operators.
 * Includes everything from the default registry plus: binary, bitwise, and patch operators.
 */
export const extendedOperatorRegistry = new OperatorRegistry([
  ...arithmeticOperators,
  ...comparisonOperators,
  ...logicalOperators,
  ...typeOperators,
  ...containerOperators,
  ...stringOperators,
  ...arrayOperators,
  ...objectOperators,
  ...branchingOperators,
  ...inputOperators,
  ...binaryOperators,
  ...bitwiseOperators,
  ...patchOperators,
]);