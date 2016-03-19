'use strict';

var bbApp = bbApp || {};

(function(d3, $) {

  bbApp.d3Helper = {

    // Query callback to process the data object
    processData: function(response) {

      // Handle errors
      if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' +
          response.getDetailedMessage());
        return;
      }

      var data, colLabels, colsLength, tbody2, table1, thead1, labelRow1, tbody1,
        termsArray, csvDiv, messages, mousedown, messageCount, message,
        weightsString, colSpan, termsString, scrollTarget, trendsArray,
        labelString, trendsString, i, col, colCells, firstCol, included;

      data = response.getDataTable();
      colLabels = data.Kf;
      colsLength = colLabels.length;

      termsArray = [];


      // Push search terms into an array for later
      for ( i = 1; i < colsLength; i++ ) {
        if ( colsLength > 2 && i === colsLength - 1 ) {
          termsArray.push( "and '" + colLabels[ i ].label + "'" );
        } else {
          termsArray.push( "'" + colLabels[ i ].label + "'" );
        }
      }

      // Process data to get monthly weights table
      weightsString = weightsTable( data );
      tbody1.append( weightsString );

      // Process data to get raw trends table
      trendsString = trendsTable( data );
      tbody2.append( trendsString );

      // Add click listener to toggle whether or not given months are included
      // in monthly weights
      $( 'th[data-col]' ).mousedown( function ( event ) {
        var cell = $( this );

        event.preventDefault();
        col = +cell.attr( 'data-col' );
        firstCol = col;
        colCells = cell.closest( 'table' ).find( '[data-col="' + col + '"]' );
        mousedown = true;
        included = cell.hasClass( 'included' );
      })

      .mouseover( function () {
        var prevCol = col,
          prevColCells = colCells,
          cell = $( this ),
          thisIncluded = cell.hasClass( 'included' ),
          thatIncluded, toggleColCells, minCol, maxCol, spans;

        minCol = 11;
        maxCol = 0;

        col = +cell.attr( 'data-col' );
        colCells = cell.closest( 'table' ).find( '[data-col="' + col + '"]' );

        if ( mousedown && col !== prevCol && col !== firstCol ) {
          if ( col < firstCol ) {

            for ( i = 0; i < 12; i++ ) {
              toggleColCells = cell.closest( 'table' ).find( '[data-col="' + i + '"]' );
              spans = toggleColCells.find( 'span' );
              thatIncluded = cell.closest( 'table' ).find( 'th[data-col="' + i + '"]' ).hasClass( 'included' );

              if ( col <= i && i <= firstCol ) {
                toggleColCells.addClass( 'table-hover' );

                if ( thisIncluded ) {
                  spans.removeClass( 'glyphicon-ok-sign' );
                  spans.addClass( 'glyphicon-remove-sign' );
                } else {
                  spans.removeClass( 'glyphicon-remove-sign' );
                  spans.addClass( 'glyphicon-ok-sign' );
                }

              } else {
                toggleColCells.removeClass( 'table-hover' );

                if ( thatIncluded ) {
                  spans.removeClass( 'glyphicon-remove-sign' );
                  spans.addClass( 'glyphicon-ok-sign' );
                } else {
                  spans.removeClass( 'glyphicon-ok-sign' );
                  spans.addClass( 'glyphicon-remove-sign' );
                }
              }
            }

            minCol = col;

          } else {

            for ( i = 0; i < 12; i++ ) {
              toggleColCells = cell.closest( 'table' ).find( '[data-col="' + i + '"]' );
              spans = toggleColCells.find( 'span' );
              thatIncluded = cell.closest( 'table' ).find( 'th[data-col="' + i + '"]' ).hasClass( 'included' );

              if ( firstCol <= i && i <= col ) {
                toggleColCells.addClass( 'table-hover' );

                if ( thisIncluded ) {
                  spans.removeClass( 'glyphicon-ok-sign' );
                  spans.addClass( 'glyphicon-remove-sign' );
                } else {
                  spans.removeClass( 'glyphicon-remove-sign' );
                  spans.addClass( 'glyphicon-ok-sign' );
                }

              } else {
                toggleColCells.removeClass( 'table-hover' );

                if ( thatIncluded ) {
                  spans.removeClass( 'glyphicon-remove-sign' );
                  spans.addClass( 'glyphicon-ok-sign' );
                } else {
                  spans.removeClass( 'glyphicon-ok-sign' );
                  spans.addClass( 'glyphicon-remove-sign' );
                }
              }
            }

            maxCol = col;
          }
        }
      });

      $( document ).mouseup( function () {
        if ( mousedown ) {
          var toggleCells = $( '.table-hover' ),
            spans = $( 'th.table-hover' ).find( 'span' );

          mousedown = false;
          toggleCells.removeClass( 'table-hover' );

          if ( included ) {
            toggleCells.removeClass( 'included' );
            toggleCells.addClass( 'excluded' );

            spans.removeClass( 'glyphicon-ok-sign' );
            spans.addClass( 'glyphicon-remove-sign' );

          } else {
            toggleCells.removeClass( 'excluded' );
            toggleCells.addClass( 'included' );

            spans.removeClass( 'glyphicon-remove-sign' );
            spans.addClass( 'glyphicon-ok-sign' );
          }

          calculateWeights();
        }
      });

      // Add mouse hover effect to included columns to highlight months that user can
      // exclude
      $( 'th.included' ).hover(
        function () {
          var column = $( this ).attr( 'data-col' ),
            columnCells = $( '#table1' ).find( '[data-col="' + column + '"]' ),
            span = $( this ).find( 'span' ),
            included = $( this ).hasClass( 'included' );

          if ( !mousedown ) {
            columnCells.addClass( 'table-hover' );

            if ( included ) {
              span.removeClass( 'glyphicon-ok-sign' );
              span.addClass( 'glyphicon-remove-sign' );
            } else {
              span.removeClass( 'glyphicon-remove-sign' );
              span.addClass( 'glyphicon-ok-sign' );
            }
          }
        },

        function () {
          var column = $( this ).attr( 'data-col' ),
            columnCells = $( '#table1' ).find( '[data-col="' + column + '"]' ),
            span = $( this ).find( 'span' ),
            included = $( this ).hasClass( 'included' );

          columnCells.removeClass( 'table-hover' );

          if ( included ) {
            span.removeClass( 'glyphicon-remove-sign' );
            span.addClass( 'glyphicon-ok-sign' );
          } else {
            span.removeClass( 'glyphicon-ok-sign' );
            span.addClass( 'glyphicon-remove-sign' );
          }
        }
      );

      // Adjust table title row
      colSpan = ( colsLength + 1 ).toString();
      table2.find( 'tr' ).first().children( 'th' ).attr( 'colspan', colSpan );

      // Create message to place above top table
      termsString = termsArray.join( ', ' );
      csvDiv.find( 'h3' ).first().text( "Here's your trends data for " +
        termsString + '.');
      csvDiv.find( 'h3' ).last().text( message );

      // Reveal data tables and auto-scroll down
      csvDiv.removeClass( 'hidden' );
      scrollTarget = csvDiv[ 0 ].offsetTop;
      $( 'body' ).animate({ scrollTop: scrollTarget }, 'slow' );
    }
    buildString: function() {
      var table2, tbody2, table1, thead1, labelRow1, tbody1, csvDiv, messages,
        mousedown, messageCount, message;

      table2 = $( '#table2' );
      tbody2 = table2.children( 'tbody' );
      table1 = $( '#table1' );
      thead1 = table1.children( 'thead' );
      labelRow1 = thead1.children( 'tr' )[ 1 ];
      tbody1 = table1.children( 'tbody' );

      csvDiv = $( '#csv-div' );
      messages = [
        'Enjoy!',
        'Rock on!',
        'Keep it real!',
        'Wango the tango!',
        'Buen provecho!',
        'Bon appetit!',
        'Bom proveito!',
        "L'chaim!",
        'Cheers!',
        'Salud!',
        'Salut!',
        'Seize the day!',
        'Everyday!',
        'Booyah!',
        'Hoowah!'
      ];
      mousedown = false;
      messageCount = messages.length;
      message = messages[ Math.floor( Math.random() * messageCount )];

      // Empty existing tables, and set up new ones
      tbody2.empty();
      tbody1.children( 'tr:not(:first)' ).empty();
      tbody1.find( '.excluded' ).addClass( 'included' );
      tbody1.find( '.excluded' ).removeClass( 'excluded' );
    },
    calculateWeights: function ( data ) {
      var tableData = [],
        tableString = '',
        avgs = [],
        colCount = data.Kf.length,
        i, j, term, avgTotal, termAvgTotal, key, date, month, monthAvg, avg,
        weight, termWeight;

      // Loop through each search term, pushing monthly means to avgs array,
      // then add overall mean for each term at the end of the row
      for ( i = 1; i < colCount + 1; i++ ) {
        term = data.Kf[ i ] ? "'" + data.Kf[ i ].label + "'" : 'Monthly Weight';
        avgs.push( [term] );

        // Calculate mean of each month's search volume
        for ( j = 0; j < 12; j++ ) {

          // Calculate total mean per month across all years
          monthAvg = d3.mean( data.Lf, function ( d ) {
            date = new Date( d.c[ 0 ].v );
            month = date.getMonth();

            // Looping through month rows, if data month matches the loop number,
            // return the search volume. On last weights table row, calculate the mean
            // for the whole trends data row
            // (e.g. mean for March 2006 for all search terms)
            if ( j === month ) {
              if ( d.c[ i ] ) {

                // Monthly mean per search term
                avg = d.c[ i ].v;
              } else {

                // Total mean for month
                avg = d3.mean( d.c, function ( e ) {

                  // Check if data exists (when trying to get data from recent
                  // months, Google Trends sometimes returns 'null' values)
                  if ( e ) {
                    if ( Number.isInteger( e.v )) {
                      return e.v;
                    }
                  }
                });

                // To get total monthly weights, multiply monthly means by
                // # of search terms
                avg *= colCount - 1;
              }
              return avg;
            }
          });

          avgs[ i ].push( monthAvg );
        }

        // Calculate overall mean for each search term
        termAvgTotal = d3.sum( avgs[ i ], function ( d ) {
          return d;
        });
        avgs[ i ].push( termAvgTotal );
      }

      // Save overall average, multiplied by # of terms, to calculate weights
      avgTotal = avgs[ colCount - 1 ][ 12 ];

      // Loop through avgs array to build a string that will be the html table
      // Loop through the rows
      for ( i = 1; i < colCount + 1; i++ ) {
        // term = data.Kf[ i ] ? "'" + data.Kf[ i ].label + "'" : 'Monthly Weight';
        tableString += '<tr><th>' + term + '</th>';

        // Loop through columns (the months), calculating the weight
        // (mean / (overall mean * # of search terms)) and adding it to the string
        for ( j = 0; j < 12; j++ ) {
          weight = (( avgs[ i - 1 ][ j ] / avgTotal) * 100 ).toFixed( 2 );
          tableString += '<td data-col="' + j + '" class="included" data-weight="' +
            weight + '">' + weight + '%</td>';
        }

        // Calculate overall term weight and add to string
        termWeight = (( avgs[ i - 1 ][ 12 ] / avgTotal ) * 100 ).toFixed( 2 );
        tableString += '<td class="included">' + termWeight + '%</td></tr>';
      }

      return tableString;
    }
  };
})(d3, jQuery);