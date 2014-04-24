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
});
