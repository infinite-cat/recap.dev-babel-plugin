const pluginTester = require('babel-plugin-tester').default;
const yourPlugin = require('./index');

pluginTester({
  plugin: yourPlugin,
  pluginName: 'identifier reverse',
  tests: [
    {
      code: `
        function sayHi(person) {
          // do some work
          5 + 4;
          const a = 145;
          a + 4;
          return 'Hello ' + person + '!'
        }

        function noReturn() {
          console.log('test')
        }

        const testArrow = () => {
          const x = 3 + 5
          console.log(x)
          return x
        }

        class TestClass {
          testMethod() {
            console.log('test class', this)
          }
        }

        sayHi()
        noReturn()

      `,
      snapshot: true,
    },
  ],
})
