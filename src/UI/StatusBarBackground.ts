import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class StatusBarBackground {
  private _statusBarItem: vscode.StatusBarItem;
  private _animationText: string;

  public get text(): string {
    return this._statusBarItem.text;};
  public set text(value:string) {
    this._statusBarItem.text=value;
  };

  public get tooltip(): string | vscode.MarkdownString | undefined {
    return this._statusBarItem.tooltip;};
  public set tooltip(value:string | vscode.MarkdownString | undefined) {
    this._statusBarItem.tooltip=value;
  };
  
  constructor(
    statusBarItem: vscode.StatusBarItem,
    animationText: string="$(loading~spin)"
  ){
    this._statusBarItem=statusBarItem;
    this._animationText=animationText;
  }

  public show = () => this._statusBarItem.show();
  public hide = () => this._statusBarItem.hide();

  public showAnimation(text:string,tooltip:string | vscode.MarkdownString | undefined) {
    if(!tooltip) tooltip=text;
    this._statusBarItem.text=`${this._animationText} ${text}`;
    this._statusBarItem.tooltip=tooltip;
    this._statusBarItem.show();
  }
}
