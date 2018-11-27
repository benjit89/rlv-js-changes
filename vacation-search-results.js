/**
 *  Search page js
 *
 */
digitalData = digitalData || {};
var refineparamsAry = [];
var url = window.location.href;
window.searchJscroll = null;

var deviceType = checkDevice();
var processSearchResultsError = function(sid, errorCode, errorMsg) {
    $(".modal").modal('hide');
    if (errorCode == 1) {
        $("#session-expired").modal('show');
        digitalData.event = digitalData.event || [];
        digitalData.event.push({
            eventInfo: {
                eventCondition: "session expired",
                eventName: "session expired",
                errorMessage: "session expired"
            }
        })
        console.log(digitalData);
    } else {
        $("#custsup-session-id").val(sid);
        $("#general-error-modal").modal('show');
        $("#general-error-modal .error-content").html("<p class='error'>" + errorMsg + "</p>");
        $("#modal-error-code").val(errorCode);
        digitalData.event = digitalData.event || [];
        digitalData.event.push({
            eventInfo: {
                eventCondition: "error message",
                eventName: "error message",
                errorMessage: 'Search Error|Message Details^' + errorMsg
            }
        })
    }
};

var loadInit = function() {
    //in case of go-back >> close the previous modal window
    $(".modal").modal('hide');

    /*
     * Here consider the case of "GO BACK" to keep status
     * Begin
     */
    var page_reload = false;
    if ($("#sid").length > 0) {
        //make sure it is from "go back"
        var search_ajax_url = $("#search_ajax_url").val();
        var tax_val = get_hash_value('tax');
        var page_val = get_hash_value('page');
        var sort_val = get_hash_value('sort');
        var filter_val = get_hash_value('filter');
        //real history data

        if (checkFilterUpdatedFromURL()) {
            //if filter param updated comparing to the initial value
            page_reload = true;
        }

        if (page_val > 0) {
            search_ajax_url += "&page=" + page_val;
            page_reload = true;
        } else {
            search_ajax_url += "&page=0";
        }

        if (url.toLowerCase().indexOf('all_inclusive=y') != -1) {
            $(".package-options input[value=all_inclusive]").prop("checked", true);
        }
        search_ajax_url += '?sid=' + $("#sid").val();
    }

    if (page_reload) {
        /*
         if(deviceType == 'desktop'){
         $("#hold-on").modal('show');
         } */
        $.get(search_ajax_url + "&ms=" + new Date().getTime(), {}, function(results) {
            /*
             if(deviceType == 'desktop'){
             $("#hold-on").modal('hide'); //just hide anyway
             } */
            $("div.more_search_results .vacations").empty().html(results.data.main);
            if (results.data.grid) {
                $("div.top-contents .grid").html(results.data.grid);
            }
            if (results.data.suggest_date) {
                $("div.top-contents .suggest-date").html(results.data.suggest_date);
            }
            $(".trip-results").show();

            if (results.status == 'ok') {
                if (tax_val) {
                    $("input#tax-display-set").val(tax_val);
                    var txt = $("a.tax-options[data-option=" + tax_val + "]").text();
                    $(".tax-options-display").text($("a.tax-options[data-option=" + tax_val + "]").text());
                }
                //init tax display value
                set_tax_val(tax_val);
                //init the sort value
                set_sort_val(sort_val);
                //init filter value
                set_filter_val(filter_val);
                syncExploreSearch();
                //set_url_hash();
                set_tax_display($("div.more_search_results"));
                if ($(".alternate-dates").length > 0) {
                    $("div.search-filters").hide();
                } else {
                    $("div.booking-headings").show();
                }

                $('.grid_option').popover({
                    html: true,
                    animation: true,
                    delay: 300
                });

                $('.meal-type').popover({
                    html: true,
                    animation: true,
                    delay: 300,
                    trigger: 'hover'
                });

                $(".flight-details").popover({
                    html: true,
                    animation: true,
                    delay: 300,
                    trigger: 'hover'
                });

            } else {
                processSearchResultsError(results.sid, results.errorCode, results.errorMsg);

                $("div.total").hide();
                $("div.top-filters").hide();
                $(".price-matrix-notes").hide();
            }
        }, 'json');
    } else {
        if ($("#search-results-error").length > 0) {
            //search results error
            processSearchResultsError($("#sid").val(), $("#search-results-error").val(), $("#search-results-error").attr("msg"));
        } else {
            syncExploreSearch();
            set_url_hash();
            $(".flight-details").popover({
                html: true,
                animation: true,
                delay: 300,
                trigger: 'hover'
            });

            $('.meal-type').popover({
                html: true,
                animation: true,
                delay: 300,
                trigger: 'hover'
            });

            $('.grid_option').popover({
                html: true,
                animation: true,
                delay: 300
            });
        }
    }
    //Check the price matrix cookie
    if ($.trim($(".grid").text()) === '') {
        $(".price-matrix-area").hide();
    }

    if (deviceType == 'desktop') {

        if ($.cookie("redtag_ca-pricemaitrx-pref")) {

            if ($.cookie("redtag_ca-pricemaitrx-pref") === 'show' && $(".grid").hasClass('hide') && $.trim($(".grid").text()) !== '') {
                $(".grid").toggleClass("hide");
                $(".price-matrix-notes").toggleClass('hide');
            }
            if ($.cookie("redtag_ca-pricemaitrx-pref") === 'hide' && $(".grid").is(':visible') && $.trim($(".grid").text()) !== '') {
                $(".grid").toggleClass("hide");
                $(".price-matrix-notes").toggleClass('hide');
            }

        }
    }

    /*
     * End
     */
};

