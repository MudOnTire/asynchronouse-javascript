// (function () {
//   var http = new XMLHttpRequest();

//   http.onreadystatechange = function () {
//     if (http.readyState === 4 && http.status === 200) {
//       console.log(JSON.parse(http.response));
//     }
//   }

//   http.open("GET", "data/messages.json", true);
//   http.send();
// })();

// (function () {
//   $.get('data/messages.json', function (data) {
//     console.log(data);
//   });
// })();

stepOne(param1, function (result1) {
  stepTwo(result1, function (result2) {
    stepThree(result2, function (result3) {
      stepFour(result3, function (result4) {
        done(result4);
      })
    })
  })
})

function callbackOne(result1) {
  stepTwo(result1, callbackTwo);
}

function callbackTwo(result2) {
  stepThree(result2, callbackThree);
}

function callbackThree(result3) {
  stepFour(result3, callbackFour);
}

function callbackFour(result4) {
  done(result4);
}

stepOne(param, callbackOne);


stepOne(param)
  .then((result1) => { return stepTwo(result1) })
  .then((result2) => { return stepThree(result2) })
  .then((result3) => { return stepFour(result3) })
  .then((result4) => { return done(result4) })
  .catch(err => handleError(err));

async function main() {
  try {
    var result1 = await stepOne(param);
    var result2 = await stepTwo(result1);
    var result3 = await stepThree(result2);
    var result4 = await stepFour(result3);
    done(result4);
  } catch (err) {
    handleError(err);
  }
}

main();

var arr = [1, 2, 3];

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

var iterator = arr[Symbol.iterator]();
iterator.next(); // {value: 1, done: false}


function* gen() { 
  yield 1;
  yield 2;
  yield 3;
}

var g = gen()
