# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn dev` - Start development server with Turbopack
- `yarn build` - Build for production
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues automatically
- `yarn type-check` - Run TypeScript type checking without emitting files
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check code formatting without fixing

## Architecture Overview

This is a Next.js 15 app with App Router that demonstrates Web3 integration with Shape Network. The application is built as a modern dApp with:

### Core Stack

- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS** with Shadcn/ui component library
- **Web3 Integration** via Wagmi v2 and RainbowKit
- **React Query** for data fetching and caching

### Web3 Configuration

- Supports Shape Mainnet (chainId: 360) and Shape Sepolia (chainId: 11011)
- Uses Alchemy SDK for blockchain interactions
- Wallet connection handled by RainbowKit with WalletConnect support
- Chain configuration in `lib/web3.ts` with HTTP transports for each network

### Key Components Architecture

- `components/providers.tsx` - Root providers wrapper (WagmiProvider, QueryClient, RainbowKitProvider)
- `lib/config.ts` - Environment variable configuration
- `lib/clients.ts` - Alchemy client setup
- `hooks/` - Custom React hooks for Web3 operations and mobile detection
- `components/ui/` - Shadcn/ui component library (extensive set of pre-built components)

### Application Structure

The main page (`app/page.tsx`) renders three key components:

- `McpStatusPanel` - MCP (Model Context Protocol) status monitoring
- `AnalyticsDashboard` - Data visualization dashboard
- `ShapeNftViewer` - NFT display component

### Environment Requirements

Required environment variables:

- `NEXT_PUBLIC_ALCHEMY_KEY` - Alchemy API key
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - WalletConnect project ID
- `NEXT_PUBLIC_CHAIN_ID` - Target chain ID (360 for Shape Mainnet, 11011 for Shape Sepolia)

### API Routes

- `app/api/call-mcp-tool/route.ts` - MCP tool integration endpoint

When working with this codebase, prioritize Web3 best practices, maintain TypeScript types, and follow the existing patterns for component composition and state management.
