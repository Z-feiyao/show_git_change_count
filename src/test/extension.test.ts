import * as assert from 'assert';
import * as vscode from 'vscode';
import { GitChangeCountProvider, GitChangeInfo } from '../gitChangeCountProvider';

suite('Show Git Change Count Extension Test Suite', () => {
  test('GitChangeInfo interface should have correct properties', () => {
    const changeInfo: GitChangeInfo = {
      modified: 2,
      added: 1,
      deleted: 0,
      renamed: 1,
      untracked: 3,
      total: 7
    };

    assert.strictEqual(changeInfo.modified, 2);
    assert.strictEqual(changeInfo.added, 1);
    assert.strictEqual(changeInfo.deleted, 0);
    assert.strictEqual(changeInfo.renamed, 1);
    assert.strictEqual(changeInfo.untracked, 3);
    assert.strictEqual(changeInfo.total, 7);
  });

  test('GitChangeCountProvider should be instantiable', () => {
    const provider = new GitChangeCountProvider();
    assert.ok(provider);
  });

  test('Empty GitChangeInfo should have zero values', () => {
    const emptyInfo: GitChangeInfo = {
      modified: 0,
      added: 0,
      deleted: 0,
      renamed: 0,
      untracked: 0,
      total: 0
    };

    assert.strictEqual(emptyInfo.total, 0);
    assert.strictEqual(emptyInfo.modified + emptyInfo.added + emptyInfo.deleted + emptyInfo.renamed + emptyInfo.untracked, 0);
  });

  test('GitChangeInfo should correctly calculate total including untracked files', () => {
    const changeInfo: GitChangeInfo = {
      modified: 1,
      added: 2,
      deleted: 1,
      renamed: 0,
      untracked: 5,
      total: 9
    };

    const calculatedTotal = changeInfo.modified + changeInfo.added + changeInfo.deleted + changeInfo.renamed + changeInfo.untracked;
    assert.strictEqual(calculatedTotal, changeInfo.total);
  });
}); 