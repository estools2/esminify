'use strict';

const should = require('should');
const testMod = require('../index');
describe('minify', function () {

  describe('fixture', function () {

  });

  describe('minify code', function () {
    it('should work fine', function () {
      let code = testMod.minify({
        code: 'let test = [1, 2];',
        cmd: true
      });
      code.should.eql('let a=[1,2]');
    });
  });

  describe('minify ast', function () {
    it('should work fine', function () {
      let ast = {
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
                      type: 'Literal',
                      value: 1,
                      raw: '1'
                    },
                    {
                      type: 'Literal',
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
        sourceType: 'script'
      }
      let code = testMod.minify({
        ast: ast,
        cmd: true
      });
      code.should.eql('let a=[1,2]');
    });
  });
});