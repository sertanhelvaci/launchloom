  var imagekit = new ImageKit({
    publicKey: "public_RlHiFa9SqYHuddoOjFik0FyCAg8=",
    urlEndpoint: "https://ik.imagekit.io/6camnbsww"
  });

  var userEmail;
  var userId;

  let photoData = {
    email: '',
    id: '',
    logoUrl: '',
    previewUrl: ''
  };

  // Benzersiz ID oluşturma
  function generateUniqueId() {
    return 'ID_' + Math.random().toString(36).substr(2, 9);
  }

  function assignUserId(email) {
    userId = generateUniqueId();
    photoData.email = email;
    photoData.id = userId;
    return userId;
  }

  function upload(event) {
    event.preventDefault();

    ['logo', 'preview'].forEach((id) => {
      var image = croppedImages[id];
      if (image) {
        var blob = dataURLtoBlob(image); 

        google.script.run.withSuccessHandler((auth) => {
          uploadImage(auth, blob, id + '.png', (err, result) => {
            if (err) {
              console.error(`${id} yükleme hatası:`, err); 
            } else {
              console.log(`${id} başarıyla yüklendi:`, result); 

              if (id === 'logo') {
                photoData.logoUrl = result.url;
              } else if (id === 'preview') {
                photoData.previewUrl = result.url;
              }

              if (photoData.logoUrl && photoData.previewUrl) { 
                 showDoneMessage();
              }
            }
          });
        }).generateSignature();
      }
    });
  }

  function uploadImage(auth, blob, fileName, callback) {
    imagekit.upload({
      file: blob,
      fileName: fileName,
      token: auth.token,
      signature: auth.signature,
      expire: auth.expire
    }, function (err, result) {
      callback(err, result);
    });
  }

  function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  function checkUserEmail(email) {
    const allowedDomain = "@atolye15.com";
    if (!email || !email.endsWith(allowedDomain)) {
      showErrorMessage();
      return false;
    }
    return true;
  }

  // Google Apps Script'ten kullanıcı e-postasını alma fonksiyonu
  google.script.run
    .withSuccessHandler(function (email) {
      if (checkUserEmail(email)) {
        // Benzersiz bir ID atayın ve saklayın
        assignUserId(email);
      }
    })
    .getUserEmail();

  // Dosya girişlerini izlemeye başla
  updateFileName('logo');
  updateFileName('preview');