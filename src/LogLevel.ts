import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Defines logging severity levels.
 */
export enum LogLevel {
  /**
   * Logs that contain the most detailed messages.
   */
  Trace=0,

  /**
   * Logs that are used for interactive investigation during development.
   */
  Debug=1,

  /**
   * Logs that track the general flow of the application.
   */
  Information=2,

  /**
   * Logs that highlight an abnormal or unexpected event in the application flow, but do not otherwise cause the application execution to stop.
   */
  Warning=3,

  /**
   * Logs that highlight when the current flow of execution is stopped due to a failure.
   */
  Error=4
}
