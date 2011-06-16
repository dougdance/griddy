(function($) {

// this should have everything that makes the grid work
// most things should be in their own functions, and eventually pulled out into different implementations
// any implementation can be provided by the user
//
// i really need to find my old grid code
// for starters, the grid should be able to:
// 1.  call a provided api (default to REST) when any value is changed to update the row
//   a.  lots of optimizations exist for this, like tracking updates and making a lump update
//   b.  queuing remote calls
//   c.  giving the user feedback when things are pending and when things fail
// 2.  copy / paste should write to and from a user's web clipboard rather than being client-side based
// 3.  undo / redo support with history of changes like the gimp
// 4.  custom editors for different data types
// 5.  custom data displayed when multiple rows are selected (show the total for a group of units)
// 6.  the grid should handle all basic display, and emit css classes for further customization
//   a.  it should also allow the user to override the css classes that are emitted
// 7.  when i create a grid then, all i would do is provide it with data
//   a.  so i would use rails to output either a structure in html or json or whatever
//   b.  i'm kind of leaning towards json, but i need to research what would work best between rails and jquery
//
// I'm now to the point where I'm implementing the editor that appears for a cell and I'm leaning towards
// redoing some things so that the grid is easier to work with.  For example, when the editor is being displayed
// the grid should act differently - right now the presence of the editor is done by checking for something with
// the 'editor' class.  Here's a proposed class design: ...actually nevermind, instead of wasting time on this
// I'm just going to keep implementing.  Since I have tests in place and they are all passing at this point
// a refactoring later will be much easier.  As long as I keep writing tests.
//
// so the grid would have this data then:
$.fn.Griddy = function(options) {
  var settings = {
    'row_num_width': 20,
    'non_standard_cells': 1,
    'resource': 'items',
    'editors': {
      'string': {
        'get': function(cell) {
          return $('<input type="text" value="' + cell.html() + '"></input>');
        }
      }
    },
    'data': {
      'header': {
        'id': {
          'cardinality': 0,
          'datatype': 'string'
        },
        'your second column': {
          'cardinality': 1,
          'datatype': 'string'
        }
      },
      'rows': [
        {
          'id': '1',
          'your second column': 'world'
        },
        {
          'id': '2',
          'your second column': 'bar'
        }
      ],
    },
    'interface': {
      'create': {
        'request': {
          'url': function(resource) {
            return '/' + resource;
          },
          'method': 'post',
          'args': function(row) {
            return row;
          }
        },
        'response': {
          'success': function(server_response) {
          },
          'error': function(server_response) {
          }
        }
      },
      'read': {
        'request': {
          'url': function(resource) {
            return '/' + resource;
          },
          'method': 'get',
          'args': function(filters, sort_instructions) {
          }
        },
        'response': {
          'success': function(server_response) {
          },
          'error': function(server_response) {
          }
        }
      },
      'update': {
        'request': {
          'url': function(resource, row) {
            return '/' + resource + '/' + row['id'];
          },
          'method': 'put',
          'args': function(row) {
            return row;
          }
        },
        'response': {
          'success': function(server_response) {
          },
          'error': function(server_response) {
          }
        }
      },
      'delete': {
        'request': {
          'url': function(resource, row) {
            return '/' + resource + '/' + row['id'];
          },
          'method': 'delete',
          'args': function(row) {
            return row;
          }
        },
        'response': {
          'success': function(server_response) {
          },
          'error': function(server_response) {
          }
        }
      }
    }
  };

  var util = {
    'get_header_names': function() {
      return settings.data.header;
    },
    'get_header': function(header_name) {
      return settings.data.header[header_name];
    },
    'get_rows': function() {
      return settings.data.rows;
    },
    'get_cell_value': function(row_index, header_name) {
      return settings.data.rows[row_index][header_name];
    },
    'select_cell': function(grid, cell) {
      grid.find(".selected").removeClass("selected");
      cell.addClass("selected");
    },
    'primary_cell': function(grid, cell) {
      grid.find(".primary").removeClass("primary");
      cell.addClass("primary");
      if (cell.find(".editor").size() < 1)
      {
        grid.find(".editor").remove();
      }
    },
    'get_editor': function(cell) {
      var editor = $("<div></div>").addClass("editor");
      // TODO - figure out the type of editor for this cell
      editor.append(settings.editors.string.get(cell));
      return editor;
    },
    'set_row_nums': function(grid) {
      grid.find(".header_row_num, .footer_row_num").html("&nbsp;");
      grid.find(".row_num").each(function(index) {
        $(this).html(index + 1);
      });
    }
  };

  var key_handlers = {
    'enter': function(grid) {
      if (grid.find(".cell.primary").size() > 0)
      {
        var primary_cell = grid.find(".cell.primary");
        if (primary_cell.find(".editor").size() > 0)
        {
          primary_cell.find(".editor").remove();
        }
        else
        {
          primary_cell.prepend(util.get_editor(primary_cell));
        }
      }
    },
    'escape': function(grid) {
      if (grid.find(".editor").size() > 0)
      {
        grid.find(".editor").remove();
      }
    }
  };

  var events = {
    'header_cell_click': function(grid, header) {
      return function(e) {
        util.select_cell(grid, $(this));
        var nth_child_index = header.cardinality + 1 + settings.non_standard_cells;
        var cells_in_column = grid.find(".body .cell:nth-child(" + nth_child_index + ")");
        cells_in_column.addClass("selected");
        util.primary_cell(grid, cells_in_column.eq(0));
      };
    },
    'row_num_click': function(grid, row_index) {
      return function(e) {
        util.select_cell(grid, $(this));
        var cells_in_row = grid.find(".body .row").eq(row_index).find(".cell");
        cells_in_row.addClass("selected");
        util.primary_cell(grid, cells_in_row.eq(0));
      };
    },
    'cell_click': function(grid) {
      return function(e) {
        util.select_cell(grid, $(this));
        util.primary_cell(grid, $(this));
      };
    },
    'key_handler': function(grid) {
      return function(e) {
        if (e.which == 13)
        {
          key_handlers.enter(grid);
        }
        if (e.which == 27)
        {
          key_handlers.escape(grid);
        }
      };
    },
    'resize': function(grid) {
      return function(e) {
        // set the width on the non-standard cells
        grid.find(".header_row_num, .row_num, .footer_row_num").each(function() {
          $(this).width(settings.row_num_width);
        });

        var num_columns = grid.find(".header_cell").size();
        // factor out the non-standard cells
        var total_width = grid.width() - grid.find(".header_row_num").outerWidth(true);
        for (var i = 1; i <= num_columns; ++i)
        {
          // TODO - make a util function that takes into account how many cells aren't standard cells
          var cell_offset = i + settings.non_standard_cells;
          var nth_child = "nth-child(" + (cell_offset) + ")";
          grid.find(".header_cell:" + nth_child + ", .cell:" + nth_child + ", .footer_cell:" + nth_child).each(function() {
            $(this).width(total_width / num_columns);
          });
        }
      };
    }
  };

  return this.each(function() {
    if (options)
    {
      $.extend(settings, options);
    }

    $(this).html("");

    var coreCSS = $("<style>" +
      ".header, .body, .footer, .header_row, .row, .footer_row, .header_cell, .cell, .footer_cell, .header_row_num, .row_num, .footer_row_num { float:left; }" +
      ".header, .body, .footer, .header_row, .row, .footer_row { width:100%; }" +
      ".header_row, .row, .footer_row { border-bottom:solid black 1px; }" +
      ".header_row { border-top:solid black 1px; }" +
      ".header_cell, .cell, .footer_cell, .header_row_num, .row_num, .footer_row_num { " +
        "box-sizing:border-box; " +
        "-webkit-box-sizing:border-box; " +
        "-moz-box-sizing:border-box; " +
        "border-right:solid black 1px; }" +
      ".header_row_num, .row_num, .footer_row_num { " +
        "border-left:solid black 1px; }" +
      ".editor { position:absolute; }" +
    "</style>");
    $(this).append(coreCSS);
    var defaultCSS = $("<style>" +
      ".selected { background-color:orange; }" +
      ".primary { background-color:green; }" +
    "</style>");
    $(this).append(defaultCSS);

    var grid = $("<div></div>").addClass("grid");
    $(this).append(grid);

    var header = $("<div></div>").addClass("header");
    grid.append(header);

    var header_row = $("<div></div>").addClass("header_row");
    header.append(header_row);

    var header_row_num = $("<div></div>").addClass("header_row_num");
    header_row.append(header_row_num);

    for (var header_name in util.get_header_names())
    {
      var header_cell = $("<div></div>").addClass("header_cell").html(header_name);
      header_cell.bind("click.Griddy", events.header_cell_click(grid, util.get_header(header_name)));
      header_row.append(header_cell);
    }

    var body = $("<div></div>").addClass("body");
    grid.append(body);
    for (var row_index in util.get_rows())
    {
      var row = $("<div></div>").addClass("row");
      body.append(row);

      var row_num = $("<div></div>").addClass("row_num");
      row.append(row_num);

      row_num.bind("click.Griddy", events.row_num_click(grid, row_index));

      for (var header_name in util.get_header_names())
      {
        var cell_value = util.get_cell_value(row_index, header_name);
        var cell = $("<div></div>").addClass("cell").html(cell_value);
        cell.bind("click.Griddy", events.cell_click(grid));
        row.append(cell);
      }
    }

    var footer = $("<div></div>").addClass("footer");
    grid.append(footer);

    var footer_row = $("<div></div>").addClass("footer_row");
    footer.append(footer_row);

    var footer_row_num = $("<div></div>").addClass("footer_row_num");
    footer_row.append(footer_row_num);

    for (var header_name in util.get_header_names())
    {
      var footer_cell = $("<div></div>").addClass("footer_cell").html(header_name);
      footer_row.append(footer_cell);
    }

    $(window).bind('resize.Griddy', events.resize(grid));
    $(window).trigger($.Event('resize'));

    $(window).bind('keydown.Griddy', events.key_handler(grid));

    util.set_row_nums(grid);

  });
};

})(jQuery);