loadInit();

//hide the price matrix button click
$(document).on("click", ".price-matrix-area .show-hide-btn", function() {
    if ($(".grid").hasClass('hide')) {
        $(".grid").fadeIn('slow');
        $(".grid").removeClass("hide");
    } else {
        $(".grid").fadeOut('slow');
        $(".grid").addClass("hide");
    }

    $(".price-matrix-notes").toggleClass('hide');
    if ($(".grid").hasClass('hide')) {
        $.cookie("redtag_ca-pricemaitrx-pref", 'hide', {
            path: '/',
            expires: 15
        });
    } else {
        $.cookie("redtag_ca-pricemaitrx-pref", 'show', {
            path: '/',
            expires: 15
        });
    }
});

//For tablet
$(document).on('click', '#search-btn', function() {
    $(".search-toggle").toggleClass('toggle-open');
});

$(document).on('click', '.filter-btn', function() {
    $(".search-filters.visible-tablet").toggleClass('toggle-open');
    if ($(".search-filters.visible-tablet").hasClass("toggle-open")) {
        $("button.filter-btn").text("Hide Vacation Filters");
    } else {
        $("button.filter-btn").text("Show Vacation Filters");
    }

});

/* Js file for compatible with mobile platform   */

function stopPropagation(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.returnValue = false;
    }
}

var ajax_time_period = 1000 * 60
  , // 1 min; 1000*60
continue_timer = null
  , continue_ajax_call = null
  , show_more_options_timer = null
  , show_more_options_ajax_call = null;

// continue Timer
function continue_modal_timer_process() {
    continue_timer = null
    if (continue_ajax_call) {
        continue_ajax_call.abort();
        continue_ajax_call = null;
    }
    $("#continue-message").modal("hide");
    $("#general-error-modal .error-content").html("<p class='error'>Sorry! The package you selected does not give response within a proper time, Please select another package</p>");
    $("#general-error-modal").modal('show');
}

function show_more_options_timer_process(more_package_block) {
    show_more_options_timer = null
    if (show_more_options_ajax_call) {
        show_more_options_ajax_call.abort();
        show_more_options_ajax_call = null;
    }
    $(more_package_block).html("<ul class='unstyled options'><li class='error-message'><i class='icon-frown'></i>Sorry! The package does not return response within a proper time, Please select another package</li></ul>");
    $.unblockUI();
}

