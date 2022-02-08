'use strict';

const should = require('should');
const testMod = require('../index');
const fs = require('fs');
const path = require('path');

const fixtures = [];

let files = fs.readdirSync(path.join(__dirname, './fixture'));


describe('minify', function () {

  describe('fixture', function () {
    files.forEach(function (f) {
      if (/\.min\.js$/.test(f)) {
        return;
      }
      it('should work fine: ' + f, function () {
        let miniCode = testMod.minify({
          code: fs.readFileSync(path.join(__dirname, './fixture/' + f)).toString(),
          cmd: true,
          strictMod: true
        });
        eval(miniCode);
        miniCode.should.eql(
          fs.readFileSync(
            path.join(__dirname, './fixture/' + f.replace(/\.js$/, '.min.js'))
          ).toString()
        );
      });
    });
  });

  describe('minify code', function () {
    it('should work fine', function () {
      let code = testMod.minify({
        code: 'let test = [1, 2];',
        cmd: true
      });
      code.should.eql('let a=[1,2];');
    });
    it('should work fine without deadcode', function () {
      let code = testMod.minify({
        code: 'function abc(param, name) {return arguments.length}',
        cmd: true,
        config: {
          deadcode: {
            keepFnArgs: true
          }
        }
      });
      code.should.eql('function a(a,b){return arguments.length}');
    });
  });

  describe('minify ast', function () {
    it('should work fine', function () {
      let ast = {
        type: 'File',
        tokens: [],
        comments: [],
        program: {
          type: 'Program',
          body: [
            {
              type: 'VariableDeclaration',
              declarations: [
                {
                  type: 'VariableDeclarator',
                  id: {
                      type: 'Identifier',
                      name: 'test'
                  },
                  init: {
                    type: 'ArrayExpression',
                    elements: [
                      {
                        type: 'NumericLiteral',
                        value: 1,
                        raw: '1'
                      },
                      {
                        type: 'NumericLiteral',
                        value: 2,
                        raw: '2'
                      }
                    ]
                  }
                }
              ],
              kind: 'let'
            }
          ],
          sourceType: 'module'
        }
      }
      let code = testMod.minify({
        ast: ast,
        cmd: true
      });
      code.should.eql('let a=[1,2];');
    });
  });

  describe('parse ast', function () {
    it('should work fine', function () {
      let ast = testMod.parse('let a=[1,2]');
      ast.program.type.should.eql('Program');
    });
  });
});