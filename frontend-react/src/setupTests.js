// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock TextEncoder/TextDecoder for streaming tests
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock ReadableStream for streaming tests
global.ReadableStream = class ReadableStream {
  constructor(underlyingSource) {
    this.underlyingSource = underlyingSource;
  }
  
  getReader() {
    const source = this.underlyingSource;
    let started = false;
    
    return {
      async read() {
        if (!started) {
          started = true;
          if (source.start) {
            const controller = {
              enqueue: (chunk) => {
                this.chunk = chunk;
              },
              close: () => {
                this.closed = true;
              }
            };
            await source.start(controller);
            return { done: this.closed, value: this.chunk };
          }
        }
        return { done: true };
      }
    };
  }
};

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();
