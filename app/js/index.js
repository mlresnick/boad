/*global $ Favorites platform Bootcards bootcards*/
/*eslint no-undef: "error"*/

$(document).ready( function() {

  bootcards.init( {
    offCanvasBackdrop : true,
    offCanvasHideOnMainClick : true,
    enableTabletPortraitMode : true,
    disableRubberBanding : true,
    disableBreakoutSelector : "a.no-break-out"
  });

  function addPageSwitch(name, opts) {
    opts = opts || {};
    var newPage = name.toLowerCase();
    var clazz = "." + newPage;
    var btnClass = clazz + "-btn";
    opts.title = opts.title || name;

    $(btnClass).on("click", function () {
      var activatableNodes;
      $("[class^='page-'].boad-active, [class*=' page-'].boad-active").removeClass("boad-active");
      $(".navbar-collapse ul.nav > li.active").removeClass("active");
      $(".navbar-collapse").collapse("hide");
      $("#footer .active").removeClass("active");
      Bootcards.OffCanvas.hide();

      if (platform === "desktop") {
        activatableNodes = $(this).parent();
      }
      else {
        activatableNodes = $(this);
        $(".navbar-brand").text(opts.title);
      }

      $(activatableNodes).addClass("active");

      if (opts.updatePage) {
        opts.updatePage();
      }

      $(".page-" + newPage).addClass("boad-active");
    });
  }

  addPageSwitch("Calculator", { title: "B.o.A.D" });
  addPageSwitch("Favorites", { updatePage: Favorites.getInstance().updateDisplay });
  addPageSwitch("History");
  addPageSwitch("Settings");

  $("#newFavoriteName").keypress(function (e) {
    if (e.which == 13) {
      $("#favorite-name-modal button[type='submit']").click();
      return false;
    }
  });

  $(".page-favorites.edit-btn").click(function () {
    $(".favorites-list, " +
      ".favorites-list .control, "+
      ".page-favorites.edit-btn, " +
      ".page-favorites.done-btn").addClass("edit");
  });

  $(".page-favorites.done-btn").click(function () {
    $(".favorites-list, " +
      ".favorites-list .control, "+
      ".page-favorites.edit-btn, " +
      ".page-favorites.done-btn").removeClass("edit");
  });

  $("#favorite-name-modal").on ("shown.bs.modal", function () {
    $("#newFavoriteName").focus();
  });

  return false;
});
