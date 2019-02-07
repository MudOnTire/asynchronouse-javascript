# 同步和异步（Synchronous and Asynchronous）

了解javascript的同学想必对同步和异步的概念应该都很熟悉了，如果还有不熟悉的同学，我这里举个形象的例子，比如我们早上起床后要干三件事：烧水、洗脸、吃早饭，同步相当于我们先烧水，水烧开了再洗脸，洗完脸再吃早饭，三件事顺序执行，一件干完了再干下一件；而异步相当于我们在烧水的同时吃早饭（不洗脸就吃早饭不太卫生），吃完早饭再洗脸。显然异步比同步更加高效，省去了很多等待的时间，同步过程的执行时间取决于所有行为的总和，而异步过程的执行时间只取决于最长的那个行为，如下图所示：


![image](http://lc-jOYHMCEn.cn-n1.lcfile.com/dba3f5fb4c37cdc2e75c.png)


由于Javascript是单线程的，同时只能处理一件事，在上面的例子中这个单线程就是“我”，比如我不能同时洗脸和吃早饭一样。所以为了让执行效率提高，我们要尽量让这个线程一直处于忙碌状态而不是闲置状态，就像我们不用干等烧水，可以同时去做其他事情，而烧水由系统的其他线程去处理（该线程不属于Javascript）。在计算机的世界中，很多I/O密集型的操作是需要等待的，比如网络请求、文件读写等，所以异步方法在处理这些操作会更加得心应手。

# 异步过程控制

了解异步的意义之后，我们来对比目前主流几种异步过程控制方法，探讨一下异步编程的最佳实践。

## 1. Callback

### 误区

首先callback和异步没有必然联系，callback本质就是类型为function的函数参数，对于该callback是同步还是异步执行则取决于函数本身。虽然callback常用于异步方法的回调，但其实有不少同步方法也可以传入callback，比如最常见的数组的`forEach`方法：

```
var arr = [1, 2, 3];
arr.forEach(function (val) {
  console.log(val);
});
console.log('finish');

// 打印结果：1，2，3，finish
```

类似的还有数组的`map`, `filter`, `reduce`等很多方法。

### 异步Callback

常见的异步callback如`setTimeout`中的回调：

```
setTimeout(function () {
  console.log("time's up");
}, 1000);
console.log('finish');

// 打印结果：finish, time's up
```

如果我们将延迟时间改为`0`，打印结果仍将是`finish, time's up`，因为异步callback会等函数中的同步方法都执行完成后再执行。

### Callback Hell

在实际项目中我们经常会遇到这样的问题：下一步操作依赖于上一步操作的结果，上一步操作又依赖于上上步操作，而每一步操作都是异步的。。这样递进的层级多了会形成很多层callback嵌套，导致代码可读性和可维护性变的很差，形成所谓的Callback Hell，类似这样：

```
step1(param, function (result1) {
  step2(result1, function (result2) {
    step3(result2, function (result3) {
      step4(result3, function (result4) {
        done(result4);
      })
    })
  })
})
```

当然在不放弃使用callback的前提下，上面的代码还是有优化空间的，我们可以将它重新组织一下：

```
step1(param, callbac1);

function callback1(result1){
  step2(result1, callback2);
}

function callback2(result2){
  step3(result2, callback3);
}

function callback3(result3){
  step4(result3, callback4);
}

function callback4(result4){
  done(result4);
}
```

相当于将Callback Hell的横向深度转化为代码的纵向高度，变得更接近于我们习惯的由上到下的同步调用， 复杂度没有变，只是看起来更清晰了，缺点就是要定义额外的函数、变量。将这一思想进一步延伸就有了下面的Promise。

## 2. Promise

Promise中文译为“承诺”，在Javascript中是一个抽象的概念，代表当前没有实现，但未来的某个时间点会（也可能不会）实现的一件事。举个实例化的例子：早上烧水，我给你一个承诺（Promise），十分钟后水能烧开，如果一切正常，10分钟之后水确实能烧开，代表这个promise兑现了（fullfilled），但是如果中途停电了，10分钟水没烧开，那这个promise兑现失败（rejected）。用代码可以表示为：

```
const boilWaterInTenMins = new Promise(function (resolve, reject) {
  boiler.work(function (timeSpent) {
    if (timeSpent <= 10) {
      resolve();
    } else {
      reject();
    }
  });
});
```

### 兼容性

![image](http://lc-jOYHMCEn.cn-n1.lcfile.com/9d72d69613831a7003eb.png)

如果想提高浏览器对Promise的兼容性可以使用babel或者第三方的实现（参考 [github awesome promise](https://github.com/wbinnssmith/awesome-promises#promisesa-implementations-es6es2015-compatible)）

### Promise Chaining

我们再来看Promise对于异步过程控制有怎样的提升，还基于上面Callback Hell的例子，如果用Promise实现会如何呢？

首先我们需要将`step1` ~ `done` 的函数用Promise实现（即返回一个Promise），然后进行一连串的链式调用就可以了：

```
stepOne(param)
  .then((result1) => { return step2(result1) })
  .then((result2) => { return step3(result2) })
  .then((result3) => { return step4(result3) })
  .then((result4) => { return done(result4) })
  .catch(err => handleError(err));
```

是不是简单很多！

### Async/Await

如果你不太习惯Promise的调用方式，那我们可以用async/await将其转化成更接近同步调用的方式：

```
async function main() {
  try {
    var result1 = await step1(param);
    var result2 = await step2(result1);
    var result3 = await step3(result2);
    var result4 = await step4(result3);
    done(result4);
  } catch (err) {
    handleError(err);
  }
}

main();
```

## 3. Generator

Generator是一个更加抽象的概念，要弄懂什么是Generator首先要理解另外几个概念Iterable Protocol（可迭代协议），Iterator Protocol（迭代器协议）和 Iterator（迭代器）。

### Iterable Protocol

Iterable Protocol 的特点可以概括为：

1. 用于定义javascript对象的迭代行为
2. 对象本身或者原型链上需要有一个名为`Symbol.iterator`的方法
3. 该方法不接收任何参数，且返回一个Iterator
4. Iterable的对象可以使用`for...of`遍历

Javascript Array就实现了Iterable Protocol，除了常规的取值方式，我们也可以利用array的`Symbol.iterator`：

```
var arr = [1, 2, 3];
var iterator = arr[Symbol.iterator]();
iterator.next(); // {value: 1, done: false}
```

我们也可以修改Array默认的迭代方式，比如返回两倍的值：

```
Array.prototype[Symbol.iterator] = function () {
  var nextIndex = 0;
  var self = this;
  return {
    next: function () {
      return nextIndex < self.length ?
        { value: self[nextIndex++] * 2, done: false } :
        { done: true }
    }
  };
}

for(let el of [1, 2, 3]){
  console.log(el);
}
// 输出：2，4，6

```

### Iterator Protocol

Iterator Protocol 的特点可以概括为：

1. 一种产生一个序列值（有限或无限）的标准方式
2. 实现一个next方法
3. next方法返回的对象为 `{value: any, done: boolean}`
4. `value`为返回值，`done`为`true`时`value`可以省略
5. `done`为`true`表示迭代结束，此时`value`表示最终返回值
6. `done`为`false`，则可以继续迭代，产生下一个值

### Iterator

显然Iterator就是实现了Iterator Protocol的对象。

### Generator

理解上面几个概念后，理解Generator就简单多了，generator的特点可概括为：

1. 同时实现Iterable Protocol和Iterator Protocol，所以Genrator即是一个iterable的对象又是一个iterator
2. Generator由 [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) 生成

最简单的generator function比如：

```
function* gen() {
  var x = yield 5 + 6;
}

var myGen = gen(); // myGen 就是一个generator
```

我们可以调用next方法来获得`yield`表达式的值：

```
myGen.next(); // { value: 11, done: false }
```

但此时`x`并没有被赋值，可以想象成javascript执行完 `yield 5 + 6` 就停住了，为了继续执行赋值操作我们需要再次调用`next`，并将得到的值回传：

```
function* gen() {
  var x = yield 5 + 6;
  console.log(x); // 11
}

var myGen = gen();
console.log(myGen.next()); // { value: 11, done: false }
console.log(myGen.next(11)); // { value: undefined, done: true }
```

说了这么多，generator和异步到底有什么关系呢？我们来看Promise + Generator 实现的异步控制（step1 ~ done 返回Promise）：

```
genWrap(function* () {
  var result1 = yield step1(param);
  var result2 = yield step2(result1);
  var result3 = yield step3(result2);
  var result4 = yield step4(result3);
  var result5 = yield done(result4);
});

function genWrap(genFunc) {
  var generator = genFunc();

  function handle(yielded) {
    if (!yielded.done) {
      yielded.value.then(function (result) {
        return handle(generator.next(result));
      });
    }
  }

  return handle(generator.next());
}
```

和async/await类似，这种实现也将异步方法转化成了同步的写法，实际上这就是 ES7中async/await的实现原理（将genWrap替换为async，将yield替换成await）。

### 结语

希望本文对大家有点帮助，能更深刻的理解javascript异步编程，能写出更优雅更高效的代码。有错误欢迎指正。新年快乐！