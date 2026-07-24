# StockPile - Smart Inventory & Waste Management System

A comprehensive, AI-powered food management system designed for school cafeterias and food service providers. StockPile optimizes inventory, reduces waste, and improves planning through intelligent analytics.

## Features

### 📋 Dashboard
- **Real-time Overview**: Quick insights into sales, waste, and inventory status.
- **AI Recommendation Engine**: Smart suggestions for optimizing stock and reducing spoilage.
- **Context-Aware Analytics**: Adjusts predictions based on weather, events, and holidays.

### 📦 Inventory Management
- **Full CRUD Operations**: Add, edit, and remove inventory items.
- **Expiry Tracking**: Monitor expiry dates and receive alerts for items nearing expiration.
- **Unit Conversion**: Supports multiple units of measurement (kg, lbs, pcs, etc.).
- **Reorder Points**: Automated alerts when stock levels are low.

### 🍔 Menu & Sales
- **Recipe Engine**: Define ingredients and quantities for each menu item.
- **Automatic Deductions**: Ingredient stock is automatically deducted when an item is sold.
- **Sales Tracking**: Record sales with context tags (e.g., "Campus Event", "Rainy Day").

### 🗑️ Waste Management
- **Detailed Logging**: Track what was wasted, why, and how much.
- **Disposition Routing**: Categorize waste (e.g., "Composted", "Disposed").
- **Cost Analysis**: Calculate financial losses due to food waste.
- **Food Recovery**: Track food donated or reused to reduce landfill waste.

### 🧪 Costing & Calculator
- **Break-Even Analysis**: Calculate the number of servings needed to cover costs.
- **Ingredient Costing**: Determine the exact cost of each menu item.
- **Profit Margin Analysis**: Set prices that ensure profitability.

### 📊 Reports & Analytics
- **Sales Reports**: Detailed breakdown of daily, weekly, and monthly sales.
- **Waste Reports**: Trends in food waste and cost implications.
- **Inventory Reports**: Stock valuation and usage analysis.
- **Custom Exports**: Generate and export data in CSV and JSON formats.

### 🤖 AI Assistant (StockPal AI)
- **Natural Language Interface**: Ask questions about your inventory in plain English.
- **Contextual Awareness**: Understands "today", "last week", and specific dates.
- **Smart Predictions**: Forecasts demand based on historical data and context.

### ⚙️ Settings
- **User Roles**: Manage staff and manager accounts.
- **Customization**: Configure menu items, categories, and units.
- **Data Management**: Export or clear all data as needed.

## Installation

### Prerequisites
- **Node.js**: >= 18.0.0
- **npm** or **Yarn**

### Steps

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd STHCIUX-StockPileDBMS
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

4.  **Access the application**
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Local Storage**: HTML5 Web Storage API for data persistence

## Project Structure

```
src/
├── app/
│   ├── App.tsx             # Main application component
│   ├── constants.ts        # Configuration and static data
│   ├── helpers.ts          # Utility functions
│   ├── recipeEngine.ts     # Business logic for recipe calculations
│   ├── persistence.ts      # Data storage and retrieval
│   ├── types.ts            # TypeScript type definitions
│   └── assets/             # Static assets
└── components/             # Reusable UI components
```

## Data Persistence

All data is stored locally in the browser's `localStorage` using the following keys:
- `stockpile-inventory`
- `stockpile-sales`
- `stockpile-waste`
- `stockpile-role`
- `stockpile-theme`

Data can be exported and imported via the Settings page.