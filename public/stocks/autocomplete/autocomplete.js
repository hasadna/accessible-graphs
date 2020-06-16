/*global
    jQuery, NAME, window
*/
/**
 * Accessibility Helpers
 */
(function ($, NAME) {
  'use strict';
  var $widget = $('[data-widget="accessible-autocomplete"]'),
    $input = $widget.find('#stockSearch'),
    $clearText = $('#clearText'),
    inputVal = "",
    $results = $widget.find('#results'),
    results = [],
    $live = $widget.find('[aria-live]'),
    key = NAME.keyboard,
    directions = "Keyboard users, use up and down arrows to review and enter to select.  Touch device users, explore by touch or with swipe gestures.",
    liMarkup = '<li id="" class="autocomplete-item" role="option" aria-selected="false" tabindex="-1">';
  function getResults() {
    let value = $input.val();
    let foundResults = [];
    fetch('stocks/stocks.json')
      .then(response => response.json())
      .then(data => {
        for (let stock of data) {
          if (stock.name && stock.name.startsWith(value)) {
            foundResults.push(stock.name);
          }
          if (foundResults.length === 10) {
            break;
          }
        }
      })
      .then(() => {
        autocompleteOnResultsFetch();
      });
    return foundResults;
  }
  function positionResults() {
    // stop if this has already been set
    if ($results.is('[style*="width"]')) {
      return;
    }
    $results.css({
      left: $input.position().left + "px",
      top: $input.position().top + $input.outerHeight() + "px",
      "min-width": $input.outerWidth() + "px"
    });

  }
  function buildListHtml(results) {
    var resultsMarkup = "", i = 0;
    for (i = 0; i < results.length; i += 1) {
      resultsMarkup += liMarkup + results[i] + "</li>";
    }
    $results.html(resultsMarkup);
    $results.show();
    $input.attr('aria-expanded', 'true');
  }
  function announceResults() {
    var number = results.length,
      textToRead = number + " results are available. " + directions;
    // if results length === 0 then say "no search results"
    if (results.length === 0) {
      textToRead = "No search results";
    }
    NAME.access.announcements($live, textToRead);
  }
  function markSelected($selectionToMark) {
    // don't mark anything on the results list if we're back at the input field
    if ($selectionToMark.length === 0) {
      return;
    }
    var activeItemId = 'selectedOption';
    $selectionToMark.attr('aria-selected', 'true').attr('id', activeItemId);
    $input.attr('aria-activedescendant', activeItemId);
  }
  function clearSelected() {
    $input.attr('aria-activedescendant', '');
    $results.find('[aria-selected="true"]').attr('aria-selected', 'false').attr('id', '');
  }
  function closeResults() {
    clearSelected();
    $results.hide();
    $input.attr('aria-expanded', 'false');
  }
  function autocomplete() {
    // if input value didn't change, return
    if ($input.val() === inputVal) {
      return;
    }
    // save new input value
    inputVal = $input.val();
    // get and save autocomplete results
    results = getResults();
  }
  function autocompleteOnResultsFetch() {
    // build list HTML
    if (results.length === 0) {
      closeResults();
    } else {
      buildListHtml(results);
    }
    // aria-live results
    announceResults();
  }
  function arrowing(kc) {
    var $thisActiveItem = $results.find('[aria-selected="true"]'),
      $nextMenuItem;
    // don't do anything if no results
    if (!results.length) {
      return;
    }
    if (kc === key.down) {
      // find the next list item to be arrowed to
      $nextMenuItem = ($thisActiveItem.length !== 0)
        ? $thisActiveItem.next('li')
        : $results.children().eq(0); //first item in list
    }
    if (kc === key.up) {
      // find the previous list to be arrowed to
      $nextMenuItem = ($thisActiveItem.length !== 0)
        ? $thisActiveItem.prev('li')
        : $results.children().eq(-1); //last item in list
    }
    clearSelected();
    markSelected($nextMenuItem);
  }
  function populating() {
    var selectedText = $results.find('[aria-selected="true"]').text();
    if (selectedText === "") {
      selectedText = inputVal;
    }
    $input.val(selectedText);
  }
  function eventListeners() {
    // close results if click outside $input and $results
    $(document).on('click', function (e) {
      var $container = $input.add($results);
      if (NAME.general.senseClickOutside($(e.target), $container)) {
        closeResults();
        return;
      }
    });
    $input.on('keyup', function (e) {
      var kc = e.keyCode;
      if (kc === key.up || kc === key.down || kc === key.tab || kc === key.enter || kc === key.esc) {
        return;
      }
      autocomplete();
    });
    $input.on('keydown', function (e) {
      var kc = e.keyCode;
      if (kc === key.tab) {
        closeResults();
        return;
      }
      if (kc === key.enter) {
        e.preventDefault();
        closeResults();
        return;
      }
      if (kc === key.up || kc === key.down) {
        e.preventDefault();
        arrowing(kc);
        populating();
        return;
      }
      if (kc === key.esc) {
        $input.val(inputVal);
        closeResults();
      }
    });
    $results.on('click', function (e) {
      $input.val(e.target.textContent);
      closeResults();
      $input.focus();
    });
    $results.hover(function () {
      clearSelected();
    });
    $clearText.on('click', function () {
      inputVal = '';
      $input.val(inputVal);
    });
  }
  function init() {
    eventListeners();
    positionResults();
  }
  init();
}(jQuery, NAME));