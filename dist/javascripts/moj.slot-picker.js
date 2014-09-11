/**
 * moj.slot-picker - UI components for selecting time slots
 * @version v0.21.1
 * @link https://github.com/ministryofjustice/moj_slotpicker
 * @license OGL v2.0 - https://github.com/ministryofjustice/moj_slotpicker/blob/master/LICENCE.md
 */

(function() {
  'use strict';

  var SlotPicker = function($el, options) {
    this.settings = $.extend({}, this.defaults, options);
    this.settings.today = new Date(this.settings.today);
    this.cacheEls($el);
    this.consolidate();
    this.renderElements();
    this.cacheElsRendered($el);
    this.bindEvents();
    this.activateOriginalSlots(this.settings.originalSlots);
    this.settings.navMonths = this.getMonthPositions(this.settings.bookableTimes);
    this.updateNav(0);
    this.activateNextOption();
    return this;
  };

  SlotPicker.prototype = {
    
    defaults: {
      optionLimit: 3,
      singleUnavailableMsg: true,
      selections: 'has-selections',
      bookableDates: [],
      originalSlots: [],
      currentSlots: [],
      calendarDayHeight: 56,
      navPointer: 0,
      today: new Date(),
      scrollToFocus: true,
      days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      months: ['January','February','March','April','May','June','July','August','September','October','November','December']
    },

    cacheEls: function($el) {
      this.$_el = $el;
      
      this.$slotInputs = $('.SlotPicker-input', $el);
      this.$promoteHelp = $('.SlotPicker-promoteHelp', $el);
      this.$timeSlots = $('.SlotPicker-timeSlots', $el);
      this.$calMask = $('.BookingCalendar-mask', $el);
      this.$unbookableDays = $('.SlotPicker-day--past, .SlotPicker-day--unavailable, .SlotPicker-day--beyond, .SlotPicker-day--leadtime', $el);
    },

    cacheElsRendered: function($el) {
      this.$choice = $('.SlotPicker-choice', $el);
      this.$currentMonth = $('.BookingCalendar-currentMonth', $el);
    },

    bindEvents: function() {
      var self = this;

      this.$_el.on('click', '.SlotPicker-slot', function() {
        $('.SlotPicker-choices', self.$_el).addClass('is-chosen');
        self.emptyUiSlots();
        self.emptySlotInputs();
        self.unHighlightSlots();
        self.checkSlot($(this));
        self.processSlots();
        self.activateNextOption();
        self.disableCheckboxes(self.limitReached());
        self.togglePromoteHelp();
      });

      this.$_el.on('click', '.SlotPicker-icon--remove', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $($(this).data('slot-option')).click();
      });

      this.$_el.on('click', '.SlotPicker-icon--promote', function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.promoteSlot($(this));
      });

      this.$_el.on('click chosen', '.BookingCalendar-dateLink, .DateSlider-largeDates li', function(e) {
        e.preventDefault();
        self.selectDay($(this));
        self.highlightDate($(this));
        self.$timeSlots.addClass('is-active');
      });

      this.$_el.on('click', '.BookingCalendar-nav--next', function(e) {
        e.preventDefault();
        self.nudgeNav(1);
      });

      this.$_el.on('click', '.BookingCalendar-nav--prev', function(e) {
        e.preventDefault();
        self.nudgeNav(-1);
      });

      this.$_el.on('click', '.SlotPicker-choice.is-active', function() {
        $(this).addClass('is-clicked');
        // scroll - top of DateSlider
        self.confirmVisibility($('.DateSlider').first(), 'top');
      });

      this.$_el.on('click', '.SlotPicker-choice.is-chosen', function() {
        var date = $(this).find('.SlotPicker-icon--remove').data('slot-option').attr('id').split('slot-')[1].substr(0, 10);
        $('.BookingCalendar-dateLink[data-date="' + date + '"]').click();
      });
    },

    promoteSlot: function(slot) {
      var promoted = slot.closest('.SlotPicker-choice'),
          index = promoted.index('.SlotPicker-choice'),
          demoted = $('.SlotPicker-choice:eq(' + (index - 1) + ')'),
          h = promoted.find('.SlotPicker-choiceInner').height() + parseInt(promoted.find('.SlotPicker-choiceInner').css('padding-top')),
          self = this;
      
      var promote = function() {
        self.shiftSlot(index);
        self.processSlots();
      };

      var transition = function() {
        return Modernizr.csstransitions ? 300 : 0;
      };
      
      promoted.find('.SlotPicker-choiceContent').css('top', -h + 'px');
      demoted.find('.SlotPicker-choiceContent').css('top', h + 'px');

      setTimeout(function(){promote()}, transition());
    },

    renderElements: function() {
      var len = this.settings.bookableDates.length,
          from = this.settings.bookableDates[0],
          to = this.settings.bookableDates[len-1],
          $beyond = $('.SlotPicker-day--beyond'),
          tomorrow = new Date(this.settings.today.getTime());

      tomorrow.setDate(tomorrow.getDate() + 1);

      $('.SlotPicker-days', this.$_el).append(this.buildDays());
      $('.BookingCalendar-datesBody', this.$_el).append(this.buildDates(from, to));
      $('.SlotPicker-choices', this.$_el).prepend(this.buildChoices());
      $beyond.html($beyond.html().replace('{{ daysInRange }}', moj.Helpers.daysInRange(tomorrow, moj.Helpers.dateFromIso(to))));
    },

    getMonthPositions: function(dates) {
      var months = [], lastMonth, day, month;
      
      for (day in dates) {
        month = moj.Helpers.dateFromIso(day).getMonth();
        if (month !== lastMonth) {
          months.push({
            label: this.settings.months[month],
            pos: $('#month-' + day.substr(0, 7), this.$_el).closest('tr').index() * this.settings.calendarDayHeight
          });
        }
        lastMonth = month;
      }

      return months;
    },

    updateNav: function(i) {
      var prev = $('.BookingCalendar-nav--prev', this.$_el),
          next = $('.BookingCalendar-nav--next', this.$_el);

      if (i > 0) {
        prev.addClass('is-active');
        prev.html(this.navLabel(this.settings.navMonths[i - 1].label));
      } else {
        prev.removeClass('is-active');
      }

      if (i + 1 < this.settings.navMonths.length) {
        next.addClass('is-active');
        next.html(this.navLabel(this.settings.navMonths[i + 1].label));
      } else {
        next.removeClass('is-active');
      }

      this.$currentMonth.text(this.settings.navMonths[i].label);
    },

    navLabel: function(text) {
      var template = moj.Helpers.getTemplate('#BookingCalendar-tmplNav');

      return template({
        monthAbr: text.substr(0, 3),
        monthRemaining: text.substr(3)
      });
    },

    nudgeNav: function(i) {
      this.settings.navPointer = i + this.settings.navPointer;
      this.updateNav(this.settings.navPointer);
      this.$calMask.animate({
        scrollTop: this.settings.navMonths[this.settings.navPointer].pos
      }, 200);
    },

    consolidate: function() {
      var slots, i, times = [], day, days = [], previous;

      this.settings.originalSlots = this.$slotInputs.map(function() {
        var v = $(this).val();
        if (v !== '') {
          return v;
        }
      }).get();

      slots = this.$slotInputs.first().find('option').map(function() {
        var v = $(this).val();
        if (v !== '') {
          return v;
        }
      }).get();

      this.settings.bookableDates = $.map(slots, function(s) {
        return s.substr(0, 10);
      });
      
      for (i = 0; i < slots.length; i++) {
        day = this.splitDateAndSlot(slots[i])[0];

        if (previous !== day && i) {
          days[previous] = times;
          times = [];
        }

        times.push(this.splitDateAndSlot(slots[i])[1]);

        if (i === slots.length-1) {
          days[day] = times;
        }

        previous = day;
      }
      
      this.settings.bookableTimes = days;
    },

    selectDay: function(day) {
      var selector = this.chosenDaySelector(day.data('date'));

      $('.SlotPicker-day', this.$_el).removeClass('is-active');
      this.$unbookableDays.find('.SlotPicker-dayTitle').text(this.dayLabel(moj.Helpers.dateFromIso(day.data('date')))); // filthy hack
      $(selector).addClass('is-active').focus();

      // scroll - bottom of selected day
      this.confirmVisibility($(selector), 'bottom');
    },

    chosenDaySelector: function(dateStr) {
      var bookingFrom, bookingTo, date;
      
      if (moj.Helpers.dateBookable(dateStr, this.settings.bookableDates)) {
        return '#date-' + dateStr;
      }

      date = moj.Helpers.dateFromIso(dateStr);
      bookingFrom = moj.Helpers.dateFromIso(this.settings.bookableDates[0]);
      bookingTo = moj.Helpers.dateFromIso(this.settings.bookableDates[this.settings.bookableDates.length-1]);
      
      if (date < this.settings.today) {
        return '.SlotPicker-day--past';
      } else {
        if (date > bookingFrom) {
          if (date < bookingTo) {
            if (!this.settings.singleUnavailableMsg) {
              return '#date-' + dateStr;
            } else {
              return '.SlotPicker-day--unavailable';
            }
          } else {
            return '.SlotPicker-day--beyond';
          }
        } else {
          return '.SlotPicker-day--leadtime';
        }
      }
    },

    highlightDate: function(day) {
      $('.BookingCalendar-date--bookable.is-active', this.$_el).removeClass('is-active');
      day.closest('td').addClass('is-active');
    },

    togglePromoteHelp: function() {
      this.$promoteHelp[this.settings.currentSlots.length > 1 ? 'addClass' : 'removeClass']('is-active');
    },

    activateOriginalSlots: function(slots) {
      for (var i = 0; i < slots.length; i++) {
        $('.SlotPicker-slot[value="' + slots[i] + '"]', this.$_el).click();
      }
    },

    highlightSlot: function(slot) {
      slot.addClass('is-active');
    },

    unHighlightSlots: function() {
      $('.SlotPicker-label', this.$_el).removeClass('is-active');
    },

    emptyUiSlots: function() {
      this.$choice.removeClass('is-active is-chosen');
      this.$choice.find('.SlotPicker-icon--remove').removeData();
      this.$choice.find('.SlotPicker-date, .SlotPicker-time').text('');
    },

    emptySlotInputs: function() {
      this.$slotInputs.val('');
    },

    populateUiSlots: function(index, checkbox) {
      var label = checkbox.closest('.SlotPicker-label'),
          day = label.siblings('.SlotPicker-dayTitle').text(),
          time = label.find('.SlotPicker-time').text(),
          duration = label.find('.SlotPicker-duration').text(),
          $slot = this.$choice.eq(index);
      
      $slot.addClass('is-chosen');
      $slot.find('.SlotPicker-date').text(day);
      $slot.find('.SlotPicker-time').text(time + ', ' + duration);
      $slot.find('.SlotPicker-icon--remove').data('slot-option', checkbox);
      $slot.find('.SlotPicker-choiceContent').removeAttr('style');
    },

    populateSlotInputs: function(index, chosen) {
      $('.SlotPicker-input', this.$_el).eq(index).val(chosen);
    },
    
    processSlots: function() {
      var slots = this.settings.currentSlots,
          i, $slotEl;

      for (i = 0; i < slots.length; i++) {
        $slotEl = $('.SlotPicker-slot[value=' + slots[i] + ']', this.$_el);

        this.highlightSlot($slotEl.closest('label'));
        this.populateSlotInputs(i, $slotEl.val());
        this.populateUiSlots(i, $slotEl);
      }

      // scroll - bottom of added slot
      this.confirmVisibility(this.$choice.eq(slots.length-1), 'bottom');
    },

    limitReached: function() {
      return $('.SlotPicker-slot:checked', this.$_el).length >= this.settings.optionLimit;
    },

    disableCheckboxes: function(disable) {
      $('.SlotPicker-slot', this.$_el).not(':checked')
        .prop('disabled', disable)
        .closest('label')[disable ? 'addClass' : 'removeClass']('is-disabled');
    },

    splitDateAndSlot: function(str) {
      var bits = str.split('-'),
          time = bits.splice(-2, 2).join('-');
      
      return [bits.join('-'), time];
    },

    activateNextOption: function() {
      var index = this.settings.currentSlots.length;
      this.$choice.removeClass('is-active is-clicked');
      this.$choice.eq(index).addClass('is-active');
    },

    checkSlot: function(el) {
      if (el.is(':checked')) {
        this.addSlot(el.val());
      } else {
        this.removeSlot(el.val());
      }
    },

    addSlot: function(slot) {
      this.settings.currentSlots.push(slot);
      this.markDate(slot);
    },

    removeSlot: function(slot) {
      var pos = moj.Helpers.indexOf(this.settings.currentSlots, slot);
      
      this.settings.currentSlots.splice(pos, 1);
      this.markDate(slot);
    },

    shiftSlot: function(pos) {
      this.settings.currentSlots = this.move(this.settings.currentSlots, pos, pos - 1);
    },

    markDate: function(slot) {
      var day = this.splitDateAndSlot(slot)[0];
      
      $('[data-date=' + day + ']', this.$_el)[~this.settings.currentSlots.join('-').indexOf(day) ? 'addClass' : 'removeClass']('is-chosen');
    },

    move: function(array, old_index, new_index) {
      if (new_index >= array.length) {
        var k = new_index - array.length;
        while ((k--) + 1) {
          array.push(undefined);
        }
      }
      array.splice(new_index, 0, array.splice(old_index, 1)[0]);
      return array;
    },

    buildTimeSlots: function(date, slots) {
      var template = moj.Helpers.getTemplate('#SlotPicker-tmplTimeSlot'),
          i, out = '';

      for (i = 0; i < slots.length; i++) {
        out+= template({
          time: this.displayTime(slots[i].split('-')[0]),
          duration: this.duration( this.timeFromSlot(slots[i].split('-')[0]), this.timeFromSlot(slots[i].split('-')[1]) ),
          slot: [date,slots[i]].join('-')
        });
      }

      return out;
    },

    buildDays: function() {
      var template = moj.Helpers.getTemplate('#SlotPicker-tmplDay'),
          day, out = '', date,
          slots = this.settings.bookableTimes;

      for (day in slots) {
        date = moj.Helpers.dateFromIso(day);
        out+= template({
          date: this.settings.days[date.getDay()] +' '+ date.getDate() +' '+ this.settings.months[date.getMonth()],
          slot: day,
          slots: this.buildTimeSlots(day, slots[day]),
          oneSlot: slots[day].length === 1
        });
      }

      return out;
    },

    buildChoices: function() {
      var template = moj.Helpers.getTemplate('#SlotPicker-tmplChoice'),
          i, out = '',
          opts = this.settings.optionLimit;

      for (i = 1; i <= opts; i++) {
        out+= template({
          num: i,
          first: i === 1
        });
      }

      return out;
    },

    buildDates: function(from, to) {
      var templateRow = moj.Helpers.getTemplate('#BookingCalendar-tmplRow'),
          templateDate = moj.Helpers.getTemplate('#BookingCalendar-tmplDate'),
          out = '', row = '', curDate, curIso,
          todayIso = moj.Helpers.formatIso(this.settings.today),
          end = moj.Helpers.dateFromIso(to),
          count = 1;
      
      curDate = this.firstDayOfWeek(moj.Helpers.dateFromIso(from));
      end = this.lastDayOfWeek(this.lastDayOfMonth(end));

      if (curDate > this.settings.today) {
        curDate.setDate(curDate.getDate() - 7);
      }

      while (curDate <= end) {
        curIso = moj.Helpers.formatIso(curDate);

        row+= templateDate({
          date: curIso,
          day: curDate.getDate(),
          today: curIso === todayIso,
          newMonth: curDate.getDate() === 1,
          monthIso: curIso.substr(0, 7),
          monthShort: this.settings.months[curDate.getMonth()].substr(0,3),
          klass: moj.Helpers.dateBookable(curDate, this.settings.bookableDates) ? 'BookingCalendar-date--bookable' : 'BookingCalendar-date--unavailable'
        });

        if (count === 7) {
          out+= templateRow({
            cells: row
          });
          row = '';
          count = 0;
        }

        curDate.setDate(curDate.getDate() + 1);
        count++;
      }
      
      return out;
    },

    displayTime: function(time) {
      var hrs = parseInt(time.substr(0, 2), 10),
          mins = time.substr(2),
          out = hrs;

      if (hrs > 12) {
        out-= 12;
      }

      if (hrs === 0) {
        out = 12;
      }

      if (parseInt(mins)) {
        out+= ':' + mins;
      }

      return out+= (hrs > 11) ? 'pm' : 'am';
    },

    duration: function(start, end) {
      var out = '',
          diff = end.getTime() - start.getTime(),
          duration = new Date(diff);
      
      if (duration.getUTCHours()) {
        out+= duration.getUTCHours() + ' hr';
        if (duration.getUTCHours() > 1) {
          out+= 's';
        }
      }
      
      if (duration.getMinutes()) {
        out+= ' ' + duration.getMinutes() + ' min';
        if (duration.getMinutes() > 1) {
          out+= 's';
        }
      }

      return out;
    },

    timeFromSlot: function(slot) {
      var time = new Date();

      time.setHours(slot.substr(0, 2));
      time.setMinutes(slot.substr(2));

      return time;
    },

    firstDayOfWeek: function(date) {
      var day = date.getDay(),
          diff = date.getDate() - day + (day === 0 ? -6 : 1);

      return new Date(date.setDate(diff));
    },

    lastDayOfWeek: function(date) {
      var day = date.getDay(),
          diff = date.getDate() + (day ? 7 - day : 0);

      return new Date(date.setDate(diff));
    },

    lastDayOfMonth: function(date) {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    },

    dayLabel: function(date) {
      return [this.settings.days[date.getDay()], date.getDate(), this.settings.months[date.getMonth()]].join(' ');
    },

    isElementInViewport: function(el) {
      var rect = el.getBoundingClientRect();

      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },

    confirmVisibility: function($el, boundary) {
      if (!this.isElementInViewport($el.get(0)) && Modernizr.touch && this.settings.scrollToFocus) {
        this.moveIntoViewport($el, boundary);
      }
    },

    moveIntoViewport: function($el, boundary) {
      var top, bottom;

      if (boundary === 'top') {
        top = $el.offset().top;
        $('html, body').animate({
          scrollTop: top
        }, 350);
      } else {
        bottom = $el.offset().top + $el.outerHeight();
        $('html, body').animate({
          scrollTop: bottom - $(window).height()
        }, 350);
      }
    }

  };


  moj.Helpers.getTemplate = function(selector) {
    var $template = $(selector),
        compiled;

    if ($template.length) {
      compiled = Handlebars.compile($template.html());
    } else {
      throw 'SlotPicker error: ' + selector + ' template not found';
    }

    return compiled;
  };

  moj.Helpers.formatIso = function(date) {
    if (typeof date === 'string') {
      return date;
    }
    return [
      date.getFullYear(),
      ('0'+(date.getMonth()+1)).slice(-2),
      ('0'+date.getDate()).slice(-2)
    ].join('-');
  };

  moj.Helpers.dateFromIso = function(str) {
    var d = str.split('-');
    return new Date(d[0], d[1]-1, d[2]);
  };

  moj.Helpers.indexOf = function(array, obj) {
    for (var i = 0, j = array.length; i < j; i++) {
      if (array[i] === obj) { return i; }
    }
    return -1;
  };

  moj.Helpers.dateBookable = function(date, dates) {
    return !!~moj.Helpers.indexOf(dates, moj.Helpers.formatIso(date));
  };

  moj.Helpers.daysInRange = function(from, to) {
    var end = new Date(to.getTime());

    end.setDate(end.getDate() + 1); // inclusive of last day

    return Math.ceil((end - from) / (24 * 3600 * 1000));
  };


  moj.Modules.SlotPicker = {
    init: function() {
      return $('.SlotPicker').each(function() {
        $(this).data('SlotPicker', new SlotPicker($(this), $(this).data()));
      });
    }
  };

}());
