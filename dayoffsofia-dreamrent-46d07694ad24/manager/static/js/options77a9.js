(function ($) {
	'use strict';

	/* ///// Template Helper Function ///// */

	var ajaxurl = "";

	$.fn.hasAttr = function(attribute) {
		var obj = this;

		if (obj.attr(attribute) !== undefined) {
			return true;
		} else {
			return false;
		}
	};

	function checkVisibility (object) {
		var el = object[0].getBoundingClientRect(),
			wHeight = $(window).height(),
			scrl =  wHeight - (el.bottom - el.height),
			condition = wHeight + el.height;

		if (scrl > 0  && scrl < condition) {
			return true;
		} else {
			return false;
		}
	};

	var tagList = [];
	var locationsFilters = {
		"title": null,
		"category": null,
		"city": null,
		"priceRange":[],
		"tags": []
	};
	var locationsMap;
	var mainMapMarkers = [];
	var bounds = new google.maps.LatLngBounds();

	var teslaThemes = {
		init: function () {
			/* --------- Default Functions --- */
			this.facilities();
			this.stickyHeader();
			this.checkInputsForValue();
			this.nrOnlyInputs();
			this.slickInit();
			this.parallaxInit();
			this.tabsInit();
			this.googleMaps();
			this.contactForms();

			/* --------- Custom Functions --- */
			this.toggles();
			this.fileAPI();
			this.offersLoadAjax();
			this.registerUser();
			this.fitVids();
		},

		/* ///// Template Custom Functions ///// */

		/* ----- Theme Default Functions ----- */

		facilities: function() {
			var iconsCunt = 0;

			$('.add_facility').on('click', function(){
				var new_item = '<li class="facility-item"><label class="item-checkbox"><input type="hidden"  name="Location[facilitiez][' + iconsCunt + '][facility]" value="icon-Streamline-18"><i class="icon-Streamline-18"></i></label></li>';
				$(new_item).appendTo('.facilities-list');

				iconsCunt ++;
			});

			$(document).on('click', '.facility-item', function( e ){
				var obj = $( this );
				obj.addClass('current');
				// is icon is set
				var setValue = obj.find( 'input' ).val();
				$('.facilities-icons').find( 'input').attr('checked', false);
				if(  setValue != "" ) {
					$('.facilities-icons').find( 'input[value="' + setValue + '"]' ).attr('checked', 'checked');
				}

				$('.facilities-icons').css({
					'left': obj.position().left + 'px',
					'top': obj.position().top + obj.outerHeight( true ) + 15 + 'px'
				});

				// Show icons
				setTimeout( function() {
					$('.facilities-icons').addClass('visible');
				}, 250);
			});

			$('.icon-picker label').on('click', function(){
				var icon_code = $(this).find('input').val();
				$('.facility-item.current').find('input').val(icon_code);
				$('.facility-item.current').find('i').removeClass().addClass(icon_code);
				$('.facilities-icons').removeClass('visible');

				$( '.facility-item' ).removeClass( 'current' );
			});

			$(document).on('mouseover', '.facility-item:last', function( e ){
				var remove_button = '<span class="remove_facility"></span>';
				if(!$('.remove_facility').length){
					$(this).append(remove_button);
				}
			});

			$(document).on('mouseleave', '.facility-item:last', function( e ){
				$('.remove_facility').remove();
			});

			$(document).on('click', '.remove_facility', function(){
				$(this).parent().remove();
				setTimeout( function() {
					$('.facilities-icons').removeClass('visible');
				}, 300);
			});
		},
		registerUser: function() {

			$( 'form.register-form' ).each( function() {
				var form = $( this );

				form.ajaxForm({
					url: ajaxurl,
					data: {
						action:'register_profile_form'
					},
					success: function( data ) {

						var result = $.parseJSON( data );

						switch( Object.keys( result )[0] ) {

							case 'username': {
								form.find( '.reg_username' ).addClass( 'input-error' ).attr( 'value', result.username );
								form.find( '.reg_username' ).on( 'click focus', function() {
									if( $( this ).hasClass( 'input-error' ) ) $( this ).attr( 'value', '' ).removeClass( 'input-error' );
								});
								break;
							}
							case 'pass': {
								form.find( '.reg_password, .reg_passwordr' ).addClass( 'input-error' ).attr( 'type', 'text' );
								form.find( '.reg_password' ).attr( 'value', result.pass );
								form.find( '.reg_passwordr' ).attr( 'value', result.pass2 );
								form.find( '.reg_password, .reg_passwordr' ).on( 'click focus', function() {
									if( form.find( '.reg_password, .reg_passwordr' ).hasClass( 'input-error' ) ) {
										form.find( '.reg_password, .reg_passwordr' ).attr( 'value', '' ).attr( 'type', 'password' ).removeClass( 'input-error' );
									}
								});
								break;
							}
							case 'email': {
								form.find( '.reg_email' ).addClass( 'input-error' ).attr( 'value', result.email );
								form.find( '.reg_email' ).on( 'click focus', function() {
									if( $( this ).hasClass( 'input-error' ) ) {
										$( this ).attr( 'value', '' ).removeClass( 'input-error' );
									}
								});
								break;
							}
							case 'success': {
								var button_reg_val = form.find( '.wp-submit' ).val();
								form[0].reset();

								form.find( '.wp-submit' ).val( result.success );

								setTimeout( function() {
									form.find( '.wp-submit' ).val( button_reg_val );
								}, 5000 );
								break;
							}
						}
					}
				});
			});
		},

		stickyHeader: function () {

			if (jQuery('header').hasClass('sticky')) {
				jQuery(window).on('scroll', function () {
					var st = jQuery(this).scrollTop();

					if (st > jQuery('header').outerHeight(true)) {
						jQuery('header').addClass('fixed');
					} else {
						jQuery('header').removeClass('fixed');
					}
				});
			}
		},

		///////////////////////////////////////////////////////////////AJAX LOAD/////////////////////////////////////////////////////////////////////

		offersLoadAjax: function () {
			var loadMorebtn = jQuery('.section-offers').find('.btn-show-more');
			loadMorebtn.on('click', function(eveniment){
				eveniment.preventDefault();

				var obiect = jQuery(this),
				parObiect = jQuery('.section-offers .ajax-target'),
				offsetnr = obiect.attr('data-offset'),
				loadCount;

				jQuery.ajax({
					url: ajaxurl,
					data: { action: 'tt_post_ajax_load', offset: offsetnr, perload: obiect.data('perload') },
					type: 'POST',
					success: function (result) {
						loadCount = (result.match(/special-offer-block/g) || []).length;
						obiect.attr('data-offset', parseInt(offsetnr) + parseInt(loadCount));

						jQuery( result ).appendTo(parObiect).hide().fadeIn(700);

						if(parseInt(offsetnr) + parseInt(loadCount) == parseInt(obiect.data('count'))) {
							setTimeout(function(){
								obiect.addClass('hidden');
							}, 300)
						}
					},
					error: function (xhr, status, error) {
						console.log(xhr,status,error);
					}
				});
			});
		},

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		checkInputsForValue: function () {
			function validateHhMm( inputField ) {
				var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test( inputField.value );

				if( isValid ) {
					inputField.classList.add( 'hour-valid' );
					inputField.classList.remove( 'hour-error' );
				} else {
					inputField.classList.add( 'hour-error' );
					inputField.classList.remove( 'hour-valid' );
				}

				return isValid;
			}

			// Check Value
			$( document ).on( 'focusout', '.check-value', function () {
				var text_val = $(this).val();
				if (text_val === "" || text_val.replace(/^\s+|\s+$/g, '') === "") {
					$(this).removeClass('has-value');
				} else {
					$(this).addClass('has-value');
				}
			});

			// Hours Input
			$( document ).on( 'focusout', '.working-hours .form-input', function( e ) {
				if( this.value.length !== 0 ) {
					validateHhMm( $( this )[0] )
				}
			});
		},

		nrOnlyInputs: function () {
			$('.nr-only').keypress(function (e) {
				if (e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57)) {
					return false;
				}
			});
		},

		slickInit: function () {
			// Get All Carousels from the page
			var carousel = $('.tt-carousel');

			// Get All Sliders from the page
			var slider = $('.tt-slider');

			// Init Carousels
			carousel.each(function () {
				var obj = $(this),
					items = obj.find('.carousel-items');

				items.slick({
					focusOnSelect: obj.hasAttr('data-focus-on-select') ? obj.data('focus-on-select') : false,
					speed: obj.hasAttr('data-speed') ? obj.data('speed') : 450,
					slidesToShow: obj.hasAttr('data-items-desktop') ? obj.data('items-desktop') : 4,
					arrows: obj.hasAttr('data-arrows') ? obj.data('arrows') : true,
					dots: obj.hasAttr('data-dots') ? obj.data('dots') : true,
					infinite: obj.hasAttr('data-infinite') ? obj.data('infinite') : false,
					slidesToScroll: obj.hasAttr('data-items-to-slide') ? obj.data('items-to-slide') : 1,
					initialSlide: obj.hasAttr('data-start') ? obj.data('start') : 0,
					asNavFor: obj.hasAttr('data-as-nav-for') ? obj.data('as-nav-for') : '',
					centerMode: obj.hasAttr('data-center-mode') ? obj.data('center-mode') : false,
					vertical: obj.hasAttr('data-vertical') ? obj.data('vertical') : false,
					responsive: [
						{
							breakpoint: 1200,
							settings: {
								slidesToShow: obj.hasAttr('data-items-small-desktop') ? obj.data('items-small-desktop') : 3,
								slidesToScroll: obj.hasAttr('data-items-small-desktop') ? obj.data('items-small-desktop') : 3
							}
						},
						{
							breakpoint: 800,
							settings: {
								slidesToShow: obj.hasAttr('data-items-tablet') ? obj.data('items-tablet') : 2,
								slidesToScroll: obj.hasAttr('data-items-tablet') ? obj.data('items-tablet') : 2
							}
						},
						{
							breakpoint: 600,
							settings: {
								slidesToShow: obj.hasAttr('data-items-phone') ? obj.data('items-phone') : 2,
								slidesToScroll: obj.hasAttr('data-items-phone') ? obj.data('items-phone') : 2
							}
						}
					]
				});
			});

			// Init Sliders
			slider.each(function () {
				var obj = $(this),
					items = obj.find('.slides-list');

				items.slick({
					slidesToShow: 1,
					slidesToScroll: 1,
					focusOnSelect: obj.hasAttr('data-focus-on-select') ? obj.data('focus-on-select') : false,
					autoplay: obj.hasAttr('data-autoplay') ? obj.data('autoplay') : false,
					autoplaySpeed: obj.hasAttr('data-autoplay-speed') ? obj.data('autoplay-speed') : 2000,
					pauseOnHover: obj.hasAttr('data-pause-on-hover') ? obj.data('pause-on-hover') : true,
					fade: obj.hasAttr('data-fade') ? obj.data('fade') : false,
					dots: obj.hasAttr('data-dots') ? obj.data('dots') : true,
					speed: obj.hasAttr('data-speed') ? obj.data('speed') : 500,
					arrows: obj.hasAttr('data-arrows') ? obj.data('arrows') : true,
					infinite: obj.hasAttr('data-infinite') ? obj.data('infinite') : false,
					initialSlide: obj.hasAttr('data-start') ? obj.data('start') : 0,
					asNavFor: obj.hasAttr('data-as-nav-for') ? obj.data('as-nav-for') : ''
				});
			});
		},

		parallaxInit: function () {
			var container = $('[data-parallax-bg]');

			if (container.length) {
				container.each(function(index) {
					var boxImg = container.eq(index),
						boxImgData = boxImg.data('parallax-bg'),
						parallaxBox = boxImg.find('.box-img > span');

					parallaxBox.css({
						'background-image': 'url("' + boxImgData + '")'
					});

					function parallaxEffect () {
						var elCont = container[index],
							el = elCont.getBoundingClientRect(),
							wHeight = $(window).height(),
							scrl =  wHeight-(el.bottom - el.height),
							scrollBox = boxImg.find('.box-img'),
							condition = wHeight+el.height,
							progressCoef = scrl/condition;

						if( scrl > 0  && scrl < condition) {
							scrollBox.css({
								transform: 'translateY('+(progressCoef * 100)+'px)'
							});
						}
					}

					parallaxEffect();

					$(window).scroll(function() {
						parallaxEffect();
					});
				});
			}
		},

		tabsInit: function () {
			var tabs = $( '.tabed-content' );

			tabs.each( function () {
				var tab = $( this ),
					option = tab.find( '.tabs-header .tab-link' ),
					content = tab.find( '.tab-item' );

				option.on( 'click', function () {
					var obj = $( this );

					sessionStorage.setItem( 'current-tab',  option.index( obj ) );

					// window.history.replaceState( {} , '', url + '&tab_id=' + option.index( obj ) );

					if( !obj.hasClass( 'current' ) ) {
						option.removeClass( 'current' );
						obj.addClass( 'current' );

						content.removeClass( 'current' );
						$( '#' + obj.data( 'tab-link' ) ).addClass( 'current' );
						setTimeout(function(){
							google.maps.event.trigger( document.querySelector( '.set-location-block .map-container' ) , 'resize');
						},100)
					}
				});

				if( sessionStorage.getItem( 'current-tab' ) ) {
					var tabIndex = parseInt( sessionStorage.getItem( 'current-tab' ) );

					option.removeClass( 'current' );
					content.removeClass( 'current' );

					option.eq( tabIndex ).addClass( 'current' );
					content.eq( tabIndex ).addClass( 'current' );
				}
			});

			$( '.btn.add-listing-tab' ).on( 'click', function( e ) {
				e.preventDefault();

				$( '.tabed-content' ).find( '.tabs-header .tab-link' ).removeClass( 'current' );
				$( '.tabed-content' ).find( '.tab-item' ).removeClass( 'current' );

				$( '.tabed-content' ).find( '.tabs-header .tab-link' ).eq( 4 ).addClass( 'current' );
				$( '.tabed-content' ).find( '.tab-item' ).eq( 4 ).addClass( 'current' );

				window.scrollTo( 0, $( '.main-header' ).outerHeight( true ) );
			});
		},

		accordionInit: function () {
			var accordion = $('.accordion-group');

			accordion.each(function () {
				var accordion = $(this).find('.accordion-box');

				accordion.each(function () {
					var obj = $(this),
						header = $(this).find('.box-header h4'),
						body = $(this).find('.box-body');

					header.on('click', function () {
						if (obj.hasClass('open')) {
							body.velocity('slideUp', {
								duration: 150,
								complete: function () {
									obj.removeClass('open');
								}
							});
						} else {
							obj.addClass('open');
							body.velocity('slideDown', {duration: 195});
						}
					});
				});
			});
		},

		googleMapsMarkerClickEvent: function ( target ) {
			var mapMarkers = [];

			if( target === 'data_attr' ) {
				mapMarkers = $( '#map-canvas' ).data( 'map-markers' );
			} else {
				mapMarkers = [];

				$( '.location-item.location-ajax' ).each(function( i, val ) {
					mapMarkers[i] = {
						id: $( val ).data( 'id' )
					};
				});
			}

			for( var i = 0, n = mapMarkers.length; i < n; i ++ ) {
				mainMapMarkers[i].set( 'id', mapMarkers[i].id );

				google.maps.event.addListener( mainMapMarkers[i], 'click', function( e ) {
					var marker = this,
						locationId = marker.id;

					$( '.map-locations-box .locations-results ul.results-list' ).addClass( 'highlight-locations' );

					$( '.location-item.location-ajax' ).removeClass( 'active-location' );
					$( '.location-item.location-ajax[data-id="' + locationId +  '"]' ).addClass( 'active-location' );

					$( '.box-inner-col.locations-results' ).animate({
						scrollTop: $( '.location-item.location-ajax.active-location' )[0].offsetTop - $( '.main-header' ).outerHeight( true ) - 30
					}, '400' );
				});
			}
		},

		googleMaps: function () {
			// Describe Google Maps Init Function
			function initialize_map( map, customOptions ) {
				var mapOptions = {
						center: new google.maps.LatLng(customOptions.map_center.lat, customOptions.map_center.lon),
						zoom: parseInt(customOptions.zoom),
						scrollwheel: false,
						disableDefaultUI: true,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						styles: customOptions.styles
					};
				var contact_map = new google.maps.Map( map, mapOptions ),
					marker = new MarkerWithLabel({
						map: contact_map,
						position: new google.maps.LatLng(customOptions.marker_coord.lat, customOptions.marker_coord.lon),
						labelContent: '<img src="' + customOptions.marker + '" />',
						labelClass: 'custom-marker-class',
						zIndex: 22
					});
			}

			if( $( '#map-canvas' ).length ) {
				var mapMarkers = $( '#map-canvas' ).data( 'map-markers' );

				locationsMap = new google.maps.Map( $( '#map-canvas' )[0], {
					center: {
						lat: -33,
						lng: 151
					},
					zoom: 4
				});

				for( var i = 0, n = mapMarkers.length; i < n; i ++ ) {
					mainMapMarkers[i] = new MarkerWithLabel({
						map: locationsMap,
						position: new google.maps.LatLng( mapMarkers[i].marker_coord.lat, mapMarkers[i].marker_coord.lon ),
						labelContent: '<img src="' + mapMarkers[i].marker + '" />',
						labelClass: 'custom-marker-class',
						zIndex: 22
					});
					bounds.extend( new google.maps.LatLng( mapMarkers[i].marker_coord.lat, mapMarkers[i].marker_coord.lon ) );
				}

				teslaThemes.googleMapsMarkerClickEvent( 'data_attr' );

				setTimeout( function() {
					$( '.locations-map .spinner-box' ).removeClass( 'visible' );
				}, 3700 );

				locationsMap.fitBounds( bounds );
			}

			// Contact Widgets
			var contactWidgets = $( '.widget_contact_map' );

			if( contactWidgets.length ) {
				contactWidgets.each( function() {
					var map = $( this ).find( '.widget-map' );
					google.maps.event.addDomListener( window, 'load', initialize_map( map[0], map.data( 'options' ) ) );
				});
			}

			// Autocomple API
			var setLocationBlock = $( '.set-location-block' );

			if( setLocationBlock.length ) {
				var gmarkers = [];

				var input = setLocationBlock.find( '.form-input' )[0],
					mapContainer = setLocationBlock.find( '.map-container' )[0];

				var map = new google.maps.Map( mapContainer, {
					center: {
						lat: 40.7590562,
						lng: -74.0043362
					},
					zoom: 13
				});

				var autocomplete = new google.maps.places.Autocomplete( input );
				autocomplete.bindTo( 'bounds', map );

				autocomplete.addListener( 'place_changed', function() {
					var place = autocomplete.getPlace();

					if( !place.geometry ) return;

					if( place.geometry.viewport ) {
						map.fitBounds( place.geometry.viewport );
					} else {
						map.setCenter( place.geometry.location );
						map.setZoom( 17 );
					}
				});

				google.maps.event.addListener( map, 'click', function( e ) {
					for( var i = 0; i < gmarkers.length; i ++ ){
						gmarkers[i].setMap( null );
					}

					var marker = new google.maps.Marker({
						position: e.latLng,
						map: map
					});

					var geocoder = new google.maps.Geocoder();

					$('.location-map-lat').val(e.latLng.lat());
					$('.location-map-long').val(e.latLng.lng());

					geocoder.geocode({
						'latLng': e.latLng
					}, function( results, status ) {
						$(results).each(function(i, val){
							switch(results[i].types[0]) {
								case 'locality': {
									input.value = results[0].formatted_address;
									$('.hidden_input_for_city').val(results[i].address_components[0].long_name);
									return false;
								}
								case 'administrative_area_level_1': {
									input.value = results[0].formatted_address;
									$('.hidden_input_for_city').val(results[i].address_components[0].short_name);
									return false;
								}
								case 'country': {
									input.value = results[0].formatted_address;
									$('.hidden_input_for_city').val(results[i].address_components[0].short_name);
									return false;
								}
							}
						})
					});

					gmarkers.push( marker );
				});
			}
		},

		contactForms: function () {
			$( '.contact-form' ).each(function () {
				var t = $( this );
				var t_result = $( this ).find( '.submit-btn' );
				var t_result_init_val = t_result.text();
				var validate_email = function validateEmail(email) {
					var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					return re.test(email);
				};
				var t_timeout;
				t.submit(function (event) {
					event.preventDefault();
					var t_values = {};
					var t_values_items = t.find('input[name],textarea[name]');
					t_values_items.each(function () {
						t_values[this.name] = $(this).val();
					});

					if (t_values['name'] === '' || t_values['e-mail'] === '' || t_values['message'] === '') {
						t_result.val('Please fill in all the required fields.');
					} else
					if (!validate_email(t_values['e-mail']))
						t_result.val('Please provide a valid e-mail.');
					else
						$.post("php/contacts.php", t.serialize(), function (result) {
							t_result.val(result);
						});
					clearTimeout(t_timeout);
					t_timeout = setTimeout(function () {
						t_result.val(t_result_init_val);
					}, 3000);
				});
			});
		},

		/* ----- Theme Specific Functions ----- */

		toggles: function () {
			function adjustMenuHeight() {
				var sideNav = $( '.header-side-nav .main-nav' ),
					header = $( '.header-side-nav' ),
					headerHeight = header.outerHeight( true );

				$( window ).on( 'scroll', function() {
					var offset = Math.abs( header[0].getBoundingClientRect().top ),
						top = offset <= headerHeight ? headerHeight - offset + 'px' : 0,
						height = offset <= headerHeight ? 'calc(100% - ' + top : '100%';

					sideNav.css({
						'top': top,
						'height': height
					});
				});
			}

			// Main Search Form Toggle
			$( '.main-header .search-form-toggle' ).on( 'click', function() {
				$( '.main-header .main-search-form' ).addClass( 'form-open' );
				$( '.page-overlay' ).addClass( 'page-overlay-visible' );
			});

			$( '.main-search-form .clear-input' ).on( 'click', function() {
				$( '.main-header .main-search-form' ).removeClass( 'form-open' );
				$( '.page-overlay' ).removeClass( 'page-overlay-visible' );
			});

			// Header Login Form
			$( '.user-profile-block .profile-action' ).on( 'click', function() {
				var obj = $( this ),
					className = obj.hasClass( 'login' ) ? "login" : "register";

				if( obj.hasClass('dashboard_access') ) return;

				// Close forms if any open
				$( '.header-profile-form' ).removeClass( 'form-visible' );

				// Open required form
				$( '.header-profile-form.' + className + '-form' ).addClass( 'form-visible' );
				$( '.page-overlay' ).addClass( 'page-overlay-visible' );
			});

			$( '.header-profile-form a.forgot-password' ).on( 'click', function( e ) {
				e.preventDefault();

				$( '.header-profile-form' ).removeClass( 'form-visible' );
				$( '.header-profile-form.forgot-password-form' ).addClass( 'form-visible' );
			});

			$( '.header-profile-form .close-form-btn' ).on( 'click', function() {
				$( '.header-profile-form' ).removeClass( 'form-visible' );
				$( '.page-overlay' ).removeClass( 'page-overlay-visible' );
			});

			// Main Nav Toggle
			$( '.header-side-nav .side-menu-toggle' ).on( 'click', function() {
				$( '.header-side-nav .main-nav' ).toggleClass( 'show-main-nav' );
				$( '.page-overlay' ).toggleClass( 'page-overlay-visible' );
			});

			// Mobile Sidemenu Block
			$( '.mobile-sideblock-toggle' ).on( 'click', function() {
				$( '.page-overlay' ).addClass( 'page-overlay-visible high-index' );
				$( '.mobile-sidemenu-block' ).addClass( 'mobile-sidemenu-block-visible' );
			});

			$( '.mobile-sidemenu-block .close-sidemenu' ).on( 'click', function() {
				$( '.mobile-sidemenu-block' ).removeClass( 'mobile-sidemenu-block-visible' );
				$( '.page-overlay' ).removeClass( 'page-overlay-visible high-index' );
			});

			// Close All elements with overlay
			$( '.page-overlay' ).on( 'click', function() {
				// Remove Overlay
				$( '.page-overlay' ).removeClass( 'page-overlay-visible high-index' );

				// Close Profile Forms
				$( '.header-profile-form' ).removeClass( 'form-visible' );

				// Close Search Form
				$( '.main-header .main-search-form' ).removeClass( 'form-open' );

				// Close Side Nav
				$( '.header-side-nav .main-nav' ).removeClass( 'show-main-nav' );

				// Close Select Boxes
				$( '.select-box' ).removeClass( 'select-box-open' );

				// Mobile Sidemenu Block
				$( '.mobile-sidemenu-block' ).removeClass( 'mobile-sidemenu-block-visible' )
			});

			// Side nav children
			$( '.header-side-nav .main-nav li.menu-item-has-children > a, .mobile-sidemenu-block .sidemenu-nav>ul li.menu-item-has-children>a' ).on( 'click', function( e ) {
				e.preventDefault();

				$( this ).toggleClass( 'active' );
				$( this ).next().slideToggle( 250 );
			});

			// Location Select Box
			$( '.select-box' ).each( function(){
				var obj = $( this ),
					trigger = obj.find( '.select-box-input' ),
					options = obj.find( '.select-box-options .option' );

				trigger.on( 'click', function() {
					// Close All Select Boxes
					$( '.select-box' ).not( obj ).removeClass( 'select-box-open' );

					obj.toggleClass( 'select-box-open' );

					if( obj.hasClass( 'trigger-overlay' ) ) $( '.page-overlay' ).addClass( 'page-overlay-visible triggered-by-select-box' );
					if( !$( '.select-box' ).hasClass( 'select-box-open' ) ) $( '.page-overlay' ).removeClass( 'page-overlay-visible triggered-by-select-box' );
				});

				options.on( 'click', function() {
					var text = $( this ).text();

					trigger[0].setAttribute( 'value', text );
					trigger[0].setAttribute( 'data-cat', '' );
					trigger.val( text );
					obj.removeClass( 'select-box-open' );
					obj.addClass( 'select-box-filled' );
					$( '.page-overlay' ).removeClass( 'page-overlay-visible' );
				});
			});

			// Close Select Boxes
			$( document ).on( 'click', function( e ) {
				if( !$( e.target ).closest( '.select-box' ).length ) {
					$( '.select-box' ).removeClass( 'select-box-open' );

					if( $( '.page-overlay' ).hasClass( 'page-overlay-visible' ) && $( '.page-overlay' ).hasClass( 'triggered-by-select-box' ) ) {
						$( '.page-overlay' ).removeClass( 'page-overlay-visible triggered-by-select-box' );
					}
				}
			});

			// Check if page has side menu
			if( $( '.header-side-nav' ).length ) {
				adjustMenuHeight();
			}

			// Hidden Input Lines
			$( '.input-line.hide-input' ).each( function() {
				var trigger = $( this ).find( '.btn-reveal-input' ),
					input = $( this ).find( '.form-input-wrapper' );

				trigger.on( 'click', function() {
					input.slideDown( 250 );
				});
			});

			$( '.add-social-platforms-select-box li' ).on( 'click', function() {
				var obj = $( this ),
					options = obj.data( 'options' ),
					content = '<div class="input-line">' +
									'<h5 class="line-title">' + options.title + '</h5>' +
									'<input type="text" name="' + options.name + '" class="form-input check-value" placeholder="' + options.placeholder + '" />' +
								'</div>';

				obj.remove();

				$( '.add-social-platforms-select-box' ).before( content );
				$( '.add-social-platforms-select-box .select-box-input' ).val( '' );

				if( $( '.add-social-platforms-select-box li' ).length === 0 ) {
					$( '.add-social-platforms-select-box' ).remove();
				}
			});

			// Property Tags Block
			var uploadFormTags = $( '.property-tags-block' );

			function checkTagsList( tag, list ) {
				var arr = [];
				for( var i = 0, n = list.length; i < n; i ++ ) {
					arr.push( $( list[i] ).find( '.text' ).text() );
				}
				if( arr.indexOf( tag ) < 0 ) return true;
				return false;
			}

			if( uploadFormTags.length ) {
				var input = $( '.add-tags-block .form-input' );

				// Add Tag
				input.on( 'keypress', function( e ) {
					if( e.which === 13 ) {
						e.preventDefault();

						var newTagText = input.val(),
							newTag = '<span class="tag">' +
										'<span class="text">' + newTagText + '</span>' +
										'<span class="remove-category"></span>' +
									'</span>',
							tagsList = uploadFormTags.find( '.tags-list .tag' );

						tagList.push( newTagText );

						if( checkTagsList( newTagText, tagsList ) ) {
							uploadFormTags.find( '.tags-list' ).append( newTag );
							$(this).parent().find('.tag-list-input').val(  tagList.join(',') );
							input.val( '' );
						}
					}
				});

				// Remove Tag
				$( document ).on( 'click', '.property-tags-block .tags-list .tag .remove-category', function() {
					var parent = $( this ).parent();
					parent.remove();
				});
			}

			// Location Categories Filters
			var locationFilterCategories = $( '.locations-results .filters-categories' );

			if( locationFilterCategories.length ) {
				var categoriesList = locationFilterCategories.find( '.categories-list' );

				$( document ).on( 'click', '.filters-categories .categories-list li', function() {
					var obj = $( this ),
						value = obj.text(),
						newCategory = '<span class="category">' +
									'<span class="text">' + value + '</span>' +
									'<span class="remove-category"></span>' +
								'</span>';
					obj.remove();

					$( '.choosed-categories' ).append( newCategory );
				});

				$( document ).on( 'click', '.choosed-categories .category .remove-category', function() {
					var obj = $( this ).closest( '.category' ),
						value = obj.find( '.text' ).text(),
						newItem = '<li>' + value + '</li>';

					obj.remove();
					$( '.filters-categories .categories-list' ).append( newItem );
				});
			}

			// Property Price Range
			$( '.property-price-range .amount i' ).on( 'mouseover' , function() {
				$( '.property-price-range .amount i' ).removeClass( 'full' );

				$( this ).addClass( 'full' );
				$( this ).prevAll( 'i' ).addClass( 'full' );
			});

			$( '.property-price-range .amount i' ).on( 'click', function() {
				var index = $( '.property-price-range .amount i' ).index( $( this ) ) ;

				for( var i = index, n = 0; i >= n; i -- ) {
					$( '.property-price-range .amount i' ).eq( i ).addClass( 'full' );
				}

				$( '.property-price-range .amount' ).addClass( 'is-set' );
				$( '.property-price-range .amount' )[0].setAttribute( 'data-rating', index + 1 );
				$('.location_amount_range').val(index + 1);
			});

			$( '.property-price-range .amount' ).on( 'mouseleave', function() {
				if( !$( '.property-price-range .amount' ).hasClass( 'is-set' ) ) {
					$( '.property-price-range .amount i' ).removeClass( 'full' );
				}
			});

			// Search form shortcode
			$( '.discover-places-form .select-box-options li' ).on('click', function(){
				var value = $(this).text();
				var obj = $(this);
				if(obj.closest('.select-box').hasClass('categories')){
					$('.discover-places-form')[0].setAttribute('data-category', value);
				}
				if(obj.closest('.select-box').hasClass('cities')){
					$('.discover-places-form')[0].setAttribute('data-city', value);
				}
			});

			$( '.discover-places-form .form-submit' ).on('click', function(e){
				e.preventDefault();
				var href = $(this).attr('href');
				if($('.discover-places-form')[0].getAttribute('data-category')){
					href= href.concat('category=' + $('.discover-places-form')[0].getAttribute('data-category')+'&');
				}

				if($('.discover-places-form')[0].getAttribute('data-city')){
					href = href.concat('city=' + $('.discover-places-form')[0].getAttribute('data-city')+'&');
				}
				if($('.search-title-input').val()){
					href = href.concat('title=' + $('.search-title-input').val() +'&');
				}
				$(this)[0].setAttribute('href', href);
				window.location.href = href;
			});

			$( '.html-select-box' ).on('change', function(){
				var obj = $(this),
				value = obj.val();

				if( obj.hasClass( 'cities' ) ) {
					$('.discover-places-form')[0].setAttribute('data-city', value);
				}

				if( obj.hasClass( 'categories' ) ) {
					$('.discover-places-form')[0].setAttribute('data-category', value);
				}
			});

			//PRICE RANGE EXPLORE PAGE
			$( document ).ready(function() {
				var catg = $('.cat-select-ajax input').data('cat');

				if($('.box-inner-col.locations-results').length > 0) {
					if(catg != ''){
						locationsFilters.category = catg;
						$('.cat-select-ajax input').attr('value', catg);
						$('.select-options.category-ajax').val(catg);
						explore_ajaxcall(locationsFilters);
					}

					var city = $('.city-select-ajax input').data('city');
					if (city !='') {
						locationsFilters.city = city;
						$('.city-select-ajax input').attr('value', city);
						$('.select-options.city-ajax').val(city);
						explore_ajaxcall(locationsFilters);
					}

					if($('.search_location_title').val() != ''){
						locationsFilters.title = $('.search_location_title').val();
						explore_ajaxcall(locationsFilters);
					}
				}
			});

			$( '.price-range-hinput' ).on('change', function(){
				var range = $('.price-range-hinput');
				var range_array = [];
				for(var i = 0, n = range.length; i < n; i++){
					if( $( range[i] ).prop( 'checked' ) == true ) {
						range_array.push($( range[i] ).attr( 'value' ));
					}
				}
				locationsFilters.priceRange = range_array;
				explore_ajaxcall(locationsFilters);
			});

			$('.select-options.city-ajax').on('change', function(){
				locationsFilters.city = $(this).val();
				if ($(this).val() == 'ALL') {
					locationsFilters.city = null
				}
				explore_ajaxcall(locationsFilters);
			});

			$('.select-options.category-ajax').on('change', function(){
				locationsFilters.category = $(this).val();
				if ($(this).val() == 'ALL') {
					locationsFilters.category = null
				}
				explore_ajaxcall(locationsFilters);
			})

			$('.cat-select-ajax li').on('click', function(){
				locationsFilters.category = $(this).text();
				if ($(this).text() == 'ALL') {
					locationsFilters.category = null
				}
				explore_ajaxcall(locationsFilters);
			});

			$('.city-select-ajax li').on('click', function(){
				locationsFilters.city = $(this).text();
				if ($(this).text() == 'ALL') {
					locationsFilters.city = null
				}
				explore_ajaxcall(locationsFilters);
			});

			$('.results-filters .categories-list-wrapper .categories-list li').on('click', function(){
				setTimeout(function(){
					var tags = $('.map-locations-box .results-filters .choosed-categories .category');
					locationsFilters.tags = [];
					tags.each(function(){
						var val = $(this);
						locationsFilters.tags.push(val.find('.text').text())
					});
					explore_ajaxcall(locationsFilters);
				},200);
			});

			$(document).on('click', '.choosed-categories .category .remove-category', function(){
				setTimeout(function(){
					var tags = $('.map-locations-box .results-filters .choosed-categories .category');
					locationsFilters.tags = [];
					console.log(locationsFilters);
					tags.each(function(){
						var val = $(this);
						locationsFilters.tags.push(val.find('.text').text())
					});
					console.log(locationsFilters);
					explore_ajaxcall(locationsFilters);
				},200);
			})


			function explore_ajaxcall( properties ){
				$.ajax({
					url: ajaxurl,
					type: 'POST',
					data: {
						action: 'tt_filter_explore_locations',
						params: properties
					},
					success: function( result ){
						$( '.results-list' ).empty();
						$( result ).appendTo( $('.results-list') ).hide().fadeIn( 700 );

						// Clear Existing Markers
						$( mainMapMarkers ).each( function( index, value ){
							value.setMap( null );
						});

						mainMapMarkers = [];

						$( '.location-item.location-ajax' ).each(function(index, value){
							var value = $( value );
							mainMapMarkers[index] = new MarkerWithLabel({
								map: locationsMap,
								position: new google.maps.LatLng( value.data('marker-lat'), value.data('marker-lon') ),
								labelContent: '<img src="' + value.data('marker-thumb') + '" />',
								labelClass: 'custom-marker-class',
								zIndex: 22
							});
							bounds.extend( new google.maps.LatLng( value.data('marker-lat'), value.data('marker-lon') ) );
						});

						locationsMap.fitBounds( bounds );

						teslaThemes.googleMapsMarkerClickEvent( 'ajax_loc' );
					},
					error: function (xhr, status, error) {
						console.log(xhr,status,error);
					}
				});
			}


			// Save Locations To Favourites
			$( document ).on( 'click', '.add-to-favorites', function() {
				var $this = $( this );
				var itemToAdd = $this.closest( '.location-ajax' ); // Item for AJAX Call
				var post_id = itemToAdd.data( 'id' );

				if( $this.hasClass( 'not_logged' ) ){
					// Close forms if any open
					$( '.header-profile-form' ).removeClass( 'form-visible' );

					// Open required form
					$( '.header-profile-form.login-form' ).addClass( 'form-visible' );
					$( '.page-overlay' ).addClass( 'page-overlay-visible' );
				} else {
					$.ajax({
						url: ajaxurl,
						type: 'POST',
						data: {
							action: 'tt_add_favorite_location',
							postid: post_id
						},
						success : function( result ){
							var obj = $.parseJSON( result );

							if( obj.added ){
								$this.addClass( 'added' );
								return;
							}

							$this.removeClass( 'added' );
						}
					});
				}
			});

			//Remove Listings from dashboard button
			$( '.delete-listing-ajax' ).on( 'click', function( event ) {
				var post_id = $( '.delete-listing-ajax' ).data('id');
				var dialog_title = $( '.delete-listing-ajax' ).data('dialog_title');
				var dialog_content = $( '.delete-listing-ajax' ).data('dialog_content');
				var confirm_text = $('.delete-listing-ajax').data('confirm_text');
				var cancel_text = $('.delete-listing-ajax').data('cancel_text');
				var item_row = $( this ).closest( '.listing_item_row' );

				event.preventDefault();
				$.confirm({
					title: dialog_title,
					content: dialog_content,
					buttons: {
						confirm: {
							text: confirm_text,
							action:	function(){
								$.ajax({
									type:'POST',
									url: ajaxurl,
									data:{ action: 'tt_remove_listing_from_dashboard', postid: post_id },
									success : function(result){
										var obj = jQuery.parseJSON(result);
										if (obj.success) {
											item_row.hide();
										}
										if (obj.fail) {
											console.log('failed');
										}
									},
									error: function (xhr, status, error) {
										console.log(xhr,status,error);
									}
								})
							}
						},
						cancel: {
						text: cancel_text,
						action: function () {

							}
						}
					}
				});
			})

			//Remove FAVORITE Listings from dashboard button
			$( '.delete-favorite-listing-ajax' ).on( 'click', function( event ) {
				var post_id = $( '.delete-favorite-listing-ajax' ).data('id');
				var dialog_title = $( '.delete-listing-ajax' ).data('dialog_title');
				var dialog_content = $( '.delete-listing-ajax' ).data('dialog_content');
				var confirm_text = $('.delete-listing-ajax').data('confirm_text');
				var cancel_text = $('.delete-listing-ajax').data('cancel_text');
				var item_row = $( this ).closest( '.favorite-listing_item_row' );

				event.preventDefault();
				$.confirm({
					title: dialog_title,
					content: dialog_content,
					buttons: {
						confirm: {
							text: confirm_text,
							action:	function(){
								$.ajax({
									type:'POST',
									url: ajaxurl,
									data:{ action: 'tt_remove_favorite_listing_from_dashboard', postid: post_id },
									success : function(result){
										var obj = jQuery.parseJSON(result);
										if (obj.success) {
											item_row.remove();
										}
										if (obj.fail) {
											console.log('failed');
										}
									},
									error: function (xhr, status, error) {
										console.log(xhr,status,error);
									}
								})
							}
						},
						cancel: {
						text: cancel_text,
						action: function () {

							}
						}
					}
				});
			})

			// Update Profile Form - Dashboard Front
			$( "input[name='first-name']").attr('value', $( "input[name='first-name']").data('first') );
			$( "input[name='last-name']").attr('value', $( "input[name='last-name']").data('last') );
			$( "input[name='email']").attr('value', $( "input[name='email']").data('mail') );
			$( "input[name='user-phone']").attr('value', $( "input[name='user-phone']").data('phone') );

			$('.dashboard-form.edit-profile-form').ajaxForm({
				type: 'POST',
				url : ajaxurl,
				data: {action:'tt_update_profile_form'},
				success : function(result){
					var obj = jQuery.parseJSON(result);
					if (obj.email) {
						$(".dashboard_email").addClass('input-error').attr('value', obj.email);
						$(".dashboard_email").on('click, focus', function(){
							if($(".dashboard_email").hasClass('input-error'))
								$(".dashboard_email").attr('value','').removeClass('input-error');
						});
					}
					if (obj.success) {
						var button_reg_val = jQuery('.update-profile-form-ajax').val();
						$(".update-profile-form-ajax").attr('value', obj.success);
						setTimeout(function(){
								$('.update-profile-form-ajax').val(button_reg_val);
							},2000);
					}
					if(obj.pass){
						$(".dashboard_pass, .dashboard_pass_r").addClass('input-error').attr('type','text');
						$(".dashboard_pass").attr('value', obj.pass);
						$(".dashboard_pass_r").attr('value', obj.pass2);
						$(".dashboard_pass, .dashboard_pass_r").on('click, focus', function(){
							if($(".dashboard_pass, .dashboard_pass_r").hasClass('input-error'))
								$(".dashboard_pass, .dashboard_pass_r").attr('value','').attr('type','password').removeClass('input-error');
						});
					}
				}
			})

			// Side Menu Block Toggles
			$( '.bring-login-form' ).on( 'click', function( e ) {
				e.preventDefault();

				$( '.sidemenu-form.register-form' ).hide();
				$( '.sidemenu-form.forgot-password-form' ).hide();
				$( '.sidemenu-form.login-form' ).show();
			});

			$( '.bring-sign-up-form' ).on( 'click', function( e ) {
				e.preventDefault();

				$( '.sidemenu-form.forgot-password-form' ).hide();
				$( '.sidemenu-form.register-form' ).show();
				$( '.sidemenu-form.login-form' ).hide();
			});

			$( '.bring-forgot-password-form' ).on( 'click', function( e ) {
				e.preventDefault();

				$( '.sidemenu-form.forgot-password-form' ).show();
				$( '.sidemenu-form.register-form' ).hide();
				$( '.sidemenu-form.login-form' ).hide();
			});

			// Property Comments Rating
			$( '.comments-form .new-comment-rating .value' ).css({
				'min-width': '30px'
			});

			$( '.comments-form .new-comment-rating .bars i' ).css({
				'-webkit-transition': 'all 200ms ease-in-out',
				'transition': 'all 200ms ease-in-out'
			});

			$( '.comments-form .new-comment-rating .bars i' ).on( 'mouseover', function() {
				var index = $( '.comments-form .new-comment-rating .bars i' ).index( $( this ) ) + 1;

				$( this ).css({
					'transform': 'scale(1.1)'
				});

				for( var i = 0, n = index; i < n; i ++ ) {
					$( '.comments-form .new-comment-rating .bars i' ).eq( i ).addClass( 'full' );
				}

				for( var i = index, n = $( '.comments-form .new-comment-rating .bars i' ).length; i < n; i ++ ) {
					$( '.comments-form .new-comment-rating .bars i' ).eq( i ).removeClass( 'full' );
				}

				$( '.comments-form .new-comment-rating .value' ).text( '(' + index + '.0)' );
			});

			$( '.comments-form .new-comment-rating .bars i' ).on( 'mouseleave', function() {
				$( this ).css({
					'transform': 'scale(1)'
				});
			});

			$( '.comments-form .new-comment-rating .bars' ).on( 'mouseleave', function() {
				var index = parseInt( $( '.comments-form .new-comment-rating input[name="comment-rating"]' ).val() );

				for( var i = 0, n = index; i < n; i ++ ) {
					$( '.comments-form .new-comment-rating .bars i' ).eq( i ).addClass( 'full' );
				}

				for( var i = index, n = $( '.comments-form .new-comment-rating .bars i' ).length; i < n; i ++ ) {
					$( '.comments-form .new-comment-rating .bars i' ).eq( i ).removeClass( 'full' );
				}

				$( '.comments-form .new-comment-rating .value' ).text( '(' + index + '.0)' );
			});

			$( '.comments-form .new-comment-rating .bars i' ).on( 'click', function() {
				var index = $( '.comments-form .new-comment-rating .bars i' ).index( $( this ) ) + 1;

				$( '.comments-form .new-comment-rating .value' ).text( '(' + index + '.0)' );
				$( '.comments-form .new-comment-rating input[name="comment-rating"]' ).attr( 'value', index );
			});

			// Remove Highlighting
			$( document ).on( 'click', '.location-item.location-ajax', function() {
				if( !$( this ).hasClass( 'active-location' ) ) {
					$( '.results-list' ).removeClass( 'highlight-locations' );
				}
			});
		},

		fileAPI: function () {
			var input = $( '.gallery-images-block input[type="file"]' );

			function handleFileSelect() {
				if( window.File && window.FileList && window.FileReader ) {
					$( '.gallery-images-block .images-gallery .row' ).html( '' );
					$( '.gallery-images-block .images-gallery' ).addClass( 'has-content' );
					// $( '#ajax-property-form .removed-images' ).attr( 'value', '' );

					var files = event.target.files;
					var output = $( '.gallery-images-block .images-gallery .row' )[0];

					$( files ).each( function(index, value) {
						var file = value;

						var picReader = new FileReader();

						picReader.addEventListener( 'load', function( event ) {
							var picFile = event.target;
							var div = document.createElement( 'div' );
							div.className = 'thumbnail-preview';
							div.innerHTML = '<div class="image-wrapper"><span class="remove-image"></span><div class="image"><img src="' + picFile.result + '" /></div></div>';
							div.setAttribute( 'data-order-id', index );
							output.insertBefore( div, null );
						});


						picReader.readAsDataURL( file );
					});

				setTimeout(function(){
					var container = $( '.gallery-images-block .images-gallery .row' ),
					items = container.find( '.thumbnail-preview' );
					items.sort( function( a, b ){
						var an = parseInt( a.getAttribute( 'data-order-id' ) ),
						bn = parseInt( b.getAttribute( 'data-order-id' ) );

						if( an > bn ) {
							return 1;
						}
						if( an < bn ) {
							return -1;
						}
						return 0;
					});
					items.detach().appendTo( container );
				}, 100);
				}
			}

			$( '.section-dashboard .upload-property-form .gallery-images-block .block-title .add-images-btn' ).on( 'click', function() {
				input.trigger( 'click' );
			});

			if( input.length ) {
				input[0].addEventListener( 'change', handleFileSelect, false );
			}

			// Set Item Active
			$(document).delegate('.upload-property-form .thumbnail-preview', 'click', function(event){
				var files = document.getElementById('images').files,
					obj = $(this).closest('.thumbnail-preview');

				$('.upload-property-form .thumbnail-preview').removeClass('selected');
				$(this).addClass('selected');
				$('#ajax-property-form .featured-image').attr('value', files.item(obj.data( 'order-id' )).name);
			});

			// Remove Item From Upload List
			$( document ).on( 'click',  '.upload-property-form .thumbnail-preview .image-wrapper .remove-image', function( event ) {
				var files = input[0].files,
					obj = $(this).closest('.thumbnail-preview'),
					fileindex = $('.upload-property-form .removed-images').attr('value');

				$( '.upload-property-form .removed-images' ).attr( 'value', files.item( obj.data( 'order-id' ) ).name + ',' + fileindex );
				obj.remove();
			});

			$('.overlay').ajaxStart(function(){
				$(this).show();
				$(this).find(".progress").css({ top: $(window).height() / 2, left: $(window).width() / 2 });
			}).ajaxStop(function () {
				$(this).hide();
			});

			if( typeof ajaxurl !== 'undefined' ) {

				$( '.dashboard-form.upload-property-form' ).ajaxForm({
					beforeSubmit: function() {
						var requiredFields = $('#ajax-property-form .required-input').length;

						$( '#ajax-property-form .required-input' ).each( function( i, val ) {
							($(val).val() === "") ? $(val).addClass('input-error') : requiredFields--;

							if ($(val).hasClass('input-error')) {
								$(val).on('focus', function () {
									$(this).removeClass('input-error');
								});

								if ($(val).data('type') == "select-input") {
									$(val).on('click', function () {
										$(this).removeClass('input-error');
									});
								}
							}
						});

						if (requiredFields > 0) {
							$('html, body').animate({
								scrollTop: $('#ajax-property-form .input-error').eq(0).offset().top - 150
							}, 500);
						}
					},
					url : ajaxurl,
					type: 'POST',
					data: {action:'submit_new_location' },
					success : function(result){
						var obj = jQuery.parseJSON(result);
						if(obj.success) {
							var button = $('#ajax-property-form .location-submit-btn');
							var buttonText = button.attr('value');
							document.getElementById("ajax-property-form").reset();
							$('.form-input').removeClass('has-value').attr('value','');
							$('.tags-list').empty();
							$('.tag-list-input')[0].setAttribute('value','');
							$('.images-gallery .row.row-fit-10').empty();
							$('.images-gallery').removeClass('has-content');
							$('.amount').removeClass('is-set');
							$('.amount i').removeClass('full');
							$('.facilities-list').empty();
							tagList = [];
							button.attr('value', obj.success);
							setTimeout(function(){
								button.attr('value', buttonText);
							}, 2000);
						}
					}
				});
			}
		},

		fitVids: function () {
			$( 'body' ).fitVids();
		}
	};

	$( document ).ready( function () {
		teslaThemes.init();

		setTimeout( function () {
			$( 'body' ).addClass( 'dom-ready' );
		}, 300 );
	});
}( jQuery ));
