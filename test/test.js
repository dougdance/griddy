module("structural", {
  'setup': function() {
    $("#container").Griddy();
  }
});

{

/*
Structural tests.  The default grid structure looks like the following:

<div class="grid">
  <div class="header">
    <div class="header_row">
      <div class="header_row_num">
      </div>
      <div class="header_cell">
      </div>
      <div class="header_cell">
      </div>
    </div>
  </div>
  <div class="body">
    <div class="row">
      <div class="row_num">
      </div>
      <div class="cell">
      </div>
      <div class="cell">
      </div>
    </div>
    <div class="row">
      <div class="row_num">
      </div>
      <div class="cell">
      </div>
      <div class="cell">
      </div>
    </div>
  </div>
  <div class="footer">
    <div class="footer_row">
      <div class="footer_row_num">
      </div>
      <div class="footer_cell">
      </div>
      <div class="footer_cell">
      </div>
    </div>
  </div>
</div>
*/

test("container has grid", function() {
  equals($("#container > .grid").size(), 1);
});

test("grid has header, body, and footer", function() {
  equals($(".grid > .header, .grid > .body, .grid > .footer").size(), 3);
});

test("header has header row", function() {
  equals($(".header > .header_row").size(), 1);
});

test("header row has header row num", function() {
  equals($(".header_row > .header_row_num").size(), 1);
});

test("header row has header cells", function() {
  equals($(".header_row > .header_cell").size(), 2);
});

test("body has rows", function() {
  equals($(".body > .row").size(), 2);
});

test("rows have row nums", function() {
  equals($(".row > .row_num").size(), 2);
});

test("rows have cells", function() {
  equals($(".row > .cell").size(), 4);
});

test("footer has footer row", function() {
  equals($(".footer > .footer_row").size(), 1);
});

test("footer row has footer row num", function() {
  equals($(".footer_row > .footer_row_num").size(), 1);
});

test("footer row has footer cells", function() {
  equals($(".footer_row > .footer_cell").size(), 2);
});

test("cells are proportionately sized", function() {
  $("#container").width(1000);
  $(window).trigger($.Event('resize'));
  $("#container .header_cell:nth-child(1)").each(function() {
    equals($(this).width(), 489);
  });
  $("#container .header_cell:nth-child(2)").each(function() {
    equals($(this).width(), 489);
  });
  $("#container .cell:nth-child(1)").each(function() {
    equals($(this).width(), 489);
  });
  $("#container .cell:nth-child(2)").each(function() {
    equals($(this).width(), 489);
  });
  $("#container .footer_cell:nth-child(1)").each(function() {
    equals($(this).width(), 489);
  });
  $("#container .footer_cell:nth-child(2)").each(function() {
    equals($(this).width(), 489);
  });

  $("#container").width(999);
  $(window).trigger($.Event('resize'));
  $("#container .header_cell:nth-child(1)").each(function() {
    equals($(this).width(), 489);
  });
  $("#container .header_cell:nth-child(2)").each(function() {
    equals($(this).width(), 489);
  });
  $("#container .cell:nth-child(1)").each(function() {
    equals($(this).width(), 489);
  });
  $("#container .cell:nth-child(2)").each(function() {
    equals($(this).width(), 489);
  });
  $("#container .footer_cell:nth-child(1)").each(function() {
    equals($(this).width(), 489);
  });
  $("#container .footer_cell:nth-child(2)").each(function() {
    equals($(this).width(), 489);
  });

  $("#container").width(998);
  $(window).trigger($.Event('resize'));
  $("#container .header_cell:nth-child(1)").each(function() {
    equals($(this).width(), 488);
  });
  $("#container .header_cell:nth-child(2)").each(function() {
    equals($(this).width(), 488);
  });
  $("#container .cell:nth-child(1)").each(function() {
    equals($(this).width(), 488);
  });
  $("#container .cell:nth-child(2)").each(function() {
    equals($(this).width(), 488);
  });
  $("#container .footer_cell:nth-child(1)").each(function() {
    equals($(this).width(), 488);
  });
  $("#container .footer_cell:nth-child(2)").each(function() {
    equals($(this).width(), 488);
  });

});

} // end structural

