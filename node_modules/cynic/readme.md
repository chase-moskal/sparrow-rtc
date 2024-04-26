
# 🧐 cynic

## async testing framework for es modules

- cynic is designed to be dirt-simple, because i'm sick of overcomplicated testing frameworks
- the test suites are just nested async functions
- the whole framework is just simple es modules that run anywhere: node, browser, puppeteer, deno
- no magic assumptions are made about or foisted onto the environment: the assertion library and everything else is just simply imported like from any other module
- examples here are shown in typescript, but of course you can use vanilla js

## let's get cynical, and make a damn test suite!

1. install cynic into your project

    ```sh
    npm install --save-dev cynic
    ```

2. write a test suite, `example.test.ts`

    ```ts
    import {Suite, assert, expect} from "cynic"

    export default <Suite>{
      "alpha system": {
        "can sum two numbers (boolean return)": async() => {
          const a = 1
          const b = 2
          // no assertion library required:
          // simply returning false, or throwing, will fail a test
          return (a + b) === 3
        },
        "can sum three numbers (assert)": async() => {
          const a = 1
          const b = 2
          const c = 3
          // benefits of 'assert'
          //  - you get a stack trace
          //  - you can provide a custom message for each failure
          assert((a + b + c) === 6, `sum is wrong`)
        }
      },
      "bravo system": {
        "can multiply numbers (expect)": async() => {
          const a = 2
          const b = 3
          // benefits of 'expect'
          //  - you get a stack trace
          //  - cynic tries to invent a message about the failure
          expect(a * b).equals(6)
          expect(a * b * a).equals(12)
        }
      }
    }
    ```

## now run it!

- ### **you can run the suite file through the cynic cli**

    ```sh
    # run your tests in node
    cynic node example.test.js

    # run your tests in browser
    cynic browser example.test.js

    # run your tests in puppeteer (headless browser)
    cynic puppeteer example.test.js

    # use node debugger
    node inspect node_modules/cynic/dist/cli.js node example.test.js
    ```

    cynic executes the default export as a test suite

    optional arguments for *all* runtimes:
    - `--label="test suite"` — the report title

    optional arguments for *browser* and *puppeteer* runtimes:
    - `--open=false` — true to prompt open your default browser
    - `--port=8021` — run the server on a different port
    - `--origin="http://localhost:8021"` — connect to the server via an alternative url (mind the port number!)
    - `--cynic-path=node_modules/cynic` — use an alternative path to the cynic library's root
    - `--importmap-path=./dist/importmap.json` — provide an import map for your test suites

    if puppeteer isn't running properly, see puppeteer's [troubleshooting.md](https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md)

- ### **or you can just execute your test suite, manually, anywhere**

    this should work anywhere you can import an es module

    ```ts
    import {test} from "cynic"
    import suite from "./example.test.js"

    ;(async() => {

      // run the test suite
      const {report, ...stats} = await test("example suite", suite)

      // emit the report text to console
      console.log(report)

      // handle results programmatically
      if (stats.failed === 0) console.log("done")
      else console.log("failed!")

      // returns stats about the test run results
      console.log(stats)

    })()
    ```

    see which stats are available in the `Stats` interface in [types.ts](./source/types.ts)

## so what do the console reports look like?

- **report: successful run**

    ```
    cynic example suite
    
      ▽ examples
        ▽ alpha system
          ✓ can sum two numbers (boolean return)
          ✓ can sum three numbers (assertion)
        ▽ bravo system
          ✓ can multiply numbers (expectation)
    
    0 failed tests
    0 thrown errors
    3 passed tests
    3 total tests
    0.00 seconds
    ```

- **report: a test returns false**  
    return false to indicate a failed test

    ```
    cynic example suite
    
      ▽ examples
        ▽ alpha system
    
    ═════ ✘ can sum two numbers (boolean return)
    
        ▽ bravo system

    ✘ can sum two numbers (boolean return) — failed

    1 FAILED tests
    0 thrown errors
    2 passed tests
    3 total tests
    0.00 seconds
    ```

