# Contribution Guidelines

We welcome patches to the moj_slotpicker, as long as you follow these guidelines:

## Git workflow ##

- Pull requests must contain a succint, clear summary of what the user need is driving this feature change.
- Follow the GDS [Git styleguide](https://github.com/alphagov/styleguides/blob/master/git.md)
- Make a feature branch
- Ensure your branch contains logical atomic commits before sending a pull request
- Pull requests are manually unit tested. Please make sure all the tests in `tests/SpecRunner.html` pass
- You *may* rebase your branch after feedback if it's to include relevant updates from the master branch. We prefer a rebase here to a merge commit as we prefer a clean and straight history on master with discrete merge commits for features

## Copy ##

- Follow the GDS [style guide](https://www.gov.uk/designprinciples/styleguide)
- URLs should use hyphens, not underscores

## Code ##

- Must be readable with meaningful naming, eg no short hand single character variable names
- Follow the GDS [Ruby style guide](https://github.com/alphagov/styleguides/blob/master/ruby.md)

## Testing ##

Include/update unit tests in `tests/SpecRunner.html`.

## Versioning ##

We use [Semantic Versioning](http://semver.org/), and bump the version
on master only. **Please don't submit your own proposed version numbers**.