function clickContinue(event, htmlObj) {
    /* For A/B test-without hotel detail page
     var $obj = $(htmlObj).parentsUntil(".package-result",".result-info");
     $('h1',$obj).trigger("click");

     */
    var sid = $("#sid").val();
    var priceDisplay = $("#tax-display-set").val();
    var hotel_id = $(htmlObj).attr("hotel_id");
    var sv_page = $(htmlObj).attr("sv_page");
    if (!(/^((?!chrome).)*safari/i.test(navigator.userAgent))) {
        $("#continue-message").modal('show');
        $("#continue-message .loader").show();
    }
    $("#continue-message .error-modal").hide();
    $("#continue-message .error-content").empty();
    //For error modal window
    $("#custsup-session-id").val(sid);
    var hotel_detail_url = $("#hotel-detail-url").val();
    setTimeout(function() {
        window.location = hotel_detail_url + '?sid=' + sid + '&hotel_id=' + hotel_id + "&sv_page=" + sv_page + '&pshow=' + priceDisplay;
    }, 300);

    stopPropagation(event);
}

function clickSeletNow(event, htmlObj) {
    var hotel_detail_url = $("#hotel-detail-url").val();
    var sid = $("#sid").val();
    var hotel_id = $(htmlObj).parentsUntil('.package-result', '.row-fluid').prevAll('input.hidden-hotel-id').val();
    var sv_page = $(htmlObj).parentsUntil('.package-result', '.row-fluid').prevAll('input.hidden-sv-page').val();

    var rid = $(htmlObj).attr('rid');
    var priceDisplay = $("#tax-display-set").val();
    var ajax_hotel_room_url = $("#search_hotel_room_ajax_url").val();

    $("#continue-message").modal('show');
    $("#continue-message .loader").show();
    $("#continue-message .error-modal").hide();
    $("#continue-message .error-content").empty();
    //For error modal window
    $("#custsup-session-id").val(sid);
    $.get(ajax_hotel_room_url + "?sid=" + sid + "&hotel_id=" + hotel_id + "&sv_page=" + sv_page + "&ms=" + new Date().getTime(), {}, function(json_results) {
        var results = JSON.parse(json_results);
        if (results.status == 'ok') {
            //$("#continue-message").modal('hide');
            if (deviceType == 'mobile') {
                $("#continue-message").modal('hide');
            }
            window.location = hotel_detail_url + '?sid=' + sid + '&hotel_id=' + hotel_id + "&sv_page=" + sv_page + '&rid=' + rid + '&pshow=' + priceDisplay;
        } else if (results.errorCode) {
            $("#continue-message .loader").hide();
            $("#modal-error-code").val(results.errorCode);
            processSearchResultsError(sid, results.errorCode, results.msg);
        }
    });
    stopPropagation(event);
}

var ec = false; //create placeholder variable for challenge
var sid, ajax_hotel_room_url, sv_page, hotel_id, button, curPlatform, more_package_block; //create global variables for ajax calls.

//calback is triggered if a challenge is presented.
function ecOnShown() {
  console.log("Now trigger modal overlay - challenge is presented");
  //Placeholder function - this is where you trigger the modal overlay with Arkose Enforcement.
}

//callback is fired when EC is solved, either automatically, or after a user completes it in-browser.
function ecCallback() {
    showMorePkgAjax(document.getElementById("FunCaptcha-Token").value);
}

