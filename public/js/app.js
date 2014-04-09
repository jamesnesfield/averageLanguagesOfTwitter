/*************************************
//
// averagelanguageoftwitter app
//
**************************************/
'use strict';

var socket = io.connect(window.location.hostname);
var app = app || {};

$(function () {

	var max = Math.min($(window).width(), $(window).height());
	var data = [];
	var langs = [];
	var counts = [];
	var color = [];
	var arcs, donut, sliceLabel, arc;
	var chartInit = false;

	var initChart = function () {

		var r = max / 2.1;        // arc radius

		arc = d3.svg.arc().innerRadius(r - max / 6).outerRadius(r);
		donut = d3.layout.pie().sort(null);
		color = d3.scale.ordinal()
		.range(colorbrewer.Set3[counts.length]);

		var svg = d3.select('#chart').append('svg:svg')
			.attr('width', $(window).width()).attr('height', max);

		var arcGroup = svg.append('svg:g')
			.attr('class', 'arcGrp')
			.attr('transform', 'translate(' + ($(window).width() / 2) + ',' + (max / 2) + ')');

		var labelGroup = svg.append('svg:g')
			.attr('class', 'lblGroup')
			.attr('transform', 'translate(' + ($(window).width() / 2) + ',' + (max / 2) + ')');

	// DRAW ARC PATHS
		arcs = arcGroup.selectAll('path')
		.data(donut(counts));
		
		arcs.enter().append('svg:path')
		.attr('stroke', '#777')
		.attr('stroke-width', 0.5)
		.attr('fill', function (d, i) {return color(i); })
		.attr('d', arc)
		.each(function (d) {this._current = d; });

		if ( max > 767) {
			var centreGroup = svg.append('svg:g')
			.attr('class', 'ctrGroup')
			.attr('transform', 'translate(' + ($(window).width()  / 2) + ',' + (max / 2) + ')')
			.append('svg:text')
			.attr('dy', '.35em').attr('class', 'chartLabel')
			.attr('text-anchor', 'middle')
			.style('font-size', '36')
			.text('Live Languages of Twitter');
		}

// DRAW SLICE LABELS
		sliceLabel = labelGroup.selectAll('text')
			.data(donut(counts));
			
		sliceLabel.enter().append('svg:text')
		.attr('class', 'arcLabel')
		.attr('fill', function () {return '#FFF'; })
		.style('font-weight', '300')
		.style('font-size', '30')
		.attr('transform', function (d) {return 'translate(' + arc.centroid(d) + ')'; })
		.attr('text-anchor', 'middle')
		.text(function (d, i) {return max > 767 ? langs[i].full : langs[i].shortCode; });

		chartInit = true;
	}; // -- end of init chart -- //

	function arcTween(a) {
		var i = d3.interpolate(this._current, a);
		this._current = i(0);
		return function (t) {
			return arc(i(t));
		};
	}

	var getCounts = function (callback) {
		var c = [];
		for (var i = data.length - 1; i >= 0; i--) {
			c.push(data[i].count);
		}
		counts = c;
		callback();
	};

	var getLangs = function (callback) {
		var c = [];
		for (var i = data.length - 1; i >= 0; i--) {
			c.push({full: data[i].lang, shortCode: data[i].code});
		}
		langs =  c;
		callback();
	};

/* ****************************
			UPDATE
******************************* */

	function updateChart() {
		arcs.data(donut(counts)); // recompute angles, rebind data
		arcs.transition().ease('cubic-in-out').duration(2000).attrTween('d', arcTween);

		if (max > 767) {
			sliceLabel.data(donut(counts));
			sliceLabel.transition().ease('cubic-in-out').duration(2000)
			.attr('transform', function (d) {return 'translate(' + arc.centroid(d) + ')'; })
			.style('fill-opacity', function (d) {return d.value === 0 ? 1e-6 : 1; });
		}

		var HTMLmarkup = '';
		for (var i = counts.length - 1; i >= 0; i--) {
			HTMLmarkup += '<div class="col-sm-4"><div class="well" style="background-color:' + color(i) + ';"><div class="lang">' + langs[i].full + '</div><br><div class="count"> ' + counts[i] + '%</div></div></div>';
		}

		HTMLmarkup += '<div class="col-sm-4"><a class="btn btn-default btn-block jamesnesfield" href="http://jamesnesfield.com">jamesnesfield.com</a></div>';

		if (typeof shown === 'undefined') {
			$('#languages').hide().html(HTMLmarkup).fadeIn('slow', 'swing', function () {
				var shown = true;
			});
		} else {
			$('#languages').html(HTMLmarkup);
		}
	}

	socket.on('update', function (socketData) {

		data = socketData;
		getCounts(function () {
			getLangs(function () {
				if (!chartInit) {
					initChart();
				} else {
					updateChart();
				}
			});
		});
	});


// --- document ready --- //
});
// --- document ready --- //