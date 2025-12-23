// This file patches the missing setBlocking function in the WebContainer environment
// It must be loaded before Next.js starts

try {
  if (!process.stdout._handle) process.stdout._handle = {};
  if (!process.stdout._handle.setBlocking) {
    process.stdout._handle.setBlocking = () => {};
  }

  if (!process.stderr._handle) process.stderr._handle = {};
  if (!process.stderr._handle.setBlocking) {
    process.stderr._handle.setBlocking = () => {};
  }
  
  console.log('[Polyfill] Applied process.stdout/stderr.setBlocking fix');
} catch (e) {
  console.warn('[Polyfill] Failed to apply fix:', e);
}
