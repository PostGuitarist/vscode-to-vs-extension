import * as assert from 'assert';
import * as vscode from 'vscode';
import { generateGUID } from '../../guidGenerator';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('generateGUID generates a valid GUID', () => {
        const guid = generateGUID();
        assert.match(guid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
});