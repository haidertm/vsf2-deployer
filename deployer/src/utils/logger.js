import { config } from '../config/index.js'
const styles = {
  error: 'color: red; font-weight: bold',
  warn: 'color: orange; font-weight: bold',
  info: 'color: blue',
  debug: 'color: gray'
};

const isLoggingEnabled = config.debug ?? true; // Set this to false to disable logging

// No need to put debug check on logError, we want Error Log at all times.
function logError (message, ...data) {
  console.error(`%c[Error] ${ message }`, styles.error, ...data);
}

function logWarn(message, ...data) {
  if (isLoggingEnabled) {
    console.warn(`%c[Warn] ${message}`, styles.warn, ...data);
  }
}

function logInfo (message, ...data) {
  console.info(`%c[Info] ${ message }`, styles.info, ...data);
}

function logDebug(message, ...data) {
  if (isLoggingEnabled) {
    console.log(`%c[Debug] ${message}`, styles.debug, ...data);
  }
}

// Optional: A generic log function if you need one
function log(message, style = 'color: black', ...data) {
  if (isLoggingEnabled) {
    console.log(`%c${message}`, style, ...data);
  }
}

// If you want to use these functions elsewhere, you can export them like so:
export {
  logError,
  logWarn,
  logInfo,
  logDebug,
  log
};
