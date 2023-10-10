(function () {
  'use strict';

  function fibonacci(iterations) {
    let val = 0;
    let last = 0;

    if (iterations > 0) {
      val++;

      for (let i = 1; i < iterations; i++) {
        let seq;

        seq = val + last;
        last = val;
        val = seq;
      }
    }

    return val;
  }

  function multiplyInt(a, b, n) {
    let c = 1;
    for (let i = 0; i < n; i++) {
      c = c * a * b;
    }
    return c;
  }

  function quicksortInt(array, start, end) {
    if (start >= end) {
      return;
    }
    let pivot = array[end];
    let left = 0;
    let right = 0;
    while (left + right < end - start) {
      let num = array[start + left];
      if (num < pivot) {
        left++;
      } else {
        array[start + left] = array[end - right - 1];
        array[end - right - 1] = pivot;
        array[end - right] = num;
        right++;
      }
    }
    quicksortInt(array, start, start + left - 1);
    quicksortInt(array, start + left + 1, end);
  }

  function randomizeIntArray(array) {
    for (var i = 0, il = array.length; i < il; i++) {
      array[i] = ((Math.random() * 20000) | 0) - 10000;
    }
  }

  const ALGORITHM_FIRST = 0;
  const FIBONACCI = 0;
  const MULTIPLY_INT = 1;
  const QUICKSORT_INT = 2;
  const FIBONACCI_ON_MAIN = 3;
  const FIBONACCI_ON_MAIN_1K = 4;
  const ALGORITHM_LAST = 4;

  function algorithmName(a) {
    switch (a) {
      case FIBONACCI:
        return "Fibonacci (1k iterations)";
      case MULTIPLY_INT:
        return "Multiply (1k iterations)";
      case QUICKSORT_INT:
        return "Quicksort (1 iteration)";
      case FIBONACCI_ON_MAIN:
        return "Fibonacci (1 cross-thread invocation -> 1k iterations)";
      case FIBONACCI_ON_MAIN_1K:
        return "Fibonacci (1k cross-thread invocations -> 1 iteration)";
      default:
        throw new Error("Unknown Algorithm");
    }
  }

  function algorithmDescription(a) {
    switch (a) {
      case FIBONACCI:
        return "1,000 iterations of fibonacci(50), performed on the main thread AND each background thread";
      case MULTIPLY_INT:
        return "1,000 integer multiplications, performed on the main thread AND each background thread";
      case QUICKSORT_INT:
        return "Quicksort array with 1,000 members, performed on the main thread AND each background thread";
      case FIBONACCI_ON_MAIN:
        return "1,000 iterations of fibonacci(50), performed ONLY on the main thread, initiated with a single call from each background thread";
      case FIBONACCI_ON_MAIN_1K:
        return "1 iteration of fibonacci(50), performed ONLY on the main thread, initiated 1,000 times from each background thread";
      default:
        throw new Error("Unknown Algorithm");
    }
  }

  function performFibonacci() {
    const n = 1000;
    for (let i = 0; i < n; i++) {
      fibonacci(50);
    }
  }

  function performMultiplyInt() {
    multiplyInt(1, 1, 1000);
  }

  function performQuicksortInt() {
    let qs_int_array = new Array(1000);
    randomizeIntArray(qs_int_array);
    quicksortInt(qs_int_array, 0, 999);
  }

  function performFibonacciOnMain(isMainThread, isPostMessage) {
    if (isMainThread) {
      if (isPostMessage) {
        performFibonacci();
      }
    } else {
      postMessage({ algorithm: FIBONACCI_ON_MAIN });
    }
  }

  function performFibonacciOnMain1K(isMainThread, isPostMessage) {
    if (isMainThread) {
      if (isPostMessage) {
        fibonacci(50);
      }
    } else {
      const n = 1000;
      for (let i = 0; i < n; i++) {
        postMessage({ algorithm: FIBONACCI_ON_MAIN_1K });
      }
    }
  }

  function performAlgorithm(a, isMainThread, isPostMessage) {
    switch (a) {
      case FIBONACCI:
        performFibonacci();
        break;
      case MULTIPLY_INT:
        performMultiplyInt();
        break;
      case QUICKSORT_INT:
        performQuicksortInt();
        break;
      case FIBONACCI_ON_MAIN:
        performFibonacciOnMain(isMainThread, isPostMessage);
        break;
      case FIBONACCI_ON_MAIN_1K:
        performFibonacciOnMain1K(isMainThread, isPostMessage);
        break;
    }
  }

  onmessage = function(e) {
    const { algorithm, thread, iterations } = e.data;
    const a = parseInt(algorithm);

    for (let i = 0; i < iterations; i++) {
      performAlgorithm(a, false, false);
    }

    postMessage(thread);
  };

}());
