describe('Slot Picker', function() {
  var picker,
      myPicker;

  beforeEach(function() {
    loadFixtures('../../../../src/includes/slot-picker.html');
    moj.Modules.SlotPicker.init();
    myPicker = $('.SlotPicker');
    picker = myPicker.data('SlotPicker');
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

  describe('moj.Modules.SlotPicker', function() {
    it('should be an object', function() {
      expect(typeof moj.Modules.SlotPicker).toEqual('object');
    });
  });

  describe('setupNav', function() {
    var nav = [
          {label:'March', date:'#month-2014-03', pos:-56},
          {label:'April', date:'#month-2014-04', pos:168},
          {label:'May', date:'#month-2014-05', pos:392}
        ];

    it('should be a method', function() {
      expect(picker.setupNav).toBeDefined();
    });
    it('should return an array of objects', function() {
      expect(Object.prototype.toString.call(picker.setupNav(picker.$availableMonths))).toEqual('[object Array]');
    });
    it('should return an array of objects which contain date, label and pos', function() {
      expect(picker.setupNav(picker.$availableMonths)).toEqual(nav);
    })
  });

  describe('the amount of slot choices', function() {
    it('should be not have reached limit', function() {
      expect(picker.limitReached()).toEqual(false);
    });
  });

  describe('formatIso method', function() {
    var aDate = new Date('6 Feb, 1977');

    it('should return a string', function() {
      expect(typeof picker.formatIso(aDate)).toEqual('string');
    });
    it('should accept a string', function() {
      expect(typeof picker.formatIso('a string')).toEqual('string');
    });
    it('should return an ISO format string from a date', function() {
      expect(picker.formatIso(aDate)).toEqual('1977-02-06');
    });
  });

  describe('indexOf method', function() {
    it('should return a number', function() {
      expect(typeof picker.indexOf([9,8,7]), 7).toEqual('number');
    });
    it('should return the position of an item in the array', function() {
      expect(picker.indexOf(['one', 'two', 'three'], 'three')).toEqual(2);
    });
    it('should return -1 when not found', function() {
      expect(picker.indexOf(['one', 'two', 'three'], 'four')).toEqual(-1);
    });
  });

  describe('move method', function() {
    var array;

    beforeEach(function() {
      array = ['a', 'b', 'c'];
    });

    it('should return an array', function() {
      expect(Object.prototype.toString.call(picker.move(array, 0, 0))).toEqual('[object Array]');
    });
    it('should move an item up the index', function() {
      expect(picker.move(array, 1, 0)).toEqual(['b', 'a', 'c']);
    });
    it('should move an item down the index', function() {
      expect(picker.move(array, 0, 2)).toEqual(['b', 'c', 'a']);
    });
  });

  describe('displayTime method', function() {
    it('should return 12am from "0000"', function() {
      expect(picker.displayTime('0000')).toEqual('12am');
    });
    it('should return 1:45am from "0145"', function() {
      expect(picker.displayTime('0145')).toEqual('1:45am');
    });
    it('should return 12pm from "1200"', function() {
      expect(picker.displayTime('1200')).toEqual('12pm');
    });
    it('should return 5:30pm from "1730"', function() {
      expect(picker.displayTime('1730')).toEqual('5:30pm');
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
      expect(picker.duration(start3, end3)).toEqual(' 30 mins');
    });
    it('should return "1 hr"', function() {
      expect(picker.duration(start2, end2)).toEqual('1 hr');
    });
    it('should return "3 hrs 5 mins"', function() {
      expect(picker.duration(start1, end1)).toEqual('3 hrs 5 mins');
    });
  });

  describe('timeFromSlot method', function() {
    var time = '0935';

    it('should return a valid date from 4 digit string', function() {
      expect(Object.prototype.toString.call(picker.timeFromSlot(time))).toEqual('[object Date]');
    });
    it('should set hours to 9', function() {
      expect(picker.timeFromSlot(time).getHours()).toEqual(9);
    });
    it('should set minutes to 35', function() {
      expect(picker.timeFromSlot(time).getMinutes()).toEqual(35);
    });
  });

  describe('firstDayOfWeek', function() {
    it('should return a date', function() {
      expect(Object.prototype.toString.call(picker.firstDayOfWeek(new Date()))).toEqual('[object Date]');
    });
    it('should return Mon 28 Apr from Fri 2 May 2014', function() {
      expect(picker.firstDayOfWeek(new Date(2014, 4, 2))).toEqual(new Date(2014, 3, 28));
    });
    it('should return the same day if given a Monday', function() {
      expect(picker.firstDayOfWeek(new Date(2014, 4, 5))).toEqual(new Date(2014, 4, 5));
    });
  });

  describe('lastDayOfWeek', function() {
    it('should return a date', function() {
      expect(Object.prototype.toString.call(picker.lastDayOfWeek(new Date()))).toEqual('[object Date]');
    });
    it('should return Sun 1 Jun from Thu 29 May 2014', function() {
      expect(picker.lastDayOfWeek(new Date(2014, 4, 29))).toEqual(new Date(2014, 5, 1));
    });
    it('should return the same day if given a Sunday', function() {
      expect(picker.lastDayOfWeek(new Date(2014, 4, 5))).toEqual(new Date(2014, 4, 5));
    });
  });
});
