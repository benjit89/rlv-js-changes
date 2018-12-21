   /*******************Filter JS Begin***********************************************************/

    var refineparams = "", refineparamsAry = [], refineType="refine";
    var search_time_period =  1000*45, // 60 seconds;
		search_timer = null,
        search_ajax_call = null;

    var $thisFilter;
    if($(".vacations-filters.desktop-filter").is(":visible")){
        $thisFilter = $(".vacations-filters.desktop-filter");
    } else if($(".vacations-filters.tablet-filter").is(":visible")){
        $thisFilter = $(".vacations-filters.tablet-filter");
    }

    function syncExploreSearch(){
        if($("input[name=alternate-date]").length>0){
           //Set the mapped date
           $("input.depDate").val($("input[name=alternate-date]").attr('nowCalendar'));
           $(".checkbox-filter .date-options").html($("input[name=alternate-date]").attr('nowFilterOpt'));
          // $(".display-dept-date").html($("input[name=alternate-date]").attr("nowDisplay"));

           $("#alternate-dates .modal-body").html($("#alternate-date-html").html());
           $("#alternate-dates").modal("show");

           digitalData = digitalData || {};
           digitalData.event = digitalData.event || [];
           digitalData.event.push({
                eventInfo: {
                        eventCondition: "update date modal",
                        eventName: "update date modal"
                        }
             });

          // set_url_hash();
        }  else if($("input[name=opt-reset]").length>0){
            //reset the filter and hash value
            //remove the filter label tag
            $(".active-filter").empty();

            $("input[name=hotel-id]").val('');
            $(".hotel-section .bfh-selectbox-option").html("Show All Hotels");

            $(".price-container .low .number").text("0");
            $(".price-container .high .number").text("10000");
            $(".price-slider").slider('setValue',[0,10000]);

            $(".star-container .low .number").html('1');
            $(".star-container .high .number").html('5');
            $(".star-slider").slider('setValue',[1,5]);

            $(".duration-options input").prop("checked", false);
            var default_dur = $("input[name=keep-search-dura]").val();;
            $("span.display-dura").text(default_dur);

            $(".package-options input").prop("checked", false);

            $(".tour-operators input").prop("checked", false);
           // set_url_hash();
        }

    };


    //hide the hotel search input
    if($(".hotel-list").length == 0){
        $(".hotel-search").hide();
    }


    $('.price-slider').slider()
           .on('slide',function(e){
                $(".price-container .low .number").text(e.value[0]);
                $(".price-container .high .number").text(e.value[1]);
            })
           .on('slideStop',function(e){
               $('.price-slider').slider('setValue',e.value);

               //for filter lable tag
                if($("li.slide-price").length >0){
                   $("li.slide-price .filter-content").html($('.price-container:eq(0)').html())
                } else {
                    var $tag = $('<li class="slide-price" value="" ><span class="filter-content"></span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
                    $tag.attr('min',e.value[0]);
                    $tag.attr('max',e.value[1]);
                    $tag.find('.filter-content').html($('.price-container:eq(0)').html());
                    $("ul.active-filter").append($tag);
                }

               filter_process();
            }).data('slider');



    $('.star-slider').slider()
           .on('slide', function(e){
                $(".star-container .low .number").html(e.value[0]);
                $(".star-container .high .number").html(e.value[1]);
            })
            .on('slideStop', function(e){
                $('.star-slider').slider('setValue',e.value);

                //for filter label tag
                if($("li.slide-star").length >0){
                   $("li.slide-star .filter-content").html($('.star-container:eq(0)').html())
                } else {
                    var $tag = $('<li class="slide-star" value="" ><span class="filter-content"></span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
                    $tag.attr('min',e.value[0]);
                    $tag.attr('max',e.value[1]);
                    $tag.find('.filter-content').html($('.star-container:eq(0)').html());
                    $("ul.active-filter").append($tag);
                }
                filter_process();
            }).data('slider');

    function getSidebarFilterValue(){
          refineparamsAry = [];
          if($(".vacations-filters").is(':visible') == false){
               return '&';
           }
           var loop_arr = ['tour-operators', 'package-options'];
           var url_param = '';

            $.each(loop_arr, function(i,cat){
                var tmp_check_str = '';
                $.each($("ul."+cat+" input:checked",$thisFilter), function(index,item){
                    if(tmp_check_str == ''){
                      tmp_check_str = $(this).val();
                    } else {
                      tmp_check_str += ","+$(this).val();
                    }
                 });

                 if(tmp_check_str !=''){
                    if(cat == 'tour-operators'){
                       url_param += '&touropt='+tmp_check_str;
                       refineparamsAry.push('touropt^'+tmp_check_str);
                    } else if(cat == 'package-options'){
                       url_param += '&pkgopt='+tmp_check_str;
                       refineparamsAry.push('pkgopt^'+tmp_check_str);
                    }
                 }
             });

             if($("input[name=hotel-id]").length > 0 &&  $("input[name=hotel-id]").val() !=''){
               url_param += '&hotel_no='+$("input[name=hotel-id]").val();
               refineparamsAry.push('hotel_no^'+$("input[name=hotel-id]").val());
             }

             var low =  $.trim($(".price-container .low .number:eq(0)").text());
             var high = $.trim($(".price-container .high .number:eq(0)").text());
             url_param += '&minprice='+low+'&price='+high;
             refineparamsAry.push('price^'+low+'-'+high);

             low =  $.trim($(".star-container .low .number:eq(0)").text());
             high = $.trim($(".star-container .high .number:eq(0)").text());
             url_param +='&rating='+low+'&maxrating='+high;
             refineparamsAry.push('rating^'+low+'-'+high);

            // var exact_date = $("input[name=filter-date]:checked").val();
             var exact_date = $("#refine-url-form input[name=date]").val();
             if(exact_date){
                url_param +='&date_format=Ymd'+"&date="+exact_date;
                refineparamsAry.push("date^"+exact_date);
             } else {
                url_param +='&date_format=Ymd'+"&date="+ $("input[name=keep-search-date]").attr("ref");
                refineparamsAry.push("date^"+ $("input[name=keep-search-date]").attr("ref"));
             }

             var exact_dur = $("input[filter=filter-duration]:checked").val();
             if(exact_dur){
                url_param +='&dura_name='+exact_dur+' Days'+"&duration="+exact_dur;
                refineparamsAry.push("duration^"+exact_dur);
             }

             return url_param;
    }

    function getSortFilterValue(){
        var sort       = $('li.sort.active').attr('content');
        var tax_option = $("#tax-display-set").val();
        if(sort == 'SELLING_PRICE_TAX_IN'){
            if(tax_option == 'tax_include'){
                sort = 'SELLING_PRICE_TAX_IN';
            } else{
                sort = 'SELLING_PRICE_TAX_OUT';
            }
         }
         return "&sort="+sort;
    }

    function search_timer_process(){
            search_timer = null
			if(search_ajax_call) {
				search_ajax_call.abort();
				search_ajax_call =  null;

			}
            var errorMsg = "Sorry! The searching process does not give response within a proper time, Please change your search condition";
            hideSearchLoader(14,errorMsg);//14 timeout
      }

     var filterEc = false;
     var filterName = null;

    function ecOnFilterCallback(response) {
        var token = response.token;
        var filterParam =  getSidebarFilterValue();
        var sortParam    = getSortFilterValue();
        var url_param = filterParam + sortParam;
        if(typeof filterName !=='undefined' && filterName == 'matrix'){
            url_param +='&featured=matrix';
            if($("#matrix-selected-hotel-id").val() !== ''){
               url_param +='&hotel_id='+$("#matrix-selected-hotel-id").val();
            }
            refineType="best price finder";
        } else {
            refineType="refine";
        }


        var sid = $("#sid").val();
        //var search_refine_url = $("#search_url").val();
        var search_refine_url = $("#search_ajax_url").val();

         //clean the error message
         $(".search-explore ").empty();

         //For error modal window
         $("#custsup-session-id").val(sid);

         //for display the loader
         var from = $.trim($("#refine-url-form input[name=remember_dep]").val());
         var to   = $.trim($("#refine-url-form input[name=sentdest]").val());

         var durName =  $("input[filter=filter-duration]:checked").attr('ref');
         if(typeof durName == 'undefined'){
           durName =  $("input[name=keep-search-dura]").val();
         }

         var svDateSearch = $("#refine-url-form input[name=date]").val();
         // var svDateSearch = $("input[filter=filter-date]:checked").val();
         if(typeof svDateSearch == 'undefined'){
            svDateSearch =  $("input[name=keep-search-date]").attr("ref");
         }
         $("input.depDate").val(formatCalendarDateString(svDateSearch));

         var loaderNotes = 'Please wait as we filter<br/>the results for you.'
         if(typeof filterName !=='undefined' && filterName == 'sort'){
            loaderNotes  = 'Please wait as we sort<br/>the results for you.'
         }
         $(".search-loader-block h1.alert-msg").html(loaderNotes);
         $(".search-loader-block .from-to").html(from+" to "+to);
         $(".search-loader-block .display-dept-date").html(formatJsDateString(svDateSearch));
         $(".search-loader-block .display-dura").html(durName);
         showSearchLoader();
        var ajax_url = search_refine_url+"?token="+token+"&refine=true&filter=true&sid="+sid+url_param+"&page=0";
        $("div.booking-headings").hide();
        var tax_val = get_hash_value('tax');
        search_timer = setTimeout(search_timer_process, search_time_period);
        search_ajax_call = $.get(ajax_url,{},function(json_results){
              if(search_timer) {
                   clearTimeout(search_timer);
                   search_timer = null;

                   var results = JSON.parse(json_results);
                   if(results.status == 'ok') {
                           if(results.data.suggest_date){
                               $("div.top-contents .suggest-date").html(results.data.suggest_date);
                           } else {
                               if(results.data.grid){
                                   $("div.top-contents .grid").html(results.data.grid);
                                   $("div.top-contents .alternate-dates").html(results.data.gridSummary);
                                  // $(".price-matrix-notes .price").text($("div.top-contents .grid .price").text());
                                   $(".price-matrix-area").show();
                               }
                               if(results.data.dateFilter){
                                   $("ul.date-options").html(results.data.dateFilter);
                               }
                               $("div.more_search_results").html('<div class="search-result-list vacations">'+results.data.main+'</div>');
                               var products = [], type;
                               $.each($('input.hidden-hotel-id', $('.search-result-list:last')), function(i,item){
                                   if($(this).parentsUntil('.search-result-list', 'ul').hasClass('featured')){
                                       type = 'featured';
                                   } else {
                                       type = 'standard';
                                   }

                                   products[i] =  {
                                                   product:{
                                                               productId: ""+$(this).val(),
                                                               impressionType: type,
                                                               discounted: $(this).siblings(".hidden-hotel-discount-status").val()
                                                           }
                                                  } ;

                               })

                               digitalData.event = digitalData.event || [];
                               digitalData.event.push({
                                 eventInfo: {
                                   eventCondition: "product impression", //name of DTM direct call prefixed with "dl"
                                   eventName: "product impression", //prefixed with "dl"
                                   eventCategory: "vacation",
                                   impressions: products,
                                   attributes:{
                                                   server: "www.redtag.ca", //set with the server ID or address that is serving the current page
                                                   mobile:  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ?'mobile':'desktop',
                                                   message: "Welcome Redtag Vacations", //set with message presented to visitor
                                                   searchCategory: "vacation", //values coudl be standard, flight, vacation, cruise, car, etc.
                                                   searchType: refineType, //could be start, modify, refine
                                                   searchAllFacet: refineparamsAry.join("|") //if this type of search facet/refinement is applicable

                                               }
                                 }
                               });


                               if(results.data.explore){
                                  $("div.search-explore").html(results.data.explore);
                               } else{
                                   $("div.search-explore").empty();
                               }
                               $(".trip-results").show();
                               if(tax_val) {
                                   $("input#tax-display-set").val(tax_val);
                                   var txt = $("a.tax-options[data-option="+tax_val+"]").text();
                                   $(".tax-options-display").text($("a.tax-options[data-option="+tax_val+"]").text());
                                }

                                $("div.booking-headings").show();
                                $('.top-filters').show();
                                if(results.data.resultsCount){
                                   $('.vac-count').html(results.data.resultsCount);
                                }
                                syncExploreSearch();
                                set_url_hash();
                                set_tax_display($("div.more_search_results"));

                                $('.grid_option').popover({
                                  html: true,
                                  animation: true,
                                  delay: 300
                                });

                                $('.meal-type').popover({
                                   html: true,
                                   animation: true,
                                   delay: 300,
                                   trigger:'hover'
                                });

                                $(".flight-details").popover({
                                   html: true,
                                   animation: true,
                                   delay: 300,
                                   trigger:'hover'
                                });

                                $(".promo-seat-selection").popover({
                                   html: true,
                                   animation: true,
                                   delay: 300,
                                   trigger:'hover'
                                });

                       }
                       hideSearchLoader();
                   } else if(results.errorCode){
                       $(".price-matrix-area").hide();
                       $(".trip-results").hide();
                       hideSearchLoader(results.errorCode,results.errorMsg);
                       digitalData.event = digitalData.event || [];
                       digitalData.event.push({
                           eventInfo: {
                               eventCondition: "error message",
                               eventName: "error message",
                               errorMessage: "Search Error|Message Details^"+results.errorMsg
                           }
                        })
                   }
              }
        });

     }

    function filter_process(fileterRunName){
           filterName = fileterRunName;

           searchEnforcement.setConfig({
             onReady: function() {
             },
             onCompleted: function(response) {
                 ecOnFilterCallback(response);
               },
           });

           searchEnforcement.run();
        };

        //for tablet filter
        $('.vacations-filters').on('click','.icon-remove-sign', function(e){
            $(this).parent().parent().removeClass("active");
            $("#filter-tabs li").removeClass("active");
        });

        $('.vacations-filters').on('click','input[type=radio],input[type=checkbox]', function(e){
               //Update the search title
               if($(this).attr("filter") =='filter-date'){
                  $("#refine-url-form input[name=date]").val($("input[filter=filter-date]:checked").val());
               } else if($(this).attr("filter") =='filter-duration'){
                  $("#refine-url-form input[name=duration]").val($("input[filter=filter-duration]:checked").val());
                  $("#refine-url-form input[name=dura_name]").val($("input[filter=filter-duration]:checked").attr("ref"));
               }

               var $thisInput =  $(this);
               var inputType = $thisInput.prop('type');
               var checked = $thisInput.prop('checked');
               $.each($("input[filter="+$thisInput.attr('filter')+"][value='"+$thisInput.attr('value')+"']"), function(i,item){
                   if($(item).attr('name') !== $thisInput.attr('name')) {
                      $(item).prop('checked',checked);
                   }
               });

               //for filter label tag
               var $tag = $('<li class="" value="" ><span></span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
               $tag.addClass(inputType);
               var filterVal = $thisInput.attr('filter');

               if(inputType == 'checkbox') {
                    if(checked){
                         $tag.attr('value',  $thisInput.val());
                         $tag.attr('filter', filterVal);
                         $tag.find('span').text($thisInput.parent().text());
                         $("ul.active-filter").append($tag);
                    } else {
                        $("ul.active-filter li.checkbox[value="+$thisInput.val()+"]").remove();
                    }
               } else { //radio
                    $("ul.active-filter li.radio[filter="+filterVal+"]").remove();
                    $tag.attr('value',  $thisInput.val());
                    $tag.attr('filter', filterVal);
                    $tag.find('span').text($thisInput.parent().text());
                    $("ul.active-filter").append($tag);
               }
               //end for filter tag


               filter_process();
              // e.preventDefault ? e.preventDefault() : e.returnValue = false;
         });

         //click remove filter lable tag
         $(document).on('click','.active-filter .icon-remove-sign',function(){
             var $thisInput =  $(this).parent().parent();
             var type =  $thisInput.attr("class");
             if(type === 'checkbox' || type === 'radio'){
                 $("input[type="+type+"][value="+$thisInput.attr("value")+" ]").prop('checked', false);
             } else if(type === 'slide-price') { //slider
                 $(".price-container .high .number").text('10000');
                 $(".price-container .low .number").text('0');
                 $(".slider.price-slider").slider('setValue',['0','10000']);
             } else if(type === 'slide-star'){
                 $(".star-container .high .number").text('5');
                 $(".star-container .low .number").text('1');
                 $(".slider.star-slider").slider('setValue',['1','5']);
             }

             $thisInput.remove();
             filter_process();
         });





         $('.vacations-filters').on('change','input[name=hotel-id]', function(){
               $(".vacations-filters .error-message").empty();
               $("input[name=hotel-name-input]").val("");
               filter_process();
         });

         //click hotel name ->Go
         $('.vacations-filters').on('click','a.hotel-name-search', function(e){
             $(".vacations-filters input[name=hotel-id]").val("");
             $(".vacations-filters .error-message").empty();
             $(".vacations-filters .hotel-section span.bfh-selectbox-option").text('Show All Hotels');
             //var name_keyword = $("input[name=hotel-name-input]").val().trim().toLowerCase();
             var name_keyword = $("input[name=hotel-name-input]").val().toLowerCase();

             if( name_keyword !=''){
                 var hotel_ids_arr = [];
                 var title;
                 $.each($(".hotel-section ul li a"),function(id,val){
                    title =  $(this).text().toLowerCase();
                    if(title.indexOf(name_keyword) != -1){
                       hotel_ids_arr.push($(this).attr('data-option'));
                    }
                 })
                 if(hotel_ids_arr.length >0) {
                    $("input[name=hotel-id]").val(hotel_ids_arr.join());
                    filter_process();
                 } else {
                   $(".vacations-filters .error-message").html("no matched hotel name found");
                 }

             } else {
                 $(".vacations-filters .error-message").html("hotel name is empty");
             }
             e.preventDefault ? e.preventDefault() : e.returnValue = false;
         });

        //hotel name keyup
        $(document).on('keyup' , 'input[name=hotel-name-input]',  function(e){
           $(".vacations-filters .error-message").empty();
           //click enter key
           if(e.keyCode == 13){
               $(".vacations-filters a.hotel-name-search").trigger('click');
           }
           e.preventDefault ? e.preventDefault() : e.returnValue = false;
        });



        //Process Filter select all, note here only checkbox as 'select-all'
        $(document).on('click',".vacations-filters .select-all", function(e){
            var ref = $(this).attr("ref");
            $("input[filter="+ ref +"]").prop("checked", true);

            //for filter tag
            var $tag = $('<li class="checkbox" value=""  filter="'+ref+'" ><span></span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
            var $ele, inputName;
            if(ref=='pkg-opt') {
               inputName = 'pkg-opt-dest';
            } else if(ref=='tour-opt'){
               inputName = 'tour-opt-dest';
            }


            $.each($("input[name="+inputName+"]"), function(i,obj){
                  $ele = $tag.clone();
                  $ele.attr('value',  $(this).val());
                  $ele.find('span').text($(this).parent().text());
                  $("ul.active-filter").append($ele);
            });
            //end for filter tag


            filter_process();
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        });

        //Process filter clear all
        $(document).on('click',".vacations-filters .clear-all", function(e){
            var ref = $(this).attr("ref");
            $("input[filter="+ref+"]").prop("checked", false);

            //for clean the filter tag
             $("ul.active-filter li[filter="+ref+"]").remove();


            if($(this).attr("ref") =='filter-duration'){
                var default_dur = $("input[name=keep-search-dura]").val();
                $("span.display-dura").text(default_dur);
            }

           filter_process();
           e.preventDefault ? e.preventDefault() : e.returnValue = false;
        });



        //init tax display value
       function set_tax_val(tax_val) {
            if(tax_val) {
                    $("input#tax-display-set").val(tax_val);
                    $(".tax-options-display").text($("a.tax-options[data-option="+tax_val+"]").text());
                }
          }

       function set_sort_val(sort_val) {
                //init the sort value
                $("li.sort").removeClass('active');
                $("li.sort[content="+sort_val+"]").addClass('active');
          }

        function set_filter_val(filter_val) {
                //init filter value
                //touropt=CAH,HOL,NOL,POR,SGN,SQV,SWG,TMR,VAC,VAT,WJV&pkgopt=beach&minprice=550&price=2000&rating=1&maxrating=5&date_format=Ymd&date=20140401&dura_name=8 Nights&duration=8
                if(filter_val && filter_val !=""){
                   var  filter_var_arr = filter_val.split("&");
                   var  param_val_str,param_val_arr,low,high;
                   $.each(filter_var_arr, function(index,val){
                       param_val_str = val.split("=");
                       switch(param_val_str[0]){

                           case "duration":
                                 $(".duration-options input[value="+param_val_str[1]+"]").prop("checked", true);
                                 $("#refine-url-form input[name=duration]").val(param_val_str[1]);
                                 $("#refine-url-form input[name=dura_name]").val($(".duration-options input[value="+param_val_str[1]+"]").attr("ref"));
                                 //add filter tag
                                 if(param_val_str[1] !== $("input[name=keep-search-dura]").attr("ref")){
                                    $("ul.active-filter").append('<li class="radio"  filter="filter-duration" value="'+param_val_str[1]+'" ><span>'+$(".duration-options input[value="+param_val_str[1]+"]:eq(0)").attr("ref")+'</span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
                                 }
                               break;

                           case "date":
                                 $(".date-options input[value="+param_val_str[1]+"]").prop("checked", true);
                                 $("#refine-url-form input[name=date]").val(param_val_str[1]);
                                 //add filter tag
                                 if(param_val_str[1] !== $("input[name=keep-search-date]").attr("ref")){
                                    $("ul.active-filter").append('<li class="radio"  filter="filter-date" value="'+param_val_str[1]+'" ><span>'+$(".date-options input[value="+param_val_str[1]+"]:eq(0)").attr("ref")+'</span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
                                 }
                                break;

                           case "pkgopt":
                               var pkg_val =  param_val_str[1].split(",");
                               var $tag = $('<li class="checkbox" value=""  filter="pkg-opt" ><span></span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
                               var $ele;
                               $.each(pkg_val, function(i,v){
                                   $(".package-options input[value="+v+"]").prop("checked", true);
                                   //add filter tag
                                   $ele = $tag.clone();
                                   $ele.attr('value',  v);
                                   $ele.find('span').text($(".package-options input[value="+v+"]:eq(0)").parent().text());
                                   $("ul.active-filter").append($ele);
                               })
                               break;

                           case "touropt":
                               var tour_val =  param_val_str[1].split(",");
                               var $tag = $('<li class="checkbox" value=""  filter="tour-opt" ><span></span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
                               var $ele;

                               $.each(tour_val, function(i,v){
                                   $(".tour-operators input[value="+v+"]").prop("checked", true);
                                   //add filter tag
                                   $ele = $tag.clone();
                                   $ele.attr('value',  v);
                                   $ele.find('span').text($(".tour-operators input[value="+v+"]:eq(0)").parent().text());
                                   $("ul.active-filter").append($ele);
                               })
                               break;


                            case "minprice":
                                 var low = '0';
                                 if(param_val_str[1]){
                                     low = param_val_str[1];
                                 }
                                 $(".price-container .low .number").text(low);
                                 var high = $(".price-container .high .number:eq(0)").text();
                                 $(".price-slider").slider('setValue',[low,high]);

                                 //add filter tag
                                 if(low !=='0' || high !== '10000'){
                                    if($("li.slide-price").length >0){
                                       $("li.slide-price .filter-content").html($('.price-container:eq(0)').html())
                                    } else {
                                        var $tag = $('<li class="slide-price" value="" ><span class="filter-content"></span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
                                        $tag.attr('min',low);
                                        $tag.attr('max',high);
                                        $tag.find('.filter-content').html($('.price-container:eq(0)').html());
                                        $("ul.active-filter").append($tag);
                                    }
                                 }
                                break;

                           case "price":
                                 var high = '10000';
                                 if(param_val_str[1]){
                                     high = param_val_str[1];
                                 }
                                $(".price-container .high .number").text(high);
                                var low = $(".price-container .low .number:eq(0)").text();
                                 //var value = $(".price-slider").slider('getValue').val();
                                $(".price-slider").slider('setValue',[low, high]);

                                //add filter tag
                                if(low !=='0' || high !== '10000'){
                                    if($("li.slide-price").length >0){
                                       $("li.slide-price .filter-content").html($('.price-container:eq(0)').html())
                                    } else {
                                        var $tag = $('<li class="slide-price" value="" ><span class="filter-content"></span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
                                        $tag.attr('min',low);
                                        $tag.attr('max',high);
                                        $tag.find('.filter-content').html($('.price-container:eq(0)').html());
                                        $("ul.active-filter").append($tag);
                                    }
                                }


                                break;


                           //minprice=0&price=2000&rating=1&maxrating=5

                            case "rating":
                                 var low = '1';
                                 if(param_val_str[1]){
                                     low = param_val_str[1];
                                 }
                                 $(".star-container .low .number").html(low);
                                 //var value = $(".slider.star-slider:eq(0)").slider('getValue').val();
                                 var high = $(".star-container .high .number:eq(0)").text();

                                 $(".slider.star-slider").slider('setValue',[low,high])


                                 //add filter tag

                                 if(low !=='1' || high !== '5'){
                                    if($("li.slide-star").length >0){
                                       $("li.slide-star .filter-content").html($('.star-container:eq(0)').html())
                                    } else {
                                        var $tag = $('<li class="slide-star" value="" ><span class="filter-content"></span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
                                        $tag.attr('min',low);
                                        $tag.attr('max',high);
                                        $tag.find('.filter-content').html($('.star-container:eq(0)').html());
                                        $("ul.active-filter").append($tag);
                                    }
                                 }
                                 break;

                            case "maxrating":
                                 var high = '5';
                                 if(param_val_str[1]){
                                     high = param_val_str[1];
                                 }
                                 var low  =  $(".star-container .low .number:eq(0)").text();
                                 $(".star-container .high .number").html(high);
                                // var value = $(".slider.star-slider:eq(0)").slider('getValue').val();
                                 $(".slider.star-slider").slider('setValue',[low, high]);

                                 //add filter tag
                                 if(low !=='1' || high !== '5'){
                                    if($("li.slide-star").length >0){
                                       $("li.slide-star .filter-content").html($('.star-container:eq(0)').html())
                                    } else {
                                        var $tag = $('<li class="slide-star" value="" ><span class="filter-content"></span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
                                        $tag.attr('min',low);
                                        $tag.attr('max',high);
                                        $tag.find('.filter-content').html($('.star-container:eq(0)').html());
                                        $("ul.active-filter").append($tag);
                                    }
                                 }
                                break;
                       }
                   })
                 }
          }
    /*******************Filter End***********************************************************/
    /**Sort By Begin  */
     $(document).on('click','li.sort', function(e){
           if(!$(this).hasClass('active')) {
                $("li.sort").removeClass('active');
                $(this).addClass('active');
                filter_process('sort');
           }
           e.preventDefault ? e.preventDefault() : e.returnValue = false;
      });

      function checkFilterUpdatedFromURL(){
            var filterUpdate = false;
            var filter_val    = get_hash_value('filter'); //real history data
            if(filter_val && filter_val !=""){
                var  filter_var_arr = filter_val.split("&");
                var  param_val_str,param_val_arr,value;
                $.each(filter_var_arr, function(index,val){
                    param_val_str = val.split("=");
                    value = $.trim(param_val_str[1]);
                    switch(param_val_str[0]){
                        case "duration":
                             if($("input[name=keep-search-dura]").attr("ref") != value){
                                 filterUpdate = true;
                                 return false ;
                             }

                            break;

                        case "date":
                             if($("input[name=keep-search-date]").attr("ref") != value){
                                 filterUpdate = true;
                                 return false ;
                             }

                             break;

                        case "pkgopt":
                            if($("#refine-url-form input[name=all_inclusive]").val() != value){
                                 filterUpdate = true;
                                 return false ;
                            }

                            break;

                        case "touropt":
                            if("" != value){
                                filterUpdate = true;
                                return false ;
                            }
                            break;


                         case "minprice":
                             if('0' != value){
                                filterUpdate = true;
                                return false ;
                             }
                             break;

                        case "price":
                             if($("#refine-url-form input[name=price]").val() != value){
                                filterUpdate = true;
                                return false ;
                             }
                             break;

                         case "rating":
                             if($("#refine-url-form input[name=rating]").val() != value){
                                filterUpdate = true;
                                return false ;
                             }
                             break;

                         case "maxrating":
                             if('5' != value){
                                filterUpdate = true;
                                return false ;
                             }
                            break;
                    }
                })
          }

          if(filterUpdate){
              return true;
          } else {
             var sortValue = get_hash_value('sort'); //real sort
             if(''!= sortValue && 'SELLING_PRICE_TAX_IN' !== sortValue){
                return true;
             }
          }

          return false;


      }

      function set_url_hash() {
           if($(".vacations-filters").is(':visible') == false){
               return ;
           }
           var tax_val,sort_val,page_val,filter_val;

             if($("input#tax-display-set").length>0){
                 tax_val = $("input#tax-display-set").val();
             } else {
                 tax_val = "tax_exclude";
             }

            sort_val = $("li.sort.active").attr('content');


            if($("input#display_page_num").length>0){
                //page_val = $("input#display_page_num").val().trim();
                page_val = $("input#display_page_num").val();

            } else {
                page_val = '0';
            }
            var filter_val  = getSidebarFilterValue().substr(1);


           $(location).attr('hash', tax_val+'/'+sort_val+'/'+page_val+'/'+filter_val);

     }
   /*       Sort by End    */

   //show tax
    $(document).on('change','input#tax-display-set', function(){
          var tax_option  =  $("input#tax-display-set").val();
          var previous_tax_value =  get_hash_value('tax');
          if(previous_tax_value != tax_option){
               set_hash_value('tax', tax_option);
               var sort = get_hash_value('sort');
               if(sort == 'SELLING_PRICE_TAX_OUT' || sort == 'SELLING_PRICE_TAX_IN'){
                   filter_process();
               } else {
                  set_tax_display($("div.more_search_results"));
               }
               if(tax_option == 'tax_include'){
                  $(".trip-results .total .tax-included-prefix").show();
                  $(".trip-results .total").addClass("new");
               } else {
                  $(".trip-results .total .tax-included-prefix").hide();
                  $(".trip-results .total").removeClass("new");
               }

         }
       });


   function set_tax_display(parent) {
           var tax_option  =  $("input#tax-display-set").val();
           var tax, base_price, total_price;
            $.each($(parent).find("div.sub-total"), function(key,val){
                tax= parseInt($(this).attr("tax"));
                base_price = parseInt($(this).attr('base_price'));
                total_price = tax+base_price;

                if(tax_option == 'tax_exclude'){
                     $(this).find(".price").html('$'+base_price+'<sup>CAD</sup>');
                     $(this).find(".taxes").html("per guest<br/>+taxes: $"+tax);
                }  else {
                     $(this).find(".price").html('$'+total_price+'<sup>CAD</sup>');
                     $(this).find(".taxes").html("per guest<br/>includes taxes &amp; fees");
                 }
            })
     }
     /**Tax Display  */

    function set_hash_value(name, value) {
        //   #tax-display/sort/page
        var hash_str = $(location).attr('hash').substr(1);
        var hash_values = hash_str.split('/');
        switch(name){
           case 'tax':
                   hash_values[0] = value;
                   break;
           case "sort":
                    hash_values[1] = value;
                   break;
            case "page":
                   hash_values[2] = value;
                   break;
            case "filter":
                 hash_values[3] = value;
                 break;
        }
        $(location).attr('hash', hash_values.join("/"));
    }

   function get_hash_value(name) {
        //   #tax-display/sort/page
        var hash_str = $(location).attr('hash').substr(1);
        var hash_values = hash_str.split('/');
        var ret = false;
        switch(name){
           case 'tax':
                   if(typeof hash_values[0] !== 'undefined') ret = hash_values[0];
                   break;
           case "sort":
                    if(typeof hash_values[1] !== 'undefined') ret = hash_values[1] ;
                   break;
            case "page":
                    if(typeof hash_values[2] !== 'undefined') ret = hash_values[2];
                   break;
            case "filter":
                    if(typeof hash_values[3] !== 'undefined') ret = hash_values[3];
                   break;
         }
         return ret;
    }

    $(document).on("click",".select_next_available", function(e) {
            $("#alternate-dates").modal('hide');
            var selectDate  = $(".suggest-date-list input[name=suggest-date]:checked").val();
            $("#refine-url-form input[name=date]").val(selectDate);
            if($("input[name=alternate-date]").attr("preSelectDate") != selectDate){
                var $tag = $('<li class="radio" filter="filter-date" value="'+selectDate+'" ><span>'+$(".suggest-date-list input[name=suggest-date]:checked").attr('ref')+'</span><a data-original-title="" title=""><i class="icon-remove-sign activeFilter"></i></a></li>');
                $("ul.active-filter li.radio[filter=filter-date]").remove();
                $("ul.active-filter").append($tag);
                filter_process();
            }
            $(".search-explore").empty();
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
	});
