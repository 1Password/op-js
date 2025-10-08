PNPM := pnpm

.PHONY: help
help: ## Show this help message
	@echo "1Password op-js"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_/:-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: install i
install: ## Install dependencies
	@fnm use
	pnpm install

i: install

.PHONY: dev watch
dev: ## Start development mode (watch all files)
	@fnm use
	pnpm run watch

watch: dev

.PHONY: typecheck
typecheck: ## Type check code
	@fnm use
	pnpm run typecheck

.PHONY: build build/prod clean
build: ## Build the project (development)
	@fnm use
	pnpm run build

build/prod: ## Build the project for production
	@fnm use
	pnpm run build:prod

clean: ## Clean build artifacts
	rm -rf dist/

.PHONY: test
test: ## Run tests
	@fnm use
	pnpm test

.PHONY: lint
lint: ## Run ESLint
	@fnm use
	pnpm run eslint

.PHONY: format format/fix
format: ## Check code formatting with Prettier
	@fnm use
	pnpm run prettier

.PHONY: examples
examples: ## Run examples
	@fnm use
	pnpm run examples
