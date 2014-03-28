# Slot Picker

A Web user interface for selecting 3 time slots in order of preference.

The interface consists of:

* a calendar (for selecting available days)
* a list of slots for the selected day
* a list of chosen slots

When a slot is selected the corresponding hidden option element is selected.

## How to use

`git clone https://github.com/ministryofjustice/slot-picker`

or

[Download the ZIP](https://github.com/ministryofjustice/moj_slotpicker/archive/902e148eee11ef276fb52d9117582e3b2ab6d8e6.zip) and use the `dist` folder.

## Mark-up

The Slot Picker expects source dates to be provided in the form of option elements with values as the slot data.

    <option value="2014-03-17-1400-1600">Monday, 17 March - 2:00pm</option>

The slot data is in the format `YYYY-MM-DD-HHMM-HHMM`, where the former time is the start of the slot and the latter time is the end.

Re-create the classname structure as shown in `/dist/index.html`.

Currently the component requires your app to generate each calendar day (see `.BookingCalendar-dates` and `.SlotPicker-days`).