function showMorePkgAjax(token) {
    show_more_options_timer = setTimeout(show_more_options_timer_process, ajax_time_period, more_package_block);
    show_more_options_ajax_call = $.get(ajax_hotel_room_url + "?token=" + token + "&more-package=true&sid=" + sid + "&sv_page=" + sv_page + "&hotel_id=" + hotel_id + "&ms=" + new Date().getTime(), {}, function(json_results) {
        if (show_more_options_timer) {
            clearTimeout(show_more_options_timer);
            show_more_options_timer = null;
            var results = JSON.parse(json_results);
            if (results.status == 'ok') {
                $(more_package_block).html(results.msg).fadeIn("slow");
                $(".flight-details").popover({
                    html: true,
                    animation: true,
                    delay: 300,
                    trigger: 'hover'
                });

                $('.meal-type').popover({
                    html: true,
                    animation: true,
                    delay: 300,
                    trigger: 'hover'
                });

                $(".promo-seat-selection").popover({
                    html: true,
                    animation: true,
                    delay: 300,
                    trigger: 'hover'
                });
                set_tax_display(more_package_block);
            } else {
                $("#modal-error-code").val(results.errorCode);
                if (results.errorCode == 1 || results.errorCode == 5) {
                    //session expired
                    $("#session-expired").modal('show');
                } else {
                    $(more_package_block).html("<ul class='unstyled options'><li class='error-message'><i class='icon-frown'></i>" + results.msg + "</li></ul>");
                }
            }
            //$(button).addClass("open").html("Hide "+resPerGroup+" packages and promotions for this hotel<i class='icon-caret-up'></i>");
            $(button).addClass("open").html("Other Durations / Room Types<i class='icon-caret-up'></i>");
            if (curPlatform !== 'phone') {
                $.unblockUI();
            }
        }
    });
}

function clickShowMorePkg(event, htmlObj) {
    //check 'hotel-options' status
    //var resPerGroup = $(htmlObj).attr('resPerGroup');
    more_package_block = $(htmlObj).parentsUntil('.package-result', '.row-fluid').find('div.hotel-options');
    if ($(htmlObj).hasClass('open')) {
        $(more_package_block).fadeOut('slow');
        //$(htmlObj).removeClass('open').html("Show "+resPerGroup+" packages and promotions for this hotel<i class='icon-caret-down'></i>");
        $(htmlObj).removeClass('open').html("Other Durations / Room Types<i class='icon-caret-down'></i>");

    } else {
        if ($(more_package_block).html() != '') {
            //if already has the contents, just do show/hide
            $(more_package_block).fadeIn('slow');
            //  $(htmlObj).addClass('open').html("Hide "+resPerGroup+" packages and promotions for this hotel<i class='icon-caret-up'></i>");;
            $(htmlObj).addClass('open').html("Other Durations / Room Types<i class='icon-caret-up'></i>");
            ;
        } else {
            //need call ajax
            curPlatform = checkPlatform();
            if (curPlatform !== 'phone') {
                $.blockUI({
                    message: "",
                    css: {
                        height: '0px',
                        width: '0px',
                        'border': 'none'
                    },
                    overlayCSS: {
                        backgroundColor: '#000',
                        opacity: 0,
                        cursor: 'wait'
                    }
                });
            }

            $(more_package_block).html($("#load-more-message").html());

            //set current values.
            sid = $("#sid").val();
            ajax_hotel_room_url = $("#search_hotel_room_ajax_url").val();
            sv_page = $(htmlObj).attr("sv_page");
            hotel_id = $(htmlObj).attr("hotel_id");
            button = $(htmlObj);

            //if EC is not created, create it, otherwise just refresh it.
            if (!ec) {
                ec = new ArkoseEnforcement({
                    public_key: "3622F205-4413-1B7F-84B5-C05243771B78",
                    target_html: "CAPTCHA",
                    callback: ecCallback, //on completion
                    onshown: ecOnShown //on challenge presented
                });
            } else {
              //refreshing will trigger a new challenge and callback logic.
                ec.refresh_session();
            }
        }
    }
    stopPropagation(event);
}

