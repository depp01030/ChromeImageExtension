// Script to unlock right-click restrictions
document.addEventListener(
  "contextmenu",
  function (e) {
    e.stopPropagation();
  },
  true
);

  