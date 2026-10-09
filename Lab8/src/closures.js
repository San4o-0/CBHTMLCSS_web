/**
 * @typedef {object} Counter
 * @property {() => number} increment збільшує значення на 1 і повертає нове
 * @property {() => number} reset повертає значення до початкового і повертає його
 * @property {() => number} value поточне значення
 */

/**
 * C5.1. Створює лічильник.
 * Специфікація — ТЗ, C5.
 *
 * @param {number} [start]
 * @returns {Counter}
 */
export function createCounter(start = 0) {
  // count живе в замиканні: кожен виклик createCounter створює власну змінну
  let count = start;

  // стрілочні функції не залежать від this, тож методи працюють і після деструктуризації
  return {
    increment: () => ++count,
    reset: () => (count = start),
    value: () => count,
  };
}

/**
 * C5.2. Обгортає `fn` так, що вона виконується щонайбільше один раз.
 * Специфікація — ТЗ, C5.
 *
 * @template {(...args: any[]) => any} F
 * @param {F} fn
 * @returns {F}
 */
export function once(fn) {
  // окремий прапорець: перевірка result === undefined викликала б fn знову
  let called = false;
  let result;

  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

/**
 * C5.3. Запам'ятовує результати `fn` для кожного значення її єдиного аргументу.
 * Специфікація — ТЗ, C5.
 *
 * @template T, R
 * @param {(arg: T) => R} fn
 * @returns {(arg: T) => R}
 */
export function memoize(fn) {
  // Map, а не {}: ключі об'єкта стають рядками, і 1 та '1' злилися б в один
  const cache = new Map();

  return (arg) => {
    // has, а не if (cache.get(arg)): результати 0, false, undefined теж закешовані
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg));
    }
    return cache.get(arg);
  };
}
