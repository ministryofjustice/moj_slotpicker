var fixturePath = 'slot-picker.html';

jasmine.getFixtures().fixturesPath = './src/includes';

describe('Helper method', function() {
  describe('formatIso', function() {
    var aDate = new Date('6 Feb, 1977');

    it('should return a string', function() {
      expect(typeof moj.Helpers.formatIso(aDate)).toEqual('string');
    });
    it('should accept a string', function() {
      expect(typeof moj.Helpers.formatIso('a string')).toEqual('string');
    });
    it('should return an ISO format string from a date', function() {
      expect(moj.Helpers.formatIso(aDate)).toEqual('1977-02-06');
    });
  });

  describe('dateFromIso', function() {
    var dateStr = '1977-02-06';

    it('should return a string', function() {
      expect(moj.Helpers.dateFromIso(dateStr) instanceof Date).toBe(true);
    });
    it('should return 6 Feb 1977 from the string "' + dateStr + '"', function() {
      expect(moj.Helpers.dateFromIso(dateStr)).toEqual(new Date('6 Feb, 1977'));
    });
  });

  describe('indexOf', function() {
    it('should return a number', function() {
      expect(typeof moj.Helpers.indexOf([9,8,7]), 7).toEqual('number');
    });
    it('should return the position of an item in the array', function() {
      expect(moj.Helpers.indexOf(['one', 'two', 'three'], 'three')).toEqual(2);
    });
    it('should return -1 when not found', function() {
      expect(moj.Helpers.indexOf(['one', 'two', 'three'], 'four')).toEqual(-1);
    });
  });

  describe('dateBookable', function() {
    var dates = ['1977-02-06', '1977-02-07', '1977-02-09'];

    it('should return true when an object is in the array', function() {
      expect(moj.Helpers.dateBookable(new Date('6 Feb, 1977'), dates)).toBe(true);
    });
    it('should return false when the object is not in the array', function() {
      expect(moj.Helpers.dateBookable(new Date('1 Feb, 1977'), dates)).toBe(false);
    });
  });

  describe('monthsInRange', function() {
    var dateRange = [new Date('1 Feb, 1977'), new Date('1 Mar, 1977'), new Date('1 Apr, 1977')];

    it('should return the first day of each month in range', function() {
      expect(moj.Helpers.monthsInRange(new Date('6 Feb, 1977'), new Date('21 Apr, 1977'))).toEqual(dateRange);
    });
  });

  describe('daysInRange', function() {
    it('should return amount days in range, inclusive of start and end of range', function() {
      expect(moj.Helpers.daysInRange(new Date('2 Jul, 2014'), new Date('10 Jul, 2014'))).toEqual(9);
    });
    it('should return a whole number regardless of time zone', function() {
      expect(moj.Helpers.daysInRange(new Date('27 Mar, 2014'), new Date('2 Apr, 2014'))).toEqual(7);
    });
  });
});

