install: install-deps

install-deps:
	npm ci

lint:
	npx eslint .

start:
	npm run serve

test-coverage:
	npm test -- --coverage --coverageProvider=v8

publish:
	npm publish --dry-run

.PHONY: test
