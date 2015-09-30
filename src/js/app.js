var Signer = require('./signer');

var signing = null;

document.getElementById('optionSetter').addEventListener('click', function (e) {
  createSigner();
});

createSigner();

function createSigner() {
  if (signing !== null) {
    signing.destroy();
  }

  var options = {
    signerId : 'signature',
    draftColor : '0x' + document.getElementById('tempcolor').value,
    color : '0x' + document.getElementById('signaturecolor').value
  };

  signing = new Signer(options);
}