module("behavioral", {
  'setup': function() {
    $("#container").Griddy();
  }
});

test("cell is selected when clicked", function() {
  $("#container .body .cell").eq(0).click();
  ok($("#container .body .cell").eq(0).hasClass("selected"));
  ok($("#container .body .cell").eq(0).hasClass("primary"));
});

test("previously selected cell is de-selected when a new cell is clicked", function() {
  $("#container .body .cell").eq(0).click();
  $("#container .body .cell").eq(1).click();
  ok(!($("#container .body .cell").eq(0).hasClass("selected")));
  ok(!($("#container .body .cell").eq(0).hasClass("primary")));
  ok($("#container .body .cell").eq(1).hasClass("selected"));
  ok($("#container .body .cell").eq(1).hasClass("primary"));
});

test("column of cells are selected when header is clicked", function() {
  $("#container .header .header_cell").eq(0).click();
  ok($("#container .header .header_cell").eq(0).hasClass("selected"));
  var non_standard_cells = 1;
  var nth_child_index = 1 + non_standard_cells;
  equals($("#container .body .cell:nth-child(" + nth_child_index + ")").size(), 2);
  ok($("#container .body .cell:nth-child(" + nth_child_index + ")").hasClass("selected"));
  ok($("#container .body .cell:nth-child(" + nth_child_index + ")").eq(0).hasClass("primary"));
});

test("primary cell retains the concept of primary when its header cell is clicked", function() {
  /*
   * TODO Don't need this yet, it's a nice to have
  $("#container .body .cell").eq(1).click();
  $("#container .header .header_cell").eq(0).click();
  ok($("#container .body .cell").eq(1).hasClass("primary"));
  */
});

test("row of cells are selected when row_num is clicked", function() {
  $("#container .body .row_num").eq(0).click();
  ok($("#container .body .row").eq(0).find(".row_num").hasClass("selected"));
  equals($("#container .body .row").eq(0).find(".cell").size(), 2);
  ok($("#container .body .row").eq(0).find(".cell").hasClass("selected"));
  ok($("#container .body .row").eq(0).find(".cell").eq(0).hasClass("primary"));
});

test("editor appears when enter is pressed while a cell is selected", function() {
  equals($(".editor").size(), 0);
  $("#container .body .cell").eq(0).click();
  var e = $.Event('keydown');
  e.which = 13;
  $(window).trigger(e);
  equals($("#container .body .cell").eq(0).children("div").size(), 1);
  ok($("#container .body .cell").eq(0).children("div").hasClass("editor"));
});

test("editor goes away when enter is pressed", function() {
  $("#container .body .cell").eq(0).click();
  var e = $.Event('keydown');
  e.which = 13;
  $(window).trigger(e);
  $(window).trigger(e);
  equals($(".editor").size(), 0);
});

test("editor goes away when escape is pressed", function() {
  $("#container .body .cell").eq(0).click();
  var e = $.Event('keydown');
  e.which = 13;
  $(window).trigger(e);
  e.which = 27;
  $(window).trigger(e);
  equals($(".editor").size(), 0);
});

test("editor goes away when another cell is clicked", function() {
  $("#container .body .cell").eq(0).click();
  var e = $.Event('keydown');
  e.which = 13;
  $(window).trigger(e);
  $("#container .body .cell").eq(1).click();
  equals($(".editor").size(), 0);
});

test("editor stays when the same cell is clicked", function() {
  $("#container .body .cell").eq(0).click();
  var e = $.Event('keydown');
  e.which = 13;
  $(window).trigger(e);
  $("#container .body .cell").eq(0).click();
  equals($(".editor").size(), 1);
});

test("editor stays when the header cell is clicked", function() {
  $("#container .body .cell").eq(0).click();
  var e = $.Event('keydown');
  e.which = 13;
  $(window).trigger(e);
  $("#container .header .header_cell").eq(0).click();
  equals($(".editor").size(), 1);
});
