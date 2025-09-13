# Overview

This is a Discord bot application built with Node.js that serves as a Robux and Blox Fruits marketplace with integrated PIX payment processing. The bot has been successfully migrated from GhostsPay to Pushi-In Pay API while maintaining all existing functionality. It combines Discord bot interactions with Express.js web server capabilities for webhook handling and QR code generation for PIX payments.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Framework
- **Discord Bot Foundation**: Built on discord.js v14.21.0, providing comprehensive Discord API integration for bot functionality including slash commands, message handling, and guild management
- **Web Server Component**: Express.js v5.1.0 serves as the web framework, enabling HTTP endpoints for external integrations or web-based features
- **Environment Management**: dotenv for secure configuration management and API key storage

## Application Structure
- **Modular Design**: The application combines Discord bot functionality with web server capabilities, allowing for hybrid interactions
- **QR Code Integration**: qrcode library enables dynamic QR code generation, potentially for authentication tokens, invite links, or data sharing
- **HTTP Client**: Axios provides reliable HTTP request handling for external API communications

## Design Patterns
- **Event-Driven Architecture**: Discord.js uses event listeners for handling Discord events (messages, interactions, member joins, etc.)
- **RESTful Web Services**: Express.js likely implements REST endpoints for web-based interactions
- **Asynchronous Processing**: Node.js event loop handles concurrent Discord events and HTTP requests efficiently

## Security Approach
- **Token Management**: Environment variables store sensitive Discord bot tokens and API keys
- **Modular Configuration**: Separate configuration from code using dotenv for different deployment environments

# External Dependencies

## Discord Platform
- **Discord API**: Full integration through discord.js for bot operations, guild management, and user interactions
- **Discord Gateway**: Real-time event streaming for live bot responses

## Payment Processing
- **Pushi-In Pay API**: PIX payment processing for Brazilian market integration (migrated from GhostsPay)
- **Webhook System**: Real-time payment status notifications and automatic order processing
- **QR Code Generation**: PIX payment QR codes for customer checkout experience

## Web Technologies
- **HTTP Protocol**: Express.js handles incoming web requests and webhook endpoints
- **Authentication**: Secure API token management for payment gateway integration

## Network Services
- **External APIs**: Axios enables HTTP requests to Pushi-In Pay payment services
- **Web Standards**: Standard HTTP/HTTPS protocols for webhook and payment processing

## Runtime Environment
- **Node.js**: JavaScript runtime for server-side execution
- **NPM Ecosystem**: Package management for all dependencies and modules

# Recent Changes

## Payment Integration Migration (January 2025)
- **Replaced GhostsPay with Pushi-In Pay**: Complete payment gateway migration while preserving all bot functionality
- **New Payment Service**: Created `services/pushinpay.mjs` with full API integration
- **Updated Commands**: Modified `loja.mjs`, `lojarobux.mjs`, and `bot.mjs` to use new payment service
- **Webhook Migration**: Updated `webhook.mjs` to handle Pushi-In Pay webhook responses
- **Environment Configuration**: Configured PUSHINPAY_TOKEN, BOT_TOKEN, and ADMIN_ID secrets
- **Maintained Compatibility**: All existing commands (!vender, !vender2, !loja) work identically
- **Status**: Successfully deployed and operational

## PIX Payment Bug Fixes (January 15, 2025)
- **Fixed Value Conversion Error**: Corrected value handling in Pushi-In Pay API integration
- **Minimum Value Enforcement**: Implemented 50 centavos minimum value requirement per API documentation
- **API Parameter Correction**: Fixed value parameter to send integer centavos instead of float reais
- **Webhook Value Handling**: Aligned webhook response processing with API specifications
- **Error Resolution**: Resolved "O campo value deve ser um número" and minimum value validation errors

## New Pet Shop Command Implementation (January 15, 2025)
- **Added !lojapet Command**: Created new pet marketplace functionality based on user-provided template
- **Pushi-In Pay Integration**: Configured pet shop to use corrected Pushi-In Pay API service
- **Product Catalog**: Implemented 10 premium pets with rarity system and pricing
- **Roblox Verification**: Integrated real-time Roblox API verification for user accounts
- **File Structure**: Created `lojapet.mjs` module with complete pet shop functionality
- **Command Registration**: Added pet shop to main bot initialization and command listing

## Authentication Fix Implementation (January 15, 2025)
- **Token Configuration**: Added PUSHINPAY_TOKEN to Replit Secrets for secure storage
- **Debug Logging**: Enhanced PushinpayApiService with comprehensive authentication debugging
- **Error Resolution**: Fixed "Token não encontrado" authentication error with proper secret management
- **Production Ready**: Bot now properly authenticates with Pushi-In Pay API in production environment