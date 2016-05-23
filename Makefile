install:
	@npm install .
test:
	@./node_modules/.bin/mocha test

.PHONY: test install