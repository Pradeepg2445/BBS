function sm_warning(title, content) {
  $.alert({
    icon: "fa fa-exclamation-triangle",
    title: "<span style='color:red;'>" + title + "</span>",
    content: "<span style='font-size:15px;'>" + content + "</span>",
    buttons: {
      OK: {
        keys: ["q"],
        text: "OK",
        btnClass: "btn-danger",
        action: function () {},
      },
    },
  });
}

function sm_info(title, content) {
  $.alert({
    icon: "fa fa-info-circle",
    title: "<span style='color:blue;'>" + title + "</span>",
    content: "<span style='font-size:15px;'>" + content + "</span>",
    buttons: {
      OK: {
        keys: ["q"],
        text: "OK",
        btnClass: "btn-info",
        action: function () {},
      },
    },
  });
}

function sm_success(title, content) {
  $.alert({
    icon: "fa fa-check",
    title: "<span style='color:green;'>" + title + "</span>",
    content: "<span style='font-size:15px;'>" + content + "</span>",
    buttons: {
      OK: {
        keys: ["q"],
        text: "OK",
        btnClass: "btn-success",
        action: function () {
          location.reload();
        },
      },
    },
  });
}

function sm_success2(content) {
  $.toast({
    heading: "Success",
    position: "bottom-right",
    hideAfter: 1560,
    text: content,
    icon: "success",
    beforeHide: function () {
      location.reload();
    },
  });
}

function sm_warning2(content) {
  $.toast({
    heading: "Error",
    position: "bottom-right",
    hideAfter: 1780,
    text: content,
    icon: "error",
    beforeHide: function () {},
  });
}

function sm_info2(content) {
  $.toast({
    heading: "Information",
    position: "bottom-right",
    hideAfter: 1660,
    text: content,
    icon: "info",
    beforeHide: function () {},
  });
}
