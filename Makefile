install: install-deps

install-deps:
	npm ci
	npm link

lint:
	npx eslint .

build:
	npm run build

start:
	npm run serve
