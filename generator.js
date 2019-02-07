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