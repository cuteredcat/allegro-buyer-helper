var sellerCache = {};
moment.locale(chrome.i18n.getMessage('@@ui_locale'));

function updatePageContent(data, seller_id) {
	var $tree = $(data),
		seller_id = $($tree.find('.nav.main-tabs a')[0]).attr('href').match(/uid=(\d+)/i)[1],
		$user_info = $tree.find('.extendedHeader h2 > span'),
		$summary = $tree.find('.summaryBox');

	// create abhbox
	var abhbox = $('<div />', {
			class: 'abhbox vela'
		}),
		user_info = $('<div />', {
			class: 'abhbox-user-info'
		}).data('user', seller_id),
		rating = $('<div />', {
			class: 'abhbox-rating'
		}),
		summary = $('<div />', {
			class: 'abhbox-summary'
		});

	$($user_info.html()).appendTo(user_info);

	user_info.find('.uname').each(function(num, el) {
		// add 'user' to user data
		$(el).text(chrome.i18n.getMessage('abh_user') + ' ' + $(el).text());
	});

	var $additionalInfo = $summary.find('.additionalInfoBox ul');
	$additionalInfo.find('li').each(function(num, el) {
	    // replace date in user_info
		var date = $(el).text().match(/: ([0-9\.\,\/\\:\s]+)/i)[1];
		if (date) {
			$(el).html($(el).text().replace(date, '<strong>' + moment(date, "DD.MM.YYYY, HH:mm:ss").fromNow() + '</strong>'));
		}
	});

	$additionalInfo.appendTo(user_info);

	$($summary.find('.feedbacksSummary')).appendTo(summary);

	$summary.find('.innerGreenBox').appendTo(rating);
	$summary.find('.ratingSummary').appendTo(rating);

	user_info.appendTo(abhbox);
	rating.appendTo(abhbox);
	summary.appendTo(abhbox.find('.innerGreenBox'));

	var metr = $('<div />', {
			class: 'abhbox-metr'
		}),
		metr_scale = $('<div />', {
			class: 'abhbox-metr-scale'
		});

	abhbox.find('.innerGreenBox .igbCol1').wrap(metr);

	abhbox.find('.abhbox-rating .igbCol1').clone()
										  .addClass('scale')
										  .appendTo(abhbox.find('.abhbox-metr'));

	abhbox.find('.abhbox-metr .scale').wrap(metr_scale);
	abhbox.find('.abhbox-metr-scale').css('width', parseFloat(abhbox.find('.igbCol1 span').text()) + '%');

	var ratingWrapper = $('<div />', {
			class: 'abhbox-rating-wrapper'
		});

	abhbox.find('.starsWrapper').wrap(ratingWrapper);

	abhbox.appendTo($('section.offers article.abh-seller-' + seller_id + ' .details'));
}

function getSellerInfo(sellers, current) {
	if (sellers[current] in sellerCache) {
		updatePageContent(sellerCache[sellers[current]], sellers[current]);
	}
	else {
		// now find seller info, like this http://aukro.ua/show_user.php?uid=24743331
		$.ajax({
			url: '/show_user.php',
			data: {'uid': sellers[current]},
			datatype: 'html',
			success: function(data) {
				sellerCache[sellers[current]] = data;
				updatePageContent(data, sellers[current]);
			},
			complete: function() {
				getSellerInfo(sellers, current + 1);
			}
		});
	}
}

function addSellerInfo() {
	if ($('section.offers article:not(.abh-set)').length) {
		var sellers = [];

		// find seller id on catalog page for all offers
		$('section.offers article:not(.abh-set)').each(function(num, el) {
			var seller_id = $(el).find('.photo').data('popup')['s'];

			// append seller id to each offer
			$(el).addClass('abh-set abh-seller-' + seller_id);

			if (sellers.indexOf(seller_id) < 0) {
				sellers.push(seller_id);
			}
		});

		getSellerInfo(sellers, 0);
	}
}

var checkTimeout = null;
document.addEventListener('DOMSubtreeModified', function (e) {
	clearTimeout(checkTimeout);
	checkTimeout = setTimeout(addSellerInfo, 100);
}, false);