describe('Slot Picker', function() {
  var myPicker;

  beforeEach(function() {
    loadFixtures(fixturePath);
    myPicker = new moj.Modules._SlotPicker($('.SlotPicker'));
  });

  describe('fixture', function() {
    it('should contain myPicker', function() {
      expect(myPicker).toExist();
    });
  });

  describe('moj', function() {
    it('should be an object', function() {
      expect(typeof moj).toEqual('object');
    });
  });

  describe('moj.Modules', function() {
    it('should be an object', function() {
      expect(typeof moj.Modules).toEqual('object');
    });
  });

  describe('moj.Modules._SlotPicker', function() {
    it('should be an object', function() {
      expect(typeof moj.Modules._SlotPicker).toEqual('function');
    });
  });

  describe('getMonthPositions', function() {
    var nav = [
          {label:'March', pos:-56},
          {label:'April', pos:168},
          {label:'May', pos:392}
        ];

    it('should be a method', function() {
      expect(myPicker.getMonthPositions).toBeDefined();
    });
    it('should return an array of objects', function() {
      expect(myPicker.getMonthPositions(myPicker.settings.bookableTimes) instanceof Array).toBe(true);
    });
    it('should return an array of objects which contain date, label and pos', function() {
      expect(myPicker.getMonthPositions(myPicker.settings.bookableTimes)).toEqual(nav);
    });
  });

  describe('navLabel method', function() {
    it('should return an abbreviated string with the remaining characters wrapped in an element', function() {
      expect(myPicker.navLabel('January')).toContain('Jan<span class="BookingCalendar-navFull">uary</span>');
    });
  });

  describe('activateOriginalSlots method', function() {
    beforeEach(function() {
      loadFixtures(fixturePath);
      $('.SlotPicker-input option[value="2014-03-20-1400-1440"]:first').prop('selected', true);
      myPicker = new moj.Modules._SlotPicker($('.SlotPicker'));
    });

    it('should check the corresponding tick box', function() {
      expect($('.SlotPicker').find('input[value="2014-03-20-1400-1440"]')).toBeChecked();
    });
    it('should display the corresponding chosen box with details', function() {
      expect($('.SlotPicker').find('.SlotPicker-choice:first')).toContainText('Thursday 20 March');
    });
  });

  describe('move method', function() {
    var array;

    beforeEach(function() {
      array = ['a', 'b', 'c'];
    });

    it('should return an array', function() {
      expect(myPicker.move(array, 0, 0) instanceof Array).toBe(true);
    });
    it('should move an item up the index', function() {
      expect(myPicker.move(array, 1, 0)).toEqual(['b', 'a', 'c']);
    });
    it('should move an item down the index', function() {
      expect(myPicker.move(array, 0, 2)).toEqual(['b', 'c', 'a']);
    });
  });

  describe('displayTime method', function() {
    it('should return 8:45am from "0845"', function() {
      expect(myPicker.displayTime('0845')).toEqual('8:45am');
    });
    it('should return 12am from "0000"', function() {
      expect(myPicker.displayTime('0000')).toEqual('12am');
    });
    it('should return 1:45am from "0145"', function() {
      expect(myPicker.displayTime('0145')).toEqual('1:45am');
    });
    it('should return 12pm from "1200"', function() {
      expect(myPicker.displayTime('1200')).toEqual('12pm');
    });
    it('should return 5:30pm from "1730"', function() {
      expect(myPicker.displayTime('1730')).toEqual('5:30pm');
    });
  });

  describe('duration method', function() {
    var start1 = new Date(2014, 5, 1, 13, 55, 0),
        end1 = new Date(2014, 5, 1, 17, 0, 0),
        start2 = new Date(2014, 5, 1, 1, 0, 0),
        end2 = new Date(2014, 5, 1, 2, 0, 0),
        start3 = new Date(2014, 5, 1, 1, 0, 0),
        end3 = new Date(2014, 5, 1, 1, 30, 0);

    it('should return "30 mins"', function() {
      expect(myPicker.duration(start3, end3)).toEqual(' 30 mins');
    });
    it('should return "1 hr"', function() {
      expect(myPicker.duration(start2, end2)).toEqual('1 hr');
    });
    it('should return "3 hrs 5 mins"', function() {
      expect(myPicker.duration(start1, end1)).toEqual('3 hrs 5 mins');
    });
  });

  describe('timeFromSlot method', function() {
    var time = '0935';

    it('should return a valid date from 4 digit string', function() {
      expect(myPicker.timeFromSlot(time) instanceof Date).toBe(true);
    });
    it('should set hours to 9', function() {
      expect(myPicker.timeFromSlot(time).getHours()).toEqual(9);
    });
    it('should set minutes to 35', function() {
      expect(myPicker.timeFromSlot(time).getMinutes()).toEqual(35);
    });
  });

  describe('firstDayOfWeek method', function() {
    it('should return a date', function() {
      expect(myPicker.firstDayOfWeek(new Date()) instanceof Date).toBe(true);
    });
    it('should return Mon 28 Apr from Fri 2 May 2014', function() {
      expect(myPicker.firstDayOfWeek(new Date(2014, 4, 2))).toEqual(new Date(2014, 3, 28));
    });
    it('should return the same day if given a Monday', function() {
      expect(myPicker.firstDayOfWeek(new Date(2014, 4, 5))).toEqual(new Date(2014, 4, 5));
    });
  });

  describe('lastDayOfWeek method', function() {
    it('should return a date', function() {
      expect(myPicker.lastDayOfWeek(new Date()) instanceof Date).toBe(true);
    });
    it('should return Sun 6 Apr from Mon 31 Mar 2014', function() {
      expect(myPicker.lastDayOfWeek(new Date(2014, 2, 31))).toEqual(new Date(2014, 3, 6));
    });
    it('should return Sun 1 Jun from Thu 29 May 2014', function() {
      expect(myPicker.lastDayOfWeek(new Date(2014, 4, 29))).toEqual(new Date(2014, 5, 1));
    });
    it('should return the same day if given a Sunday', function() {
      expect(myPicker.lastDayOfWeek(new Date(2014, 4, 4))).toEqual(new Date(2014, 4, 4));
    });
  });

  describe('lastDayOfMonth method', function() {
    it('should return a date', function() {
      expect(myPicker.lastDayOfMonth(new Date()) instanceof Date).toBe(true);
    });
    it('should return 31 May from 29 May', function() {
      expect(myPicker.lastDayOfMonth(new Date(2014, 4, 29))).toEqual(new Date(2014, 4, 31));
    });
  });

  describe('buildDates method', function() {
    beforeEach(function() {
      loadFixtures(fixturePath);
      $('.SlotPicker').data('today', '2014-03-09');
      myPicker = new moj.Modules._SlotPicker($('.SlotPicker'));
    });

    it('should create a row for w/c 26 May when there is a bookable date in May', function() {
      expect($('.SlotPicker').find('.BookingCalendar-dateLink[data-date="2014-06-01"]')).toExist();
    });
    it('should create a for the current week when bookable days start on a Monday', function() {
      expect($('.SlotPicker').find('.BookingCalendar-dateLink[data-date="2014-06-01"]')).toExist();
    });
  });

  describe('dayLabel method', function() {
    it('should return the day, date and month as a string', function() {
      expect(myPicker.dayLabel(new Date('2 Jul, 2014'))).toEqual('Wednesday 2 July');
    });
  });

  describe('settings', function() {
    describe('optionLimit - the amount of slot choices', function() {
      it('should not have reached limit', function() {
        expect(myPicker.limitReached()).toBe(false);
      });
      it('should prevent further selections when default limit (3) is reached', function() {
        var slots = $('.SlotPicker').find('.SlotPicker-slot');
        for (var i = 0; i < 3; i++) {
          slots.eq(i).click();
        }
        expect(myPicker.limitReached()).toBe(true);
      });
    });
  });
});