function clickShowMorePkg_old(event, htmlObj) {
    //check 'hotel-options' status
    //var resPerGroup = $(htmlObj).attr('resPerGroup');
    var more_package_block = $(htmlObj).parentsUntil('.package-result', '.row-fluid').find('div.hotel-options');
    if ($(htmlObj).hasClass('open')) {
        $(more_package_block).fadeOut('slow');
        //$(htmlObj).removeClass('open').html("Show "+resPerGroup+" packages and promotions for this hotel<i class='icon-caret-down'></i>");
        $(htmlObj).removeClass('open').html("Other Durations / Room Types<i class='icon-caret-down'></i>");

    } else {
        if ($(more_package_block).html() != '') {
            //if already has the contents, just do show/hide
            $(more_package_block).fadeIn('slow');
            //  $(htmlObj).addClass('open').html("Hide "+resPerGroup+" packages and promotions for this hotel<i class='icon-caret-up'></i>");;
            $(htmlObj).addClass('open').html("Other Durations / Room Types<i class='icon-caret-up'></i>");
            ;
        } else {
            //need call ajax
            var curPlatform = checkPlatform();
            if (curPlatform !== 'phone') {
                $.blockUI({
                    message: "",
                    css: {
                        height: '0px',
                        width: '0px',
                        'border': 'none'
                    },
                    overlayCSS: {
                        backgroundColor: '#000',
                        opacity: 0,
                        cursor: 'wait'
                    }
                });
            }
            $(more_package_block).html($("#load-more-message").html());
            show_more_options_timer = setTimeout(show_more_options_timer_process, ajax_time_period, more_package_block);
            //   1min
            var sid = $("#sid").val();
            var ajax_hotel_room_url = $("#search_hotel_room_ajax_url").val();
            var sv_page = $(htmlObj).attr("sv_page");
            var hotel_id = $(htmlObj).attr("hotel_id");
            var button = $(htmlObj);

            show_more_options_ajax_call = $.get(ajax_hotel_room_url + "?more-package=true&sid=" + sid + "&sv_page=" + sv_page + "&hotel_id=" + hotel_id + "&ms=" + new Date().getTime(), {}, function(json_results) {
                if (show_more_options_timer) {
                    clearTimeout(show_more_options_timer);
                    show_more_options_timer = null;
                    var results = JSON.parse(json_results);
                    if (results.status == 'ok') {
                        $(more_package_block).html(results.msg).fadeIn("slow");
                        $(".flight-details").popover({
                            html: true,
                            animation: true,
                            delay: 300,
                            trigger: 'hover'
                        });

                        $('.meal-type').popover({
                            html: true,
                            animation: true,
                            delay: 300,
                            trigger: 'hover'
                        });

                        $(".promo-seat-selection").popover({
                            html: true,
                            animation: true,
                            delay: 300,
                            trigger: 'hover'
                        });
                        set_tax_display(more_package_block);
                    } else {
                        $("#modal-error-code").val(results.errorCode);
                        if (results.errorCode == 1 || results.errorCode == 5) {
                            //session expired
                            $("#session-expired").modal('show');
                        } else {
                            $(more_package_block).html("<ul class='unstyled options'><li class='error-message'><i class='icon-frown'></i>" + results.msg + "</li></ul>");
                        }
                    }
                    //$(button).addClass("open").html("Hide "+resPerGroup+" packages and promotions for this hotel<i class='icon-caret-up'></i>");
                    $(button).addClass("open").html("Other Durations / Room Types<i class='icon-caret-up'></i>");
                    if (curPlatform !== 'phone') {
                        $.unblockUI();
                    }
                }
            });
        }
    }
    stopPropagation(event);
}