- **report: a test throws**  
    a thrown string or error will be shown as the failure reason

    ```
    cynic example suite

      ▽ examples
        ▽ alpha system

    ═════ ✘ can sum two numbers (boolean return)
    ――――――― arithmetic failed for interesting reasons

        ▽ bravo system

    ✘ can sum two numbers (boolean return) — arithmetic failed for interesting reasons

    1 FAILED tests
    1 thrown errors
    2 passed tests
    3 total tests
    0.00 seconds
    ```

- **report: a test fails an assertion**  
    assertions will display a stack trace, and optional custom message

    ```
    cynic example suite

      ▽ examples
        ▽ alpha system
    
    ═════ ✘ can sum three numbers (assertion)
    ――――――― CynicBrokenAssertion: sum is wrong
              at assert (file:///work/cynic/dist/assert.js:7:15)
              at can sum three numbers (assertion) (file:///work/cynic/dist/internals/example.test.js:13:20)
              at execute (file:///work/cynic/dist/internals/execute.js:13:34)
              [...]

        ▽ bravo system

    ✘ can sum three numbers (assertion) — CynicBrokenAssertion: sum is wrong

    1 FAILED tests
    1 thrown errors
    2 passed tests
    3 total tests
    0.00 seconds
    ```

- **report: a test fails an expectation**  
    stack trace is provided, and a failure reason is generated automatically

    ```
    cynic example suite
    
      ▽ examples
        ▽ alpha system
        ▽ bravo system

    ═════ ✘ can multiply numbers (expectation)
    ――――――― CynicBrokenExpectation: expect(7).equals(6): not equal, should be
              at composite (file:///work/cynic/dist/expect.js:46:19)
              at Object.equals (file:///work/cynic/dist/expect.js:25:125)
              at can multiply numbers (expectation) (file:///work/cynic/dist/internals/example.test.js:20:39)
              at execute (file:///work/cynic/dist/internals/execute.js:13:34)
              [...]

    ✘ can multiply numbers (expectation) — CynicBrokenExpectation: expect(7).equals(6): not equal, should be

    1 FAILED tests
    1 thrown errors
    2 passed tests
    3 total tests
    0.00 seconds
    ```

## hot tips for big brains

- use object nesting to group and organize tests arbitrarily

    ```ts
    import {Suite} from "cynic"
    export default <Suite>{
      "nested tests": {
        "more nested": {
          "exceedingly nested": {
            "it works": async() => true
          }
        }
      }
    }
    ```

- you can just throw strings as assertions

    ```ts
    import {Suite} from "cynic"
    export default <Suite>{
      "assertions and expectations": async() => {
        const example = "abc"

        // let's call it "the spartan assertion"
        if (!example.includes("b"))
          throw `expected example to include "b"`

        return true
      }
    }
    ```

- or you can use the handy `assert` function to do that, you get stack traces

    ```ts
    import {Suite, assert} from "cynic"
    export default <Suite>{
      "using 'assert'": async() => {
        const example = "abc"
        assert(example === "abc", `example must equal "abc"`)
        assert(example.includes("b"), `example should include "b"`)
      }
    }
    ```

- or you can also use the experimental new `expect` api, you get auto-generated messages and stack traces

    ```ts
    import {Suite, expect} from "cynic"
    export default <Suite>{
      "using 'expect'": async() => {
        const example = "abc"
        expect(example).defined()
        expect(example).equals("abc")
      }
    }
    ```

- a suite or test can return another suite or test — *easy setups!*

    ```ts
    export default <Suite>(async() => {

      // doing some async setup
      const myFile = await loadFile("myfile.json")

      // returning more tests
      return {
        "group of tests": {
          "my file exists": async() => {
            return !!myFile
          }
        }
      }
    })
    ```

## food for thought

- 🥃 chase moskal made this with open source love. please contribute!