function clickLoadMorePage(event, htmlObj) {
    var ajaxLoadMoreUrl = $(htmlObj).attr("ref") + "&ms=" + new Date().getTime();
    var $loadObj = $(htmlObj).parent();
    $(htmlObj).html("Loading More...");
    var curPlatform = checkPlatform();
    if (curPlatform !== 'phone') {
        $.blockUI({
            message: "",
            css: {
                height: '0px',
                width: '0px',
                'border': 'none'
            },
            overlayCSS: {
                backgroundColor: '#000',
                opacity: 0,
                cursor: 'wait'
            }
        });
    }
    $.get(ajaxLoadMoreUrl, {}, function(json_results) {
        $loadObj.remove();
        var results = JSON.parse(json_results);
        if (results.status == 'ok') {
            $(".more_search_results").append(results.html);

            var products = [];
            $.each($('input.hidden-hotel-id', $('.search-result-list:last')), function(i, item) {
                products[i] = {
                    product: {
                        productId: "" + $(this).val(),
                        impressionType: "standard",
                        discounted: $(this).siblings(".hidden-hotel-discount-status").val()
                    }
                };

            })

            digitalData.event = digitalData.event || [];

            digitalData.event.push({
                eventInfo: {
                    eventCondition: "product impression",
                    //name of DTM direct call prefixed with "dl"
                    eventName: "product impression",
                    //prefixed with "dl"
                    eventCategory: "vacation",
                    impressions: products,
                    attributes: {
                        server: "www.redtag.ca",
                        //set with the server ID or address that is serving the current page
                        mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                        message: "Welcome Redtag Vacations",
                        //set with message presented to visitor
                        searchCategory: "vacation",
                        //values coudl be standard, flight, vacation, cruise, car, etc.
                        searchType: "load",
                        //could be start, modify, refine
                        searchAllFacet: refineparamsAry.join("|")//if this type of search facet/refinement is applicable

                    }
                }
            });

            $(".flight-details").popover({
                html: true,
                animation: true,
                delay: 300,
                trigger: 'hover'
            });

            $('.meal-type').popover({
                html: true,
                animation: true,
                delay: 300,
                trigger: 'hover'
            });

            $(".promo-seat-selection").popover({
                html: true,
                animation: true,
                delay: 300,
                trigger: 'hover'
            });

            set_url_hash();
            set_tax_display($("div.more_search_results"));
        } else {
            $("#modal-error-code").val(results.errorCode);
            if (results.errorCode == 1) {
                //session expired
                $("#session-expired").modal('show');
                digitalData.event = digitalData.event || [];
                digitalData.event.push({
                    eventInfo: {
                        eventCondition: "error message",
                        eventName: "error message",
                        errorMessage: "session expired"
                    }
                })
            } else {
            }
        }
        if (curPlatform !== 'phone') {
            $.unblockUI();
        }
    });

    stopPropagation(event);
}

//Search price matrix  process
//Change click price-matrix as filter
function clickPriceMatrix(event, htmlObj) {
    var date = $(htmlObj).attr("date");
    $("#refine-url-form input[name=date]").val(date);
    $("input[filter=filter-date][value=" + date + "]").prop("checked", true);

    //update filter tag
    var $tag = $('<li class="radio" filter="filter-date" value="' + date + '" ><span>' + $("input[filter=filter-date]:checked").parent().text() + '</span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
    $("ul.active-filter li.radio[filter=filter-date]").remove();
    $("ul.active-filter").append($tag);

    $(".slider.star-slider").slider('setValue', ['1', '5']);
    $(".star-container .low .number").html('1');
    $(".star-container .high .number").html('5');

    if ($(htmlObj).attr("star")) {
        var rating = $(htmlObj).attr("star");
        var value = $(".star-slider").slider('getValue').val();
        var ratingValue = ['1', '5'];
        if ("" !== value) {
            ratingValue = value.split(",");
        }
        $(".star-slider").slider('setValue', [rating, ratingValue[1]]);
        $(".star-container .low .number").html(rating);
        $(".star-container .high .number").html(ratingValue[1]);
    }
    $("#matrix-selected-hotel-id").val("");
    if ($(htmlObj).attr("hotel_id")) {
        $("#matrix-selected-hotel-id").val($(htmlObj).attr("hotel_id"));
    }
    filter_process('matrix');
    stopPropagation(event);
}
;
function clickMatricSummary(event, htmlObj, row) {
    /*
     if($(".grid").hasClass('hide')){
     $(".grid").fadeIn('slow');
     $(".grid").removeClass("hide");
     } else {
     $(".grid").fadeOut('slow');
     $(".grid").addClass("hide");
     } */
    clickPriceMatrix(event, htmlObj);
    /*
     $(".price-matrix tbody tr").removeClass('active');
     $(".price-matrix tbody tr:eq("+row+")").addClass('active');
     $(".price-matrix-notes").toggleClass('hide');
     */
